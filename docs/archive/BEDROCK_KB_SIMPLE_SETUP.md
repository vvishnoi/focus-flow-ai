# Bedrock Knowledge Base - Simple Setup (5 Minutes)

## 💰 Cost: ~$2-10/month

No vector database needed! Bedrock handles everything.

---

## 🚀 Setup Steps

### Step 1: Deploy IAM Roles (1 minute)

```bash
cd infra/terraform

terraform apply \
  -target=module.bedrock.aws_iam_role.knowledge_base \
  -target=module.bedrock.aws_iam_role_policy.knowledge_base_s3 \
  -target=module.bedrock.aws_iam_role_policy.knowledge_base_model

# Get the role ARN (you'll need this)
terraform output knowledge_base_role_arn
```

### Step 2: Create Knowledge Base in AWS Console (4 minutes)

1. **Go to AWS Bedrock Console**
   - Navigate to: https://console.aws.amazon.com/bedrock/
   - Click "Knowledge bases" in left menu
   - Click "Create knowledge base"

2. **Knowledge base details**
   - Name: `focusflow-research-kb-dev`
   - Description: `Research papers on eye-gazing and attention training`
   - IAM role: Select `focusflow-kb-role-dev` (created by Terraform)
   - Click "Next"

3. **Data source**
   - Data source name: `research-papers`
   - S3 URI: `s3://focusflow-bedrock-kb-dev/papers/`
   - Click "Next"

4. **Embeddings model**
   - Select: `Titan Embeddings G1 - Text`
   - Click "Next"

5. **Vector store**
   - **Select: "Amazon Bedrock managed storage"** ⭐
   - This is the key! No vector database needed!
   - Click "Next"

6. **Review and create**
   - Review settings
   - Click "Create knowledge base"

7. **Sync data source**
   - After creation, click "Sync"
   - Wait 2-3 minutes for sync to complete
   - Status should show "Synced"

### Step 3: Test Knowledge Base (1 minute)

1. In the Knowledge Base, click "Test"
2. Try a query:
   ```
   What are the benefits of eye gazing?
   ```
3. You should get results from the Healthline article!

---

## ✅ That's It!

You now have a fully functional Knowledge Base for **~$2-10/month**!

---

## 📊 What You Get

### Features:
- ✅ Semantic search over research papers
- ✅ AI-powered retrieval
- ✅ Citations included
- ✅ Works with Bedrock Agent
- ✅ Fully managed by AWS

### Cost Breakdown:
- Embeddings: $0.005 (one-time for 10 docs)
- Queries: $0.002 per query
- S3 storage: $0.0002/month
- **Total: ~$2/month for 1000 queries**

### Comparison:
- OpenSearch: $700/month ❌
- Kendra: $810/month ❌
- Bedrock Managed: $2/month ✅

**99.7% cost savings!** 🎉

---

## 🔧 Using the Knowledge Base

### Get Knowledge Base ID

```bash
# List knowledge bases
aws bedrock-agent list-knowledge-bases

# Copy the knowledgeBaseId from the output
```

### Query from Code

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
    print(f"Source: {result['location']['s3Location']['uri']}")
```

### Use with Bedrock Agent

The Knowledge Base will automatically be available to your Bedrock Agent once you connect it.

---

## 📈 Adding More Documents

### Upload New Paper

```bash
# Upload to S3
aws s3 cp new-paper.pdf s3://focusflow-bedrock-kb-dev/papers/

# Sync Knowledge Base
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id YOUR_KB_ID \
  --data-source-id YOUR_DATA_SOURCE_ID
```

### Update Metadata

```bash
# Update metadata file
aws s3 cp backend/bedrock/knowledge-base/research-metadata.json \
  s3://focusflow-bedrock-kb-dev/metadata/
```

---

## 🐛 Troubleshooting

### Issue: Can't find IAM role
**Solution**: Run terraform apply to create it
```bash
cd infra/terraform
terraform apply -target=module.bedrock.aws_iam_role.knowledge_base
```

### Issue: Sync fails
**Solution**: Check S3 bucket permissions
- Ensure role has s3:GetObject permission
- Verify files exist in S3

### Issue: No results from queries
**Solution**: Ensure data source is synced
- Go to Knowledge Base → Data sources
- Click "Sync"
- Wait for completion

---

## 💡 Tips

### Best Practices:
1. **Organize documents**: Use folders in S3 (papers/, extracted/)
2. **Update metadata**: Keep research-metadata.json current
3. **Monitor costs**: Check AWS Cost Explorer
4. **Test queries**: Use console to test before coding

### Optimization:
1. **Chunk size**: Default 300 tokens works well
2. **Overlap**: 20% overlap prevents context loss
3. **File formats**: PDF, TXT, HTML all supported
4. **Metadata**: Add metadata to improve search

---

## 🎯 Next Steps

After setup:
1. ✅ Knowledge Base is ready
2. ✅ Can query research papers
3. ✅ Ready to integrate with Bedrock Agent
4. Move to **Task 2: Create Bedrock Agent with Knowledge Base**

---

## 📝 Summary

### What We Did:
- ✅ Created IAM roles via Terraform
- ✅ Created Knowledge Base via Console
- ✅ Used Bedrock Managed Storage (no vector DB!)
- ✅ Synced research documents
- ✅ Tested queries

### What We Saved:
- **$700/month** by not using OpenSearch
- **$810/month** by not using Kendra
- **Total savings: 99.7%**

### What We Got:
- Fully functional Knowledge Base
- Semantic search with AI
- Citations and sources
- Ready for production

**Cost: ~$2-10/month** 🎉

---

**Knowledge Base Setup: COMPLETE!** ✅

**Ready to integrate with Bedrock Agent!**
