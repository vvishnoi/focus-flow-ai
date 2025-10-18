#!/bin/bash

# Script to upload research documents to S3 Knowledge Base bucket
# Run this after terraform apply to upload the research papers

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESEARCH_DIR="$PROJECT_ROOT/backend/bedrock/knowledge-base/research"
TERRAFORM_DIR="$PROJECT_ROOT/infra/terraform"

echo "📤 Uploading Research Documents to S3"
echo "====================================="

# Get S3 bucket name from Terraform output
cd "$TERRAFORM_DIR"
BUCKET_NAME=$(terraform output -raw bedrock_kb_bucket_name 2>/dev/null)

if [ -z "$BUCKET_NAME" ]; then
  echo "❌ Error: Could not get S3 bucket name from Terraform"
  echo "   Make sure you've run 'terraform apply' first"
  exit 1
fi

echo "S3 Bucket: $BUCKET_NAME"
echo ""

# Check if research directory exists
if [ ! -d "$RESEARCH_DIR" ]; then
  echo "❌ Error: Research directory not found: $RESEARCH_DIR"
  echo "   Run ./scripts/prepare-research-documents.sh first"
  exit 1
fi

echo "📄 Uploading Papers..."
echo "---------------------"

# Upload PDFs
if [ -f "$RESEARCH_DIR/papers/PMC3925117.pdf" ]; then
  echo "Uploading PMC3925117.pdf..."
  aws s3 cp "$RESEARCH_DIR/papers/PMC3925117.pdf" \
    "s3://$BUCKET_NAME/papers/PMC3925117.pdf" \
    --content-type "application/pdf"
  echo "✓ Uploaded PMC3925117.pdf"
else
  echo "⚠️  PMC3925117.pdf not found"
fi

if [ -f "$RESEARCH_DIR/papers/PMC10123036.html" ]; then
  echo "Uploading PMC10123036.html..."
  aws s3 cp "$RESEARCH_DIR/papers/PMC10123036.html" \
    "s3://$BUCKET_NAME/papers/PMC10123036.html" \
    --content-type "text/html"
  echo "✓ Uploaded PMC10123036.html"
else
  echo "⚠️  PMC10123036.html not found"
fi

if [ -f "$RESEARCH_DIR/papers/healthline-eye-gazing.html" ]; then
  echo "Uploading healthline-eye-gazing.html..."
  aws s3 cp "$RESEARCH_DIR/papers/healthline-eye-gazing.html" \
    "s3://$BUCKET_NAME/papers/healthline-eye-gazing.html" \
    --content-type "text/html"
  echo "✓ Uploaded healthline-eye-gazing.html"
else
  echo "⚠️  healthline-eye-gazing.html not found"
fi

echo ""
echo "📝 Uploading Extracted Text..."
echo "------------------------------"

# Upload extracted text files
if [ -f "$RESEARCH_DIR/extracted/PMC3925117.txt" ]; then
  echo "Uploading PMC3925117.txt..."
  aws s3 cp "$RESEARCH_DIR/extracted/PMC3925117.txt" \
    "s3://$BUCKET_NAME/extracted/PMC3925117.txt" \
    --content-type "text/plain"
  echo "✓ Uploaded PMC3925117.txt"
else
  echo "⚠️  PMC3925117.txt not found"
fi

if [ -f "$RESEARCH_DIR/extracted/PMC10123036.txt" ]; then
  echo "Uploading PMC10123036.txt..."
  aws s3 cp "$RESEARCH_DIR/extracted/PMC10123036.txt" \
    "s3://$BUCKET_NAME/extracted/PMC10123036.txt" \
    --content-type "text/plain"
  echo "✓ Uploaded PMC10123036.txt"
else
  echo "⚠️  PMC10123036.txt not found"
fi

if [ -f "$RESEARCH_DIR/extracted/healthline-eye-gazing.txt" ]; then
  echo "Uploading healthline-eye-gazing.txt..."
  aws s3 cp "$RESEARCH_DIR/extracted/healthline-eye-gazing.txt" \
    "s3://$BUCKET_NAME/extracted/healthline-eye-gazing.txt" \
    --content-type "text/plain"
  echo "✓ Uploaded healthline-eye-gazing.txt"
else
  echo "⚠️  healthline-eye-gazing.txt not found"
fi

echo ""
echo "📊 Verifying Upload..."
echo "---------------------"

# List uploaded files
echo "Papers in S3:"
aws s3 ls "s3://$BUCKET_NAME/papers/" || echo "  (none)"

echo ""
echo "Extracted text in S3:"
aws s3 ls "s3://$BUCKET_NAME/extracted/" || echo "  (none)"

echo ""
echo "✅ Upload complete!"
echo ""
echo "📤 Next Steps:"
echo "1. Verify files in S3 console or CLI"
echo "2. Create Bedrock Knowledge Base (Task 1.3)"
echo "3. Sync Knowledge Base with S3 data source"
echo ""
