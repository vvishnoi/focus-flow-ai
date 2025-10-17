#!/bin/bash

# FocusFlow AI - Terraform Deployment Script
# This script deploys the backend infrastructure to AWS

set -e  # Exit on error

echo "🚀 FocusFlow AI - Infrastructure Deployment"
echo "==========================================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    exit 1
fi

# Check Terraform
if ! command -v terraform &> /dev/null; then
    echo "❌ Terraform not found. Please install it first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Get AWS account info
AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

echo "📍 Deployment Details:"
echo "   AWS Account: $AWS_ACCOUNT"
echo "   AWS Region: $AWS_REGION"
echo ""

# Confirm deployment
read -p "Do you want to proceed with deployment? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "🔧 Initializing Terraform..."
terraform init

echo ""
echo "📝 Planning infrastructure changes..."
terraform plan -out=tfplan

echo ""
read -p "Review the plan above. Apply these changes? (yes/no): " APPLY
if [ "$APPLY" != "yes" ]; then
    echo "❌ Deployment cancelled"
    rm -f tfplan
    exit 0
fi

echo ""
echo "🚀 Applying infrastructure changes..."
terraform apply tfplan

echo ""
echo "✅ Deployment complete!"
echo ""

# Show outputs
echo "📊 Infrastructure Outputs:"
echo "=========================="
terraform output

echo ""
echo "🎉 Your FocusFlow AI backend is now deployed!"
echo ""
echo "Next steps:"
echo "1. Copy the API Gateway URL from above"
echo "2. Update your frontend with this URL"
echo "3. Test the endpoints"
echo ""
echo "To test:"
echo "  API_URL=\$(terraform output -raw api_gateway_url)"
echo "  curl \$API_URL/submit-session -X POST -H 'Content-Type: application/json' -d '{...}'"
echo ""

# Cleanup
rm -f tfplan
