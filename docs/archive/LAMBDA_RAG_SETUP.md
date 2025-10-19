# Lambda RAG Setup Guide

## Overview

This is a cost-effective alternative to vector databases for small, static datasets.

**Cost**: ~$2-5/month (vs $100-700/month for vector databases)

## Architecture

```
Research Papers (PDFs)
    ↓
[Process Once] → Extract text → Chunk → Generate embeddings
    ↓
Store in S3 (research-embeddings.json)
    ↓
Lambda Function (loads into memory)
    ↓
Cosine similarity search
    ↓
Return context to Bedrock Agent
```

## Setup Steps

### 1. Install Python Dependencies

```bash
pip install -r scripts/requirements.txt
```

### 2. Process Research Papers

This extracts text, chunks it, and generates embeddings:

```bash
python scripts/process-research-papers.py backend/bedrock/knowledge-base/papers
```

**What it does:**
- Extracts text from all PDFs in the directory
- Splits into ~500 token chunks with 50 token overlap
- Generates embeddings using Bedrock Titan
- Uploads to S3: `s3://focusflow-bedrock-kb-dev/research-embeddings.json`

**Cost**: ~$0.50 one-time (for embeddings)

**Time**: ~2-5 minutes for 10-50 papers

### 3. Deploy Lambda Function

```bash
chmod +x scripts/deploy-research-rag.sh
./scripts/deploy-research-rag.sh
```

**What it does:**
- Installs Node.js dependencies
- Creates deployment package
- Deploys/updates Lambda function
- Configures environment variables
- Adds Bedrock permissions

### 4. Test the Lambda Function

```bash
aws lambda invoke \
  --function-name focusflow-research-rag-dev \
  --payload '{"inputText":"eye tracking accuracy and precision"}' \
  response.json

cat response.json | jq
```

**Expected output:**
```json
{
  "statusCode": 200,
  "body": {
    "context": "### Research Finding 1...",
    "chunks": [...],
    "query": "eye tracking accuracy and precision",
    "resultsCount": 5
  }
}
```

### 5. Connect to Bedrock Agent

Update your Bedrock Agent to use the Lambda function as an action group:

```javascript
// In infra/terraform/modules/bedrock/main.tf
resource "aws_bedrockagent_agent_action_group" "research_lookup" {
  agent_id = aws_bedrockagent_agent.focusflow.id
  agent_version = "DRAFT"
  action_group_name = "research-lookup"
  
  action_group_executor {
    lambda = "arn:aws:lambda:us-east-1:${data.aws_caller_identity.current.account_id}:function:focusflow-research-rag-dev"
  }
  
  api_schema {
    payload = jsonencode({
      openapi = "3.0.0"
      info = {
        title = "Research Lookup API"
        version = "1.0.0"
      }
      paths = {
        "/search" = {
          post = {
            description = "Search research papers for relevant information"
            parameters = []
            requestBody = {
              required = true
              content = {
                "application/json" = {
                  schema = {
                    type = "object"
                    properties = {
                      query = {
                        type = "string"
                        description = "The research question or topic to search for"
                      }
                      topK = {
                        type = "integer"
                        description = "Number of results to return (default: 5)"
                        default = 5
                      }
                    }
                    required = ["query"]
                  }
                }
              }
            }
            responses = {
              "200" = {
                description = "Successful response with research context"
                content = {
                  "application/json" = {
                    schema = {
                      type = "object"
                      properties = {
                        context = {
                          type = "string"
                          description = "Formatted research context"
                        }
                        resultsCount = {
                          type = "integer"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }
}

# Grant Bedrock Agent permission to invoke Lambda
resource "aws_lambda_permission" "bedrock_agent_research" {
  statement_id  = "AllowBedrockAgentInvoke"
  action        = "lambda:InvokeFunction"
  function_name = "focusflow-research-rag-dev"
  principal     = "bedrock.amazonaws.com"
  source_arn    = aws_bedrockagent_agent.focusflow.agent_arn
}
```

### 6. Update Agent Instructions

Add to your agent's instructions:

```
When analyzing eye-gaze data, you can search research papers for relevant 
scientific context using the research-lookup action. Use this to:

1. Validate findings against published research
2. Provide scientific explanations for observed patterns
3. Reference relevant studies in your analysis
4. Compare results to established benchmarks

Example: If you observe high fixation duration, search for "fixation duration 
cognitive load" to find relevant research context.
```

## Usage

Once set up, your Bedrock Agent can automatically search research papers:

**User**: "Analyze my eye-gaze session"

**Agent**: 
1. Calculates metrics from session data
2. Searches research papers: "eye tracking attention patterns"
3. Finds relevant chunks from papers
4. Compiles report with research-backed insights

## Maintenance

### Adding New Papers

1. Add PDF to `backend/bedrock/knowledge-base/papers/`
2. Re-run processing script:
   ```bash
   python scripts/process-research-papers.py backend/bedrock/knowledge-base/papers
   ```
3. Lambda automatically picks up new embeddings (cached for 1 hour)

### Updating Existing Papers

Same as adding new papers - just replace the PDF and reprocess.

### Monitoring

Check Lambda logs:
```bash
aws logs tail /aws/lambda/focusflow-research-rag-dev --follow
```

Check S3 storage:
```bash
aws s3 ls s3://focusflow-bedrock-kb-dev/ --human-readable
```

## Cost Breakdown

| Component | Monthly Cost |
|-----------|-------------|
| S3 Storage (embeddings) | ~$0.10 |
| Lambda invocations (1000/month) | ~$0.20 |
| Lambda compute (1GB, 1s avg) | ~$1.70 |
| Bedrock embeddings (updates) | ~$0.10 |
| **Total** | **~$2-5** |

Compare to:
- Aurora PostgreSQL: $100-150/month
- OpenSearch Serverless: $700/month

## Troubleshooting

### "No PDF files found"
- Check the path to papers directory
- Ensure PDFs are in the directory (not subdirectories)

### "Error generating embedding"
- Check Bedrock model access in AWS console
- Verify IAM permissions for Bedrock

### "Failed to load research embeddings"
- Check S3 bucket exists: `focusflow-bedrock-kb-dev`
- Verify embeddings file uploaded: `research-embeddings.json`
- Check Lambda has S3 read permissions

### Lambda timeout
- Increase memory (more memory = faster CPU)
- Reduce number of chunks (filter by date/relevance)
- Increase timeout to 60s

### Low similarity scores
- Check query phrasing (be specific)
- Verify embeddings generated correctly
- Consider adjusting chunk size

## Performance

- **Cold start**: ~2-3 seconds (first invocation)
- **Warm start**: ~200-500ms (subsequent invocations)
- **Search time**: ~50-100ms (in-memory)
- **Total latency**: ~300-600ms (warm)

For 1000 chunks:
- Memory usage: ~100-200MB
- Search time: ~50ms

## Scaling Limits

This approach works well up to:
- **10,000 chunks** (~50-100 papers)
- **500MB embeddings file**
- **100 concurrent requests**

Beyond this, consider:
- Aurora PostgreSQL with pgvector
- OpenSearch Serverless
- Pinecone or similar vector DB

## Next Steps

1. ✅ Process research papers
2. ✅ Deploy Lambda function
3. ✅ Test Lambda directly
4. ⏳ Connect to Bedrock Agent
5. ⏳ Test end-to-end with agent
6. ⏳ Monitor costs and performance
