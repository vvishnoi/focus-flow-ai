# Cost-Effective Knowledge Base Setup Guide

## 💰 Cost Comparison

### OpenSearch Serverless (Expensive)
- **Cost**: ~$700/month minimum
- **Why**: Requires minimum 2 OCUs (OpenSearch Compute Units)
- **Overkill**: For 3-10 research documents

### Pinecone Free Tier (Recommended) ⭐
- **Cost**: $0/month (free tier)
- **Limits**: 1 index, 100K vectors, 1 pod
- **Perfect for**: Small document sets (3-50 papers)
- **Upgrade**: $70/month for standard tier if needed

### Alternative: Amazon MemoryDB
- **Cost**: ~$50/month
- **Good for**: Medium-scale deployments

## ✅ Recommended: Pinecone Free Tier

For FocusFlow AI with 3-10 research papers, Pinecone's free tier is perfect!

---

## 🚀 Setup Steps

### Step 1: Create Pinecone Account

1. Go to https://www.pinecone.io/
2. Click "Start Free"
3. Sign up with email
4. Verify email
5. Log in to Pinecone console

### Step 2: Create Pinecone Index

1. In Pinecone console, click "Create Index"
2. Configure:
   - **Name**: `focusflow-research`
   - **Dimensions**: `1536` (for Amazon Titan embeddings)
   - **Metric**: `cosine`
   - **Pod Type**: `starter` (free tier)
   - **Region**: Choose closest to your AWS region
3. Click "Create Index"
4. Wait for index to be ready (~2 minutes)

### Step 3: Get Pinecone API Credentials

1. In Pinecone console, go to "API Keys"
2. Copy your **API Key**
3. Copy your **Environment** (e.g., `us-east-1-aws`)
4. Copy your **Index Host** (e.g., `focusflow-research-xxxxx.svc.starter.pinecone.io`)

### Step 4: Store API Key in AWS Secrets Manager

```bash
# Store Pinecone API key in Secrets Manager
aws secretsmanager create-secret \
  --name bedrock/pinecone/api-key \
  --description "Pinecone API key for Bedrock Knowledge Base" \
  --secret-string '{
    "apiKey": "YOUR_PINECONE_API_KEY",
    "environment": "YOUR_PINECONE_ENVIRONMENT",
    "indexHost": "YOUR_INDEX_HOST"
  }'
```

### Step 5: Deploy IAM Roles via Terraform

```bash
cd infra/terraform

# This creates the IAM roles needed
terraform apply -target=module.bedrock.aws_iam_role.knowledge_base \
  -target=module.bedrock.aws_iam_role_policy.knowledge_base_s3 \
  -target=module.bedrock.aws_iam_role_policy.knowledge_base_model \
  -target=module.bedrock.aws_iam_role_policy.knowledge_base_secrets

# Get the role ARN
terraform output
```

### Step 6: Create Knowledge Base in AWS Console

1. Go to AWS Bedrock console
2. Navigate to "Knowledge bases" → "Create knowledge base"
3. Configure:

**Knowledge base details:**
- Name: `focusflow-research-kb-dev`
- Description: `Research papers on eye-gazing and attention training`
- IAM role: Select the role created by Terraform (`focusflow-kb-role-dev`)

**Vector database:**
- Select: `Pinecone`
- Connection string: Your Pinecone index host
- Credentials secret: `bedrock/pinecone/api-key`
- Namespace: Leave empty or use `research`
- Text field: `text`
- Metadata field: `metadata`

**Embeddings model:**
- Select: `Titan Embeddings G1 - Text`

4. Click "Next"

### Step 7: Add S3 Data Source

1. In the Knowledge Base, click "Add data source"
2. Configure:

**Data source details:**
- Name: `research-papers`
- Description: `Research papers from S3`

**S3 location:**
- Browse and select: `focusflow-bedrock-kb-dev`
- Prefix: `papers/` (or leave empty for all files)

**Chunking strategy:**
- Strategy: `Fixed-size chunking`
- Max tokens: `300`
- Overlap percentage: `20%`

3. Click "Add data source"

### Step 8: Sync Data Source

1. In the Knowledge Base, select the data source
2. Click "Sync"
3. Wait for sync to complete (~2-5 minutes)
4. Verify: Status should show "Synced"

### Step 9: Test Knowledge Base

1. In the Knowledge Base, go to "Test"
2. Try a query:
   ```
   What is the typical fixation duration for children aged 6-10?
   ```
3. You should get results from the Healthline article
4. Verify citations are included

---

## 📊 Verification

### Check Pinecone Index

1. Go to Pinecone console
2. Select your index
3. Check "Vectors" tab
4. You should see vectors created (one per chunk)

### Check AWS Bedrock

```bash
# List knowledge bases
aws bedrock-agent list-knowledge-bases

# Get knowledge base details
aws bedrock-agent get-knowledge-base \
  --knowledge-base-id <YOUR_KB_ID>

# List data sources
aws bedrock-agent list-data-sources \
  --knowledge-base-id <YOUR_KB_ID>
```

---

## 💡 Usage in Code

### Query Knowledge Base

```python
import boto3

bedrock_agent = boto3.client('bedrock-agent-runtime')

response = bedrock_agent.retrieve(
    knowledgeBaseId='YOUR_KB_ID',
    retrievalQuery={
        'text': 'What is the typical fixation duration for children?'
    },
    retrievalConfiguration={
        'vectorSearchConfiguration': {
            'numberOfResults': 5
        }
    }
)

for result in response['retrievalResults']:
    print(f"Content: {result['content']['text']}")
    print(f"Score: {result['score']}")
    print(f"Location: {result['location']}")
```

### Use with Bedrock Agent

The Knowledge Base will automatically be available to your Bedrock Agent once connected.

---

## 🔄 Adding More Documents

### Upload New Papers

```bash
# Upload new paper
aws s3 cp new-paper.pdf s3://focusflow-bedrock-kb-dev/papers/

# Sync Knowledge Base (via console or CLI)
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id <YOUR_KB_ID> \
  --data-source-id <YOUR_DATA_SOURCE_ID>
```

### Update Metadata

```bash
# Update metadata file
aws s3 cp backend/bedrock/knowledge-base/research-metadata.json \
  s3://focusflow-bedrock-kb-dev/metadata/
```

---

## 📈 Monitoring

### Pinecone Dashboard
- Monitor vector count
- Check query performance
- View usage metrics

### AWS CloudWatch
- Monitor Bedrock API calls
- Track embedding costs
- Monitor retrieval latency

---

## 💰 Cost Breakdown

### Free Tier (Pinecone)
- Pinecone: $0/month
- S3 storage: ~$1/month
- Bedrock embeddings: ~$0.10 per 1M tokens
- Bedrock queries: ~$0.002 per query
- **Total**: ~$1-5/month

### If You Outgrow Free Tier
- Pinecone Standard: $70/month
- Still 93% cheaper than OpenSearch!

---

## 🎯 Next Steps

After setup:
1. ✅ Knowledge Base is ready
2. ✅ Can query research papers
3. ✅ Ready to integrate with Bedrock Agent
4. Move to **Task 2: Create Bedrock Agent with Knowledge Base**

---

## 🐛 Troubleshooting

### Issue: Pinecone connection fails
**Solution**: Check API key in Secrets Manager
```bash
aws secretsmanager get-secret-value \
  --secret-id bedrock/pinecone/api-key
```

### Issue: No results from queries
**Solution**: Ensure data source is synced
- Go to AWS Console → Bedrock → Knowledge Base
- Check sync status
- Re-sync if needed

### Issue: Embeddings fail
**Solution**: Check IAM permissions
- Ensure role has `bedrock:InvokeModel` permission
- Check embedding model is available in your region

---

## ✅ Success Criteria

- [ ] Pinecone index created
- [ ] API key stored in Secrets Manager
- [ ] IAM roles deployed
- [ ] Knowledge Base created in AWS
- [ ] S3 data source added
- [ ] Data synced successfully
- [ ] Test query returns results
- [ ] Citations included in results

**Once complete, you have a cost-effective, production-ready Knowledge Base!** 🎉
