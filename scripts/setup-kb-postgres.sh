#!/bin/bash

# Setup PostgreSQL RDS for Bedrock Knowledge Base
# This script sets up the pgvector extension and creates the required table

set -e

# Get database credentials from Secrets Manager
SECRET_ARN="arn:aws:secretsmanager:us-east-1:394686422000:secret:focusflow-kb-postgres-dev-BKywdD"
DB_CREDS=$(aws secretsmanager get-secret-value --secret-id "$SECRET_ARN" --query SecretString --output text)

DB_HOST=$(echo "$DB_CREDS" | jq -r '.host')
DB_USER=$(echo "$DB_CREDS" | jq -r '.username')
DB_PASS=$(echo "$DB_CREDS" | jq -r '.password')
DB_NAME=$(echo "$DB_CREDS" | jq -r '.dbname')

echo "Connecting to RDS at $DB_HOST..."

# Note: This requires psql client and network access to RDS
# RDS is in private subnets, so you need to run this from:
# 1. An EC2 instance in the same VPC
# 2. Via AWS Systems Manager Session Manager
# 3. Or temporarily make RDS publicly accessible

# SQL commands to set up pgvector
SQL_COMMANDS="
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embeddings table for Knowledge Base
CREATE TABLE IF NOT EXISTS bedrock_integration.bedrock_kb (
  id UUID PRIMARY KEY,
  embedding vector(1536),
  chunks TEXT,
  metadata JSONB
);

-- Create index for faster similarity search
CREATE INDEX IF NOT EXISTS bedrock_kb_embedding_idx 
ON bedrock_integration.bedrock_kb 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant permissions
GRANT ALL ON bedrock_integration.bedrock_kb TO $DB_USER;
"

echo "Setting up pgvector and creating tables..."
echo "$SQL_COMMANDS" | PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

echo "✅ PostgreSQL setup complete!"
echo ""
echo "Now you can create the Knowledge Base with these details:"
echo "  RDS ARN: arn:aws:rds:us-east-1:394686422000:db:focusflow-kb-postgres-dev"
echo "  Secret ARN: $SECRET_ARN"
echo "  Database: $DB_NAME"
echo "  Table: bedrock_integration.bedrock_kb"
