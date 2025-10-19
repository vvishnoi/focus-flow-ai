# Cost-Effective Knowledge Base Design for Eye-Gaze Research

## Your Use Case
- **Static data**: Research papers (PDFs) - rarely change
- **Query frequency**: Low to medium (per session analysis)
- **Data size**: Small (~10-50 papers)
- **Purpose**: Provide research context to Bedrock Agent

## Recommended Solution: **Lambda + S3 RAG (No Vector DB)**

### Architecture
```
User Session → Bedrock Agent → Lambda Function → S3 (Pre-processed chunks) → Claude
                                      ↓
                              Simple keyword/semantic search
                              (using embeddings in memory)
```

### Why This Works Best

1. **No Vector Database Needed**
   - Your dataset is small (< 50 papers)
   - Can load all embeddings into Lambda memory
   - No ongoing database costs

2. **Pre-process Once, Use Forever**
   - Extract text from PDFs offline
   - Generate embeddings once
   - Store in S3 as JSON
   - Lambda loads and searches in-memory

3. **Cost Breakdown**
   - S3 storage: ~$0.10/month (for processed chunks)
   - Lambda invocations: ~$1-5/month (depending on usage)
   - Bedrock embeddings: ~$0.10/month (one-time + updates)
   - **Total: ~$1-5/month** 💰

## Implementation Design

### Option A: Simple Lambda RAG (Recommended)
**Best for**: Your use case - small dataset, cost-sensitive

```javascript
// Lambda function that Bedrock Agent calls
exports.handler = async (event) => {
  // 1. Load pre-computed embeddings from S3 (cached in Lambda)
  const paperChunks = await loadFromS3('research-chunks.json');
  
  // 2. Get query from Bedrock Agent
  const query = event.query;
  
  // 3. Simple cosine similarity search in-memory
  const relevantChunks = findTopK(query, paperChunks, k=5);
  
  // 4. Return context to Agent
  return {
    context: relevantChunks.map(c => c.text).join('\n\n')
  };
};
```

**Monthly Cost**: ~$2-5
**Setup Time**: 2-3 hours
**Maintenance**: Minimal

### Option B: Bedrock Knowledge Base with Aurora
**Best for**: If you need AWS-managed solution and plan to scale

```
Bedrock Agent → Knowledge Base → Aurora PostgreSQL Serverless v2
```

**Monthly Cost**: ~$100-150
**Setup Time**: 1 hour (Terraform)
**Maintenance**: AWS-managed

### Option C: OpenSearch Serverless
**Best for**: Enterprise with budget, need advanced search

**Monthly Cost**: ~$700
**Setup Time**: 30 minutes
**Maintenance**: Fully managed

## My Strong Recommendation: **Option A - Lambda RAG**

### Why?
1. **Your dataset is small**: 10-50 papers = ~500-2500 chunks
2. **Fits in Lambda memory**: 512MB-1GB is plenty
3. **Fast enough**: In-memory search is < 100ms
4. **No infrastructure**: Just Lambda + S3
5. **95% cost savings**: $5/month vs $100-700/month

### When to Upgrade?
- Dataset grows > 10,000 chunks
- Need sub-50ms latency
- Need advanced filtering/faceting
- Multiple concurrent users (> 100/sec)

## Implementation Plan

### Phase 1: Pre-process Research Papers (One-time)
```bash
# 1. Extract text from PDFs
python scripts/extract-pdf-text.py

# 2. Chunk text (500 tokens each)
python scripts/chunk-documents.py

# 3. Generate embeddings using Bedrock
python scripts/generate-embeddings.py

# 4. Upload to S3
aws s3 cp research-chunks.json s3://focusflow-bedrock-kb-dev/
```

**Cost**: ~$0.50 one-time

### Phase 2: Create Lambda RAG Function
```javascript
// backend/functions/research-rag/index.js
const AWS = require('aws-sdk');
const s3 = new S3();

let cachedChunks = null;

async function loadChunks() {
  if (cachedChunks) return cachedChunks;
  
  const data = await s3.getObject({
    Bucket: 'focusflow-bedrock-kb-dev',
    Key: 'research-chunks.json'
  }).promise();
  
  cachedChunks = JSON.parse(data.Body.toString());
  return cachedChunks;
}

function cosineSimilarity(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

exports.handler = async (event) => {
  const chunks = await loadChunks();
  const queryEmbedding = event.embedding; // From Bedrock
  
  // Find top 5 most relevant chunks
  const scored = chunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, chunk.embedding)
  }));
  
  scored.sort((a, b) => b.score - a.score);
  const topChunks = scored.slice(0, 5);
  
  return {
    context: topChunks.map(c => 
      `[${c.paper}] ${c.text}`
    ).join('\n\n---\n\n')
  };
};
```

**Cost**: ~$2/month for Lambda

### Phase 3: Connect to Bedrock Agent
```javascript
// Agent action group calls Lambda
{
  "actionGroupName": "research-lookup",
  "actionGroupExecutor": {
    "lambda": "arn:aws:lambda:us-east-1:xxx:function:research-rag"
  },
  "apiSchema": {
    "payload": "{ ... }" // Define search API
  }
}
```

**Cost**: Included in Bedrock Agent

## Total Cost Comparison

| Solution | Monthly Cost | Setup Time | Best For |
|----------|-------------|------------|----------|
| **Lambda RAG** | **$2-5** | 2-3 hours | Your use case ✅ |
| Aurora PostgreSQL | $100-150 | 1 hour | Future scaling |
| OpenSearch | $700 | 30 min | Enterprise |
| S3 Vectors (preview) | $2 | 1 hour | When GA |

## Decision Matrix

**Choose Lambda RAG if:**
- ✅ Dataset < 10,000 chunks
- ✅ Budget-conscious
- ✅ Low-medium query volume
- ✅ Can spend 2-3 hours on setup

**Choose Aurora if:**
- ❌ Dataset > 10,000 chunks
- ❌ Need AWS-managed solution
- ❌ Budget allows $100-150/month
- ❌ Want quick Terraform setup

**Choose OpenSearch if:**
- ❌ Enterprise budget
- ❌ Need advanced search features
- ❌ High query volume (>1000/sec)

## My Final Recommendation

**Go with Lambda RAG** for now. Here's why:

1. **Perfect fit**: Your use case is exactly what this is designed for
2. **Massive savings**: $5/month vs $100-700/month
3. **Simple**: No VPC, no database, just Lambda + S3
4. **Fast enough**: < 100ms search time
5. **Easy to upgrade**: If you outgrow it, migrate to Aurora later

The research papers are static reference material, not a dynamic database. You don't need the overhead of a vector database for this.

**Want me to implement the Lambda RAG solution?** I can have it working in 2-3 hours with:
- PDF text extraction
- Chunking and embedding generation
- Lambda function with in-memory search
- Integration with your Bedrock Agent

This will save you $95-695/month compared to the other options! 🎉
