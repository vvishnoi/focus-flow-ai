#!/bin/bash

# Complete Lambda RAG Setup Script

set -e

echo "========================================="
echo "Lambda RAG Complete Setup"
echo "========================================="
echo ""

# Configuration
PAPERS_DIR="backend/bedrock/knowledge-base/research/papers"
FUNCTION_NAME="focusflow-research-rag-dev"

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3."
    exit 1
fi
echo "✓ Python 3 found"

# Check pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 not found. Please install pip."
    exit 1
fi
echo "✓ pip3 found"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI."
    exit 1
fi
echo "✓ AWS CLI found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js."
    exit 1
fi
echo "✓ Node.js found"

# Check papers directory
if [ ! -d "$PAPERS_DIR" ]; then
    echo "❌ Papers directory not found: $PAPERS_DIR"
    exit 1
fi

PDF_COUNT=$(find "$PAPERS_DIR" -name "*.pdf" | wc -l)
echo "✓ Found $PDF_COUNT PDF files"

if [ "$PDF_COUNT" -eq 0 ]; then
    echo "⚠️  Warning: No PDF files found. Add PDFs to $PAPERS_DIR"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Step 2: Installing Python dependencies..."
pip3 install -q -r scripts/requirements.txt
echo "✓ Python dependencies installed"

echo ""
echo "Step 3: Processing research papers..."
echo "This may take 2-5 minutes depending on the number of papers..."
python3 scripts/process-research-papers.py "$PAPERS_DIR"

if [ $? -ne 0 ]; then
    echo "❌ Failed to process research papers"
    exit 1
fi

echo ""
echo "Step 4: Deploying Lambda function..."
./scripts/deploy-research-rag.sh

if [ $? -ne 0 ]; then
    echo "❌ Failed to deploy Lambda function"
    exit 1
fi

echo ""
echo "Step 5: Testing Lambda function..."
echo "Running test query: 'eye tracking accuracy'..."

aws lambda invoke \
  --function-name "$FUNCTION_NAME" \
  --payload '{"inputText":"eye tracking accuracy"}' \
  /tmp/rag-test-response.json \
  --log-type Tail \
  --query 'LogResult' \
  --output text | base64 -d

echo ""
echo "Response:"
cat /tmp/rag-test-response.json | python3 -m json.tool

echo ""
echo "========================================="
echo "✅ Lambda RAG Setup Complete!"
echo "========================================="
echo ""
echo "Summary:"
echo "  - Research papers processed and uploaded to S3"
echo "  - Lambda function deployed and tested"
echo "  - Ready to connect to Bedrock Agent"
echo ""
echo "Next steps:"
echo "  1. Review the setup guide: LAMBDA_RAG_SETUP.md"
echo "  2. Connect Lambda to Bedrock Agent (see guide)"
echo "  3. Test end-to-end with your agent"
echo ""
echo "Estimated monthly cost: \$2-5"
echo "Savings vs vector DB: \$95-695/month"
echo ""
