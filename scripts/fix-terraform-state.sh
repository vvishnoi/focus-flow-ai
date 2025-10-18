#!/bin/bash

# Script to import existing AWS resources into Terraform state
# This fixes the "resource already exists" errors

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$SCRIPT_DIR/../infra/terraform"

cd "$TERRAFORM_DIR"

echo "🔧 Fixing Terraform State - Importing Existing Resources"
echo "========================================================"
echo ""

# Get AWS account ID and region
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region || echo "us-east-1")

echo "AWS Account: $AWS_ACCOUNT_ID"
echo "AWS Region: $AWS_REGION"
echo ""

# Import S3 buckets
echo "📦 Importing S3 Buckets..."
terraform import 'module.bedrock.aws_s3_bucket.knowledge_base' focusflow-bedrock-kb-dev 2>/dev/null || echo "  Already imported or doesn't exist"
terraform import 'module.s3.aws_s3_bucket.sessions' focusflow-sessions-dev 2>/dev/null || echo "  Already imported or doesn't exist"
terraform import 'module.frontend.aws_s3_bucket.frontend' focusflow-frontend-dev 2>/dev/null || echo "  Already imported or doesn't exist"

# Import DynamoDB tables
echo ""
echo "🗄️  Importing DynamoDB Tables..."
terraform import 'module.dynamodb.aws_dynamodb_table.reports' focusflow-reports-dev 2>/dev/null || echo "  Already imported or doesn't exist"
terraform import 'module.dynamodb.aws_dynamodb_table.users' focusflow-users-dev 2>/dev/null || echo "  Already imported or doesn't exist"
terraform import 'module.dynamodb.aws_dynamodb_table.profiles' focusflow-profiles-dev 2>/dev/null || echo "  Already imported or doesn't exist"

# Import IAM roles
echo ""
echo "🔐 Importing IAM Roles..."
terraform import 'module.bedrock.aws_iam_role.bedrock_agent' focusflow-bedrock-agent-role-dev 2>/dev/null || echo "  Already imported or doesn't exist"

# Import CloudWatch Log Groups
echo ""
echo "📊 Importing CloudWatch Log Groups..."
terraform import 'module.api_gateway.aws_cloudwatch_log_group.api_logs' /aws/apigateway/focusflow-dev 2>/dev/null || echo "  Already imported or doesn't exist"

# Import CloudFront OAC
echo ""
echo "🌐 Importing CloudFront Resources..."
# Get OAC ID
OAC_ID=$(aws cloudfront list-origin-access-controls --query "OriginAccessControlList.Items[?Name=='focusflow-frontend-oac-dev'].Id" --output text 2>/dev/null || echo "")
if [ -n "$OAC_ID" ]; then
  terraform import 'module.frontend.aws_cloudfront_origin_access_control.frontend' "$OAC_ID" 2>/dev/null || echo "  Already imported"
else
  echo "  OAC not found or already imported"
fi

echo ""
echo "✅ Import complete!"
echo ""
echo "📝 Next steps:"
echo "1. Run: terraform plan"
echo "2. Review the changes"
echo "3. Run: terraform apply"
echo ""
