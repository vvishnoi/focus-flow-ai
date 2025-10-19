# Knowledge Base Vector Store Options & Costs

## Summary of Attempts

We've tried multiple approaches to create a cost-effective Knowledge Base:

### 1. ❌ S3 Vectors (Preview) - **FAILED**
- **Cost**: ~$2/month (cheapest!)
- **Status**: Still in preview, not working reliably
- **Issues**: 
  - Regional availability problems
  - Permission errors even with correct IAM policies
  - Not production-ready

### 2. ❌ PostgreSQL RDS - **FAILED**
- **Cost**: ~$50/month (with NAT Gateway)
- **Status**: Bedrock requires Aurora PostgreSQL, not regular RDS
- **Issues**:
  - Bedrock only supports Aurora clusters (pattern: `arn:aws:rds:*:*:cluster:*`)
  - Regular RDS instances not supported
  - Would need to recreate as Aurora

### 3. ✅ Aurora PostgreSQL - **VIABLE** (but more expensive)
- **Cost**: ~$100-150/month
  - Aurora Serverless v2: ~$90/month (0.5 ACU minimum)
  - NAT Gateway: ~$32/month
  - Storage: ~$0.10/GB/month
- **Pros**:
  - Supported by Bedrock Knowledge Base
  - Serverless scaling
  - Better performance than RDS
- **Cons**:
  - More expensive than hoped
  - Still requires VPC/NAT setup

### 4. ✅ OpenSearch Serverless - **CURRENT** (expensive but works)
- **Cost**: ~$700/month
  - 2 OCUs minimum: ~$700/month
- **Pros**:
  - Fully managed
  - Works out of the box
  - No VPC required
  - Production-ready
- **Cons**:
  - Very expensive for a small project

## Recommendations

### Option A: Stick with OpenSearch Serverless (Current)
**Best for**: Getting it working now, worry about cost later

```bash
# Already partially set up in Terraform
# Just needs the security policy timing issue fixed
```

**Monthly Cost**: ~$700

### Option B: Switch to Aurora PostgreSQL Serverless v2
**Best for**: Lower cost while still being production-ready

```bash
# Need to:
1. Replace RDS instance with Aurora cluster in Terraform
2. Set up pgvector extension
3. Create Knowledge Base with Aurora
```

**Monthly Cost**: ~$100-150

### Option C: Wait for S3 Vectors GA
**Best for**: Minimum cost, but requires patience

```bash
# S3 Vectors is still in preview
# Wait for general availability
# Revisit in a few months
```

**Monthly Cost**: ~$2 (when it works)

### Option D: Use Alternative (Pinecone, Weaviate, etc.)
**Best for**: More control, potentially lower cost

- Pinecone: ~$70/month (starter plan)
- Weaviate Cloud: ~$25/month (sandbox)
- Self-hosted on EC2: ~$30-50/month

## My Recommendation

For your research project, I recommend **Option B: Aurora PostgreSQL Serverless v2**

**Why?**
1. **Cost-effective**: $100-150/month vs $700/month (85% savings)
2. **Production-ready**: Fully supported by AWS Bedrock
3. **Scalable**: Serverless v2 scales automatically
4. **Research-appropriate**: Good balance of cost and features

**Next Steps if you choose Aurora:**
1. I'll update the Terraform to use Aurora instead of RDS
2. Deploy the Aurora cluster (~10 minutes)
3. Set up pgvector extension
4. Create the Knowledge Base
5. Ingest research papers

Would you like me to proceed with Aurora PostgreSQL Serverless v2?

## Current Infrastructure Status

✅ **Created**:
- VPC with public/private subnets
- NAT Gateway
- Security groups
- Secrets Manager secret
- IAM roles and policies

❌ **Not Compatible**:
- PostgreSQL RDS instance (need Aurora cluster instead)

⏳ **Pending**:
- Knowledge Base creation
- Data source configuration
- Research paper ingestion
