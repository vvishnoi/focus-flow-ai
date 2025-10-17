#!/bin/bash

# FocusFlow AI - Frontend Deployment Script
# Builds and deploys the Next.js frontend to S3 + CloudFront

set -e  # Exit on error

echo "🚀 FocusFlow AI - Frontend Deployment"
echo "======================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found"
    exit 1
fi

# Get Terraform outputs
cd infra/terraform

if [ ! -f "terraform.tfstate" ]; then
    echo "❌ Terraform state not found. Run 'terraform apply' first."
    exit 1
fi

echo "📊 Getting infrastructure details..."
BUCKET_NAME=$(terraform output -raw frontend_bucket_name)
DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)
API_URL=$(terraform output -raw api_gateway_url)

echo "   S3 Bucket: $BUCKET_NAME"
echo "   CloudFront ID: $DISTRIBUTION_ID"
echo "   API Gateway: $API_URL"
echo ""

# Go to frontend directory
cd ../../frontend

# Create .env.production with API URL
echo "🔧 Configuring environment..."
cat > .env.production << EOF
NEXT_PUBLIC_API_URL=$API_URL
EOF

echo "   Created .env.production"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application (automatically exports to 'out' directory)
echo "🔨 Building Next.js application..."
npm run build

echo "✅ Static files exported to 'out' directory"

# Sync to S3
echo "☁️  Uploading to S3..."
aws s3 sync out/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "*.json"

# Upload HTML and JSON with shorter cache
aws s3 sync out/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html" \
  --include "*.json"

echo "✅ Files uploaded to S3"
echo ""

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --query 'Invalidation.Id' \
  --output text)

echo "   Invalidation ID: $INVALIDATION_ID"
echo ""

# Get CloudFront URL
CLOUDFRONT_URL=$(cd ../infra/terraform && terraform output -raw cloudfront_url)

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your application is available at:"
echo "   $CLOUDFRONT_URL"
echo ""
echo "📝 Note: CloudFront invalidation may take 5-10 minutes to complete."
echo ""
echo "To check invalidation status:"
echo "   aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID"
echo ""
