#!/bin/bash

# Create Bedrock Knowledge Base with PostgreSQL RDS

set -e

RDS_ARN="arn:aws:rds:us-east-1:394686422000:db:focusflow-kb-postgres-dev"
SECRET_ARN="arn:aws:secretsmanager:us-east-1:394686422000:secret:focusflow-kb-postgres-dev-BKywdD"
ROLE_ARN="arn:aws:iam::394686422000:role/focusflow-kb-role-dev"

echo "Creating Knowledge Base with PostgreSQL RDS..."

aws bedrock-agent create-knowledge-base \
  --name "focusflow-kb-dev" \
  --description "Eye-gaze research knowledge base for FocusFlow" \
  --role-arn "$ROLE_ARN" \
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
      \"tableName\": \"bedrock_integration.bedrock_kb\",
      \"fieldMapping\": {
        \"primaryKeyField\": \"id\",
        \"vectorField\": \"embedding\",
        \"textField\": \"chunks\",
        \"metadataField\": \"metadata\"
      }
    }
  }" \
  --region us-east-1

echo "✅ Knowledge Base created successfully!"
