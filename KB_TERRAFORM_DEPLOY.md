# Knowledge Base - Terraform Deployment

## 🚀 Deploy with Terraform (Automated!)

Instead of manual console setup, we can deploy everything with Terraform.

**Note**: This will create OpenSearch Serverless which costs ~$700/month. If you want the cheaper option (~$2/month), use the manual console setup instead.

---

## 💰 Cost Warning

This Terraform configuration creates:
- OpenSearch Serverless collection: **~$700/month**
- S3 storage: ~$1/month
- Bedrock queries: ~$50/month
- **Total: ~$751/month**

**Alternative**: Manual setup with Bedrock managed storage costs ~$2/month.

---

## 📋 Prerequisites

1. ✅ AWS CLI configured
2. ✅ Terraform installed
3. ✅ S3 bucket with research documents (already done)
4. ✅ IAM roles created (already done)

---

## 🔧 Deployment Steps

### Step 1: Review Configuration

```bash
cd infra/terraform

# Review what will be created
terraform plan
```

### Step 2: Deploy Knowledge Base

```bash
# Deploy everything
terraform apply

# Or target just the Knowledge Base resources
terraform apply \
  -target=module.bedrock.aws_opensearchserverless_security_policy.knowledge_base_encryption \
  -target=module.bedrock.aws_opensearchserverless_security_policy.knowledge_base_network \
  -target=module.bedrock.aws_opensearchserverless_collection.knowledge_base \
  -target=module.bedrock.aws_opensearchserverless_access_policy.knowledge_base \
  -target=module.bedrock.aws_bedrockagent_knowledge_base.research \
  -target=module.bedrock.aws_bedrockagent_data_source.research_papers
```

This will create:
- OpenSearch Serverless collection
- Security policies
- Knowledge Base
- Data source pointing to S3

**Wait ~5-10 minutes** for OpenSearch collection to be ready.

### Step 3: Get Knowledge Base Details

```bash
# Get Knowledge Base ID
terraform output knowledge_base_id

# Get Data Source ID
terraform output data_source_id

# Get all outputs
terraform output
```

### Step 4: Sync Data Source

After deployment, sync the data source to ingest documents:

```bash
# Get IDs from terraform output
KB_ID=$(terraform output -raw knowledge_base_id)
DS_ID=$(terraform output -raw data_source_id)

# Start ingestion job
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id $KB_ID \
  --data-source-id $DS_ID

# Check status
aws bedrock-agent get-ingestion-job \
  --knowledge-base-id $KB_ID \
  --data-source-id $DS_ID \
  --ingestion-job-id <JOB_ID_FROM_PREVIOUS_COMMAND>
```

Wait ~2-3 minutes for ingestion to complete.

### Step 5: Test Knowledge Base

```bash
KB_ID=$(terraform output -raw knowledge_base_id)

# Test query
aws bedrock-agent-runtime retrieve \
  --knowledge-base-id $KB_ID \
  --retrieval-query text="What are the benefits of eye gazing?" \
  --retrieval-configuration '{"vectorSearchConfiguration":{"numberOfResults":5}}'
```

You should see results from the Healthline article!

---

## 📊 What Gets Created

### Resources:
1. **OpenSearch Serverless Collection**
   - Type: VECTORSEARCH
   - Name: focusflow-kb-dev
   - Cost: ~$700/month

2. **Security Policies**
   - Encryption policy (AWS managed key)
   - Network policy (public access)
   - Data access policy

3. **Knowledge Base**
   - Name: focusflow-research-kb-dev
   - Embedding model: Titan Embeddings G1
   - Storage: OpenSearch Serverless

4. **Data Source**
   - Name: research-papers
   - S3 bucket: focusflow-bedrock-kb-dev
   - Chunking: Fixed size (300 tokens, 20% overlap)

---

## 🔍 Verification

### Check Resources

```bash
# List Knowledge Bases
aws bedrock-agent list-knowledge-bases

# Get Knowledge Base details
aws bedrock-agent get-knowledge-base \
  --knowledge-base-id $(terraform output -raw knowledge_base_id)

# List data sources
aws bedrock-agent list-data-sources \
  --knowledge-base-id $(terraform output -raw knowledge_base_id)

# Check OpenSearch collection
aws opensearchserverless list-collections
```

### Test Query

```bash
# Simple test
aws bedrock-agent-runtime retrieve \
  --knowledge-base-id $(terraform output -raw knowledge_base_id) \
  --retrieval-query text="eye gazing benefits" \
  --retrieval-configuration '{"vectorSearchConfiguration":{"numberOfResults":3}}' \
  | jq '.retrievalResults[].content.text'
```

---

## 🗑️ Cleanup (If Needed)

To destroy the Knowledge Base and save costs:

```bash
cd infra/terraform

# Destroy Knowledge Base resources
terraform destroy \
  -target=module.bedrock.aws_bedrockagent_data_source.research_papers \
  -target=module.bedrock.aws_bedrockagent_knowledge_base.research \
  -target=module.bedrock.aws_opensearchserverless_access_policy.knowledge_base \
  -target=module.bedrock.aws_opensearchserverless_collection.knowledge_base \
  -target=module.bedrock.aws_opensearchserverless_security_policy.knowledge_base_network \
  -target=module.bedrock.aws_opensearchserverless_security_policy.knowledge_base_encryption
```

This will remove the $700/month OpenSearch cost.

---

## 💡 Cost Optimization

### Option 1: Use This Terraform (Expensive)
- **Cost**: ~$700/month
- **Pros**: Fully automated, infrastructure as code
- **Cons**: Expensive for small document sets

### Option 2: Manual Console Setup (Cheap)
- **Cost**: ~$2/month
- **Pros**: 99.7% cheaper
- **Cons**: Manual setup (but only takes 5 minutes)
- **How**: Follow `BEDROCK_KB_SIMPLE_SETUP.md`

### Recommendation

For FocusFlow AI with 3-10 documents:
- **Use manual console setup** with Bedrock managed storage
- **Save $700/month**
- **Keep Terraform for other infrastructure**

You can always add the Knowledge Base to Terraform later if you need OpenSearch features.

---

## 🔧 Troubleshooting

### Issue: OpenSearch collection creation fails
**Solution**: Check AWS service quotas
```bash
aws service-quotas get-service-quota \
  --service-code aoss \
  --quota-code L-8F1A8E8F
```

### Issue: Knowledge Base creation fails
**Solution**: Ensure IAM role has correct permissions
```bash
aws iam get-role-policy \
  --role-name focusflow-kb-role-dev \
  --policy-name focusflow-kb-s3-policy-dev
```

### Issue: Data source sync fails
**Solution**: Check S3 bucket has files
```bash
aws s3 ls s3://focusflow-bedrock-kb-dev/papers/
```

### Issue: High costs
**Solution**: Use manual console setup instead
- Follow `BEDROCK_KB_SIMPLE_SETUP.md`
- Costs ~$2/month vs $700/month

---

## 📝 Summary

### Terraform Deployment:
- ✅ Fully automated
- ✅ Infrastructure as code
- ✅ Repeatable
- ❌ Expensive ($700/month)

### Manual Console Setup:
- ✅ Very cheap ($2/month)
- ✅ Same functionality
- ✅ Quick (5 minutes)
- ❌ Not in Terraform

### Recommendation:
**Use manual console setup for now, add to Terraform later if needed.**

---

**Ready to deploy?**

```bash
cd infra/terraform
terraform apply
```

Or use the cheaper manual option: `BEDROCK_KB_SIMPLE_SETUP.md`
