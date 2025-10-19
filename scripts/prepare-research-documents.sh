#!/bin/bash

# Script to download and prepare research documents for Knowledge Base
# This script downloads the research papers and prepares them for upload to S3

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
RESEARCH_DIR="$PROJECT_ROOT/backend/bedrock/knowledge-base/research"

echo "🔬 Preparing Research Documents for Knowledge Base"
echo "=================================================="

# Create directories
mkdir -p "$RESEARCH_DIR/papers"
mkdir -p "$RESEARCH_DIR/extracted"

echo ""
echo "📥 Step 1: Download Research Papers"
echo "-----------------------------------"

# Document 1: PMC3925117
if [ ! -f "$RESEARCH_DIR/papers/PMC3925117.pdf" ]; then
  echo "Downloading PMC3925117 - Eye Gaze in Autism Spectrum Disorder..."
  curl -L "https://pmc.ncbi.nlm.nih.gov/articles/PMC3925117/pdf/nihms3881.pdf" \
    -o "$RESEARCH_DIR/papers/PMC3925117.pdf" \
    --silent --show-error
  echo "✓ Downloaded PMC3925117.pdf"
else
  echo "✓ PMC3925117.pdf already exists"
fi

# Document 2: PMC10123036
if [ ! -f "$RESEARCH_DIR/papers/PMC10123036.html" ]; then
  echo "Downloading PMC10123036 - Eye-Tracking Technology in Healthcare..."
  curl -L "https://pmc.ncbi.nlm.nih.gov/articles/PMC10123036/" \
    -o "$RESEARCH_DIR/papers/PMC10123036.html" \
    --silent --show-error
  echo "✓ Downloaded PMC10123036.html"
else
  echo "✓ PMC10123036.html already exists"
fi

# Document 3: Healthline
if [ ! -f "$RESEARCH_DIR/papers/healthline-eye-gazing.html" ]; then
  echo "Downloading Healthline - Eye Gazing Benefits..."
  curl -L "https://www.healthline.com/health/eye-gazing" \
    -o "$RESEARCH_DIR/papers/healthline-eye-gazing.html" \
    --silent --show-error
  echo "✓ Downloaded healthline-eye-gazing.html"
else
  echo "✓ healthline-eye-gazing.html already exists"
fi

echo ""
echo "📝 Step 2: Extract Text from Documents"
echo "--------------------------------------"
echo "Note: Text extraction requires additional tools:"
echo "  - For PDFs: pdftotext (from poppler-utils)"
echo "  - For HTML: html2text or pandoc"
echo ""
echo "Install on macOS:"
echo "  brew install poppler html2text"
echo ""
echo "Install on Linux:"
echo "  sudo apt-get install poppler-utils html2text"
echo ""

# Check if pdftotext is available
if command -v pdftotext &> /dev/null; then
  echo "Extracting text from PMC3925117.pdf..."
  pdftotext "$RESEARCH_DIR/papers/PMC3925117.pdf" "$RESEARCH_DIR/extracted/PMC3925117.txt"
  echo "✓ Extracted PMC3925117.txt"
else
  echo "⚠️  pdftotext not found. Skipping PDF extraction."
  echo "   Install with: brew install poppler (macOS) or sudo apt-get install poppler-utils (Linux)"
fi

# Check if html2text is available
if command -v html2text &> /dev/null; then
  echo "Extracting text from PMC10123036.html..."
  html2text "$RESEARCH_DIR/papers/PMC10123036.html" > "$RESEARCH_DIR/extracted/PMC10123036.txt"
  echo "✓ Extracted PMC10123036.txt"
  
  echo "Extracting text from healthline-eye-gazing.html..."
  html2text "$RESEARCH_DIR/papers/healthline-eye-gazing.html" > "$RESEARCH_DIR/extracted/healthline-eye-gazing.txt"
  echo "✓ Extracted healthline-eye-gazing.txt"
else
  echo "⚠️  html2text not found. Skipping HTML extraction."
  echo "   Install with: brew install html2text (macOS) or sudo apt-get install html2text (Linux)"
fi

echo ""
echo "📊 Step 3: Summary"
echo "-----------------"
echo "Research documents prepared in: $RESEARCH_DIR"
echo ""
echo "Papers downloaded:"
ls -lh "$RESEARCH_DIR/papers/" 2>/dev/null || echo "  (none)"
echo ""
echo "Text extracted:"
ls -lh "$RESEARCH_DIR/extracted/" 2>/dev/null || echo "  (none)"
echo ""
echo "✅ Preparation complete!"
echo ""
echo "📤 Next Steps:"
echo "1. Review the downloaded documents"
echo "2. Ensure text extraction is complete"
echo "3. Deploy infrastructure: cd infra/terraform && terraform apply"
echo "4. Upload documents to S3 using the upload script"
echo ""
