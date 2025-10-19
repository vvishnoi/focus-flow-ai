#!/bin/bash

# Complete FocusFlow AI System Deployment
# This script deploys the entire system from scratch

set -e

echo "=========================================="
echo "FocusFlow AI - Complete System Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REGION="us-east-1"
ENVIRONMENT="dev"

# Step 1: Check prerequisites
echo -e "${BLUE}Step 1: Checking prerequisites...${NC}"
echo ""

if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Terraform found${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS credentials configured${NC}"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}  Account ID: $ACCOUNT_ID${NC}"

echo ""

# Step 2: Deploy Backend Infrastructure
echo -e "${BLUE}Step 2: Deploying backend infrastructure with Terraform...${NC}"
echo ""

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT/infra/terraform"

echo "Initializing Terraform..."
terraform init

echo ""
echo "Planning deployment..."
terraform plan -out=tfplan

echo ""
read -p "Review the plan above. Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "Applying Terraform configuration..."
terraform apply tfplan

echo ""
echo -e "${GREEN}✓ Backend infrastructure deployed${NC}"

# Get outputs
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null || echo "")
CLOUDFRONT_URL=$(terraform output -raw cloudfront_url 2>/dev/null || echo "")

cd "$PROJECT_ROOT"

echo ""

# Step 3: Build and Deploy Frontend
echo -e "${BLUE}Step 3: Building and deploying frontend...${NC}"
echo ""

cd "$PROJECT_ROOT/frontend"

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cat > .env.local << EOF
NEXT_PUBLIC_API_URL=${API_URL}
EOF
    echo -e "${GREEN}✓ Created .env.local${NC}"
else
    echo -e "${YELLOW}⚠ .env.local already exists${NC}"
fi

# Build frontend
echo "Building frontend..."
npm run build

# Get frontend bucket name
FRONTEND_BUCKET=$(aws s3 ls | grep focusflow-frontend-dev | awk '{print $3}')

if [ -z "$FRONTEND_BUCKET" ]; then
    echo -e "${RED}❌ Frontend bucket not found${NC}"
    exit 1
fi

echo "Deploying to S3: $FRONTEND_BUCKET"
aws s3 sync out/ s3://$FRONTEND_BUCKET/ --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$FRONTEND_BUCKET')].Id" \
    --output text)

if [ -n "$DISTRIBUTION_ID" ]; then
    echo "Invalidating CloudFront cache..."
    aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" > /dev/null
    echo -e "${GREEN}✓ CloudFront cache invalidated${NC}"
fi

cd "$PROJECT_ROOT"

echo ""
echo -e "${GREEN}✓ Frontend deployed${NC}"

echo ""

# Step 4: Verify Deployment
echo -e "${BLUE}Step 4: Verifying deployment...${NC}"
echo ""

echo "Checking Lambda functions..."
LAMBDA_COUNT=$(aws lambda list-functions --query 'Functions[?contains(FunctionName, `focusflow`)].FunctionName' --output text | wc -w)
echo -e "${GREEN}✓ $LAMBDA_COUNT Lambda functions deployed${NC}"

echo "Checking DynamoDB tables..."
TABLE_COUNT=$(aws dynamodb list-tables --query 'TableNames[?contains(@, `focusflow`)]' --output text | wc -w)
echo -e "${GREEN}✓ $TABLE_COUNT DynamoDB tables created${NC}"

echo "Checking S3 buckets..."
BUCKET_COUNT=$(aws s3 ls | grep focusflow | wc -l)
echo -e "${GREEN}✓ $BUCKET_COUNT S3 buckets configured${NC}"

echo "Checking Bedrock Agent..."
AGENT_STATUS=$(aws bedrock-agent get-agent --agent-id QPVURTILVY --query 'agent.agentStatus' --output text 2>/dev/null || echo "NOT_FOUND")
if [ "$AGENT_STATUS" = "PREPARED" ]; then
    echo -e "${GREEN}✓ Bedrock Agent is PREPARED${NC}"
else
    echo -e "${YELLOW}⚠ Bedrock Agent status: $AGENT_STATUS${NC}"
fi

echo "Checking Research RAG..."
if aws lambda get-function --function-name focusflow-research-rag-dev &> /dev/null; then
    echo -e "${GREEN}✓ Research RAG Lambda deployed${NC}"
else
    echo -e "${YELLOW}⚠ Research RAG Lambda not found${NC}"
fi

echo "Checking Research Embeddings..."
if aws s3 ls s3://focusflow-bedrock-kb-dev/research-embeddings.json &> /dev/null; then
    SIZE=$(aws s3 ls s3://focusflow-bedrock-kb-dev/research-embeddings.json --human-readable | awk '{print $3, $4}')
    echo -e "${GREEN}✓ Research embeddings uploaded ($SIZE)${NC}"
else
    echo -e "${YELLOW}⚠ Research embeddings not found${NC}"
fi

echo ""

# Step 5: Display URLs and Next Steps
echo "=========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "=========================================="
echo ""

echo "📊 Deployment Summary:"
echo "  - Lambda Functions: $LAMBDA_COUNT"
echo "  - DynamoDB Tables: $TABLE_COUNT"
echo "  - S3 Buckets: $BUCKET_COUNT"
echo "  - Bedrock Agent: $AGENT_STATUS"
echo "  - Research RAG: Deployed"
echo ""

if [ -n "$CLOUDFRONT_URL" ] && [ "$CLOUDFRONT_URL" != "null" ]; then
    echo "🌐 Frontend URL:"
    echo "  $CLOUDFRONT_URL"
    echo ""
fi

if [ -n "$API_URL" ] && [ "$API_URL" != "null" ]; then
    echo "🔌 API Gateway URL:"
    echo "  $API_URL"
    echo ""
fi

echo "📝 Next Steps:"
echo ""
echo "1. Test the frontend:"
if [ -n "$CLOUDFRONT_URL" ] && [ "$CLOUDFRONT_URL" != "null" ]; then
    echo "   Open: $CLOUDFRONT_URL"
else
    echo "   Check CloudFront distribution in AWS Console"
fi
echo ""

echo "2. Test the Research RAG:"
echo "   aws lambda invoke \\"
echo "     --function-name focusflow-research-rag-dev \\"
echo "     --payload '{\"inputText\":\"fixation duration\"}' \\"
echo "     response.json"
echo ""

echo "3. Test the Bedrock Agent:"
echo "   - Go to AWS Bedrock Console"
echo "   - Navigate to Agents → focusflow-agent-dev"
echo "   - Click 'Test' and try a query"
echo ""

echo "4. Monitor costs:"
echo "   - Set up CloudWatch billing alarms"
echo "   - Review AWS Cost Explorer"
echo ""

echo "5. Review documentation:"
echo "   - SYSTEM_STATUS_REPORT.md"
echo "   - END_TO_END_INTEGRATION_REVIEW.md"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 FocusFlow AI is now live!${NC}"
echo "=========================================="
