#!/bin/bash

# Deploy Research RAG Lambda Function

set -e

echo "================================"
echo "Research RAG Lambda Deployment"
echo "================================"

# Configuration
FUNCTION_DIR="backend/functions/research-rag"
FUNCTION_NAME="focusflow-research-rag-dev"
ROLE_NAME="focusflow-lambda-role-dev"
REGION="us-east-1"

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

echo ""
echo "Step 1: Installing dependencies..."
cd "$FUNCTION_DIR"
npm install --production
cd ../../..

echo ""
echo "Step 2: Creating deployment package..."
cd "$FUNCTION_DIR"
zip -r ../research-rag.zip . -x "*.git*" "node_modules/.cache/*"
cd ../../..

echo ""
echo "Step 3: Checking if function exists..."
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" 2>/dev/null; then
  echo "Function exists. Updating code..."
  aws lambda update-function-code \
    --function-name "$FUNCTION_NAME" \
    --zip-file "fileb://backend/functions/research-rag.zip" \
    --region "$REGION"
  
  echo "Updating configuration..."
  aws lambda update-function-configuration \
    --function-name "$FUNCTION_NAME" \
    --timeout 60 \
    --memory-size 1024 \
    --environment "Variables={BUCKET_NAME=focusflow-bedrock-kb-dev,EMBEDDINGS_KEY=research-embeddings.json}" \
    --region "$REGION"
else
  echo "Function doesn't exist. Creating..."
  aws lambda create-function \
    --function-name "$FUNCTION_NAME" \
    --runtime nodejs20.x \
    --role "$ROLE_ARN" \
    --handler index.handler \
    --zip-file "fileb://backend/functions/research-rag.zip" \
    --timeout 60 \
    --memory-size 1024 \
    --environment "Variables={BUCKET_NAME=focusflow-bedrock-kb-dev,EMBEDDINGS_KEY=research-embeddings.json}" \
    --region "$REGION"
fi

echo ""
echo "Step 4: Adding Bedrock permissions to Lambda role..."
aws iam put-role-policy \
  --role-name "$ROLE_NAME" \
  --policy-name "research-rag-bedrock-policy" \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "bedrock:InvokeModel"
        ],
        "Resource": "arn:aws:bedrock:*::foundation-model/amazon.titan-embed-text-v1"
      }
    ]
  }'

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Function ARN: arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"
echo ""
echo "Test the function:"
echo "  aws lambda invoke \\"
echo "    --function-name $FUNCTION_NAME \\"
echo "    --payload '{\"inputText\":\"eye tracking accuracy\"}' \\"
echo "    response.json"
echo ""
echo "Next steps:"
echo "  1. Process research papers: python scripts/process-research-papers.py backend/bedrock/knowledge-base/papers"
echo "  2. Connect to Bedrock Agent action group"
echo "  3. Test end-to-end"
