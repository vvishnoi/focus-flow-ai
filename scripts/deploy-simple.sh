#!/bin/bash

# Simple deployment - most infrastructure already exists
# This just ensures everything is up to date

set -e

echo "=========================================="
echo "FocusFlow AI - Simple Deployment"
echo "=========================================="
echo ""

# Step 1: Deploy/Update Backend
echo "Step 1: Updating backend infrastructure..."
cd infra/terraform
terraform apply -auto-approve
cd ../..
echo "✓ Backend updated"
echo ""

# Step 2: Build Frontend
echo "Step 2: Building frontend..."
cd frontend
npm install
npm run build
cd ..
echo "✓ Frontend built"
echo ""

# Step 3: Deploy Frontend
echo "Step 3: Deploying frontend to S3..."
BUCKET=$(aws s3 ls | grep focusflow-frontend-dev | awk '{print $3}')
aws s3 sync frontend/out/ s3://$BUCKET/ --delete
echo "✓ Frontend deployed"
echo ""

# Step 4: Invalidate CloudFront
echo "Step 4: Invalidating CloudFront cache..."
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$BUCKET')].Id" --output text)
if [ -n "$DIST_ID" ]; then
    aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*" > /dev/null
    echo "✓ CloudFront invalidated"
else
    echo "⚠ CloudFront distribution not found"
fi
echo ""

# Step 5: Get URLs
echo "=========================================="
echo "✅ Deployment Complete!"
echo "=========================================="
echo ""

CLOUDFRONT_URL=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$BUCKET')].DomainName" --output text)
if [ -n "$CLOUDFRONT_URL" ]; then
    echo "🌐 Frontend URL: https://$CLOUDFRONT_URL"
fi

echo ""
echo "📝 Next Steps:"
echo "  1. Test the frontend"
echo "  2. Create a profile"
echo "  3. Complete a game session"
echo "  4. View the AI-generated report"
echo ""
