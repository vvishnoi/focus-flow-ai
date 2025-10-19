# Knowledge Base with PostgreSQL RDS Setup

## Cost Comparison

- **OpenSearch Serverless**: ~$700/month
- **PostgreSQL RDS (db.t3.micro)**: ~$20-30/month ✅
- **S3 Vectors**: ~$2/month (but still in preview, not working reliably)

## What We're Creating

1. **VPC**: Simple VPC with public/private subnets for RDS
2. **PostgreSQL RDS**: db.t3.micro instance with pgvector extension
3. **Secrets Manager**: Stores database credentials securely
4. **IAM Policies**: Allows Bedrock to access RDS and Secrets Manager

## Deployment Steps

### 1. Initialize and Plan

```bash
cd infra/terraform
terraform init
terraform plan
```

### 2. Apply Infrastructure

```bash
terraform apply
```

This will create:
- VPC with 2 public and 2 private subnets
- NAT Gateway for private subnet internet access
- PostgreSQL RDS instance (takes ~10 minutes)
- Secrets Manager secret with credentials

### 3. Get RDS Details

```bash
# Get the RDS endpoint
terraform output kb_postgres_endpoint

# Get the secret ARN
terraform output kb_postgres_secret_arn

# Get the RDS ARN
terraform output kb_postgres_arn
```

### 4. Enable pgvector Extension

Once RDS is created, connect and enable pgvector:

```bash
# Get credentials from Secrets Manager
aws secretsmanager get-secret-value \
  --secret-id focusflow-kb-postgres-dev \
  --query SecretString \
  --output text | jq -r

# Connect to RDS (you'll need to be in the VPC or use a bastion host)
psql -h <RDS_ENDPOINT> -U kbadmin -d knowledge_base

# Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

# Create the embeddings table
CREATE TABLE IF NOT EXISTS embeddings (
  id SERIAL PRIMARY KEY,
  content TEXT,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# Create an index for faster similarity search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

### 5. Create Knowledge Base via CLI

```bash
# Get the values from Terraform outputs
RDS_ARN=$(terraform output -raw kb_postgres_arn)
SECRET_ARN=$(terraform output -raw kb_postgres_secret_arn)

# Create the Knowledge Base
aws bedrock-agent create-knowledge-base \
  --name "focusflow-kb-dev" \
  --description "Eye-gaze research knowledge base for FocusFlow" \
  --role-arn "arn:aws:iam::394686422000:role/focusflow-kb-role-dev" \
  --knowledge-base-configuration '{
    "type": "VECTOR",
    "vectorKnowledgeBaseConfiguration": {
      "embeddingModelArn": "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v1"
    }
  }' \
  --storage-configuration "{
    \"type\": \"RDS\",
    \"rdsConfiguration\": {
      \"resourceArn\": \"${RDS_ARN}\",
      \"credentialsSecretArn\": \"${SECRET_ARN}\",
      \"databaseName\": \"knowledge_base\",
      \"tableName\": \"embeddings\",
      \"fieldMapping\": {
        \"primaryKeyField\": \"id\",
        \"vectorField\": \"embedding\",
        \"textField\": \"content\",
        \"metadataField\": \"metadata\"
      }
    }
  }" \
  --region us-east-1
```

### 6. Add Data Source

```bash
# Get the Knowledge Base ID from the previous command output
KB_ID="<knowledge-base-id>"

# Create data source
aws bedrock-agent create-data-source \
  --knowledge-base-id "${KB_ID}" \
  --name "research-papers" \
  --data-source-configuration '{
    "type": "S3",
    "s3Configuration": {
      "bucketArn": "arn:aws:s3:::focusflow-bedrock-kb-dev",
      "inclusionPrefixes": ["papers/"]
    }
  }' \
  --region us-east-1
```

### 7. Sync Data

```bash
# Start ingestion job
aws bedrock-agent start-ingestion-job \
  --knowledge-base-id "${KB_ID}" \
  --data-source-id "<data-source-id>" \
  --region us-east-1
```

## Cost Breakdown

### Monthly Costs
- **RDS db.t3.micro**: ~$15/month
- **RDS Storage (20GB)**: ~$2/month
- **NAT Gateway**: ~$32/month
- **Data Transfer**: ~$1/month
- **Secrets Manager**: ~$0.40/month

**Total**: ~$50/month (still much cheaper than OpenSearch Serverless!)

### Cost Optimization Options

1. **Remove NAT Gateway** if you don't need private subnet internet access: Saves $32/month
2. **Use db.t4g.micro** (ARM-based): Saves ~20%
3. **Stop RDS when not in use**: Pay only for storage

## Troubleshooting

### Can't connect to RDS
- RDS is in private subnets by design
- Use AWS Systems Manager Session Manager or a bastion host
- Or temporarily make it publicly accessible for setup

### pgvector not available
- Ensure you're using PostgreSQL 15.4 or later
- Run `CREATE EXTENSION vector;` as the admin user

### Knowledge Base creation fails
- Verify IAM role has RDS and Secrets Manager permissions
- Check that the table schema matches the field mapping
- Ensure pgvector extension is enabled

## Next Steps

After setup:
1. Test the Knowledge Base with a query
2. Integrate with the Bedrock Agent
3. Monitor costs in AWS Cost Explorer
4. Set up CloudWatch alarms for RDS metrics
