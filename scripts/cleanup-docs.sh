#!/bin/bash

# Script to move old documentation files to archive

echo "📚 Cleaning up documentation files..."

# Create archive directory
mkdir -p docs/archive

# List of files to archive
OLD_DOCS=(
  "SCORECARD_DEPLOYMENT_COMPLETE.md"
  "SCORECARD_ENHANCEMENTS_COMPLETE.md"
  "SCORECARD_ACTUAL_STATUS.md"
  "LAMBDA_FIX_COMPLETE.md"
  "LAMBDA_500_ERROR_FIX.md"
  "AI_REPORT_ISSUE_RESOLVED.md"
  "TEST_AI_REPORTS.md"
  "COMPLETE_SYSTEM_STATUS.md"
  "QUICK_REFERENCE.md"
  "DEPLOYMENT_COMPLETE.md"
  "SYSTEM_STATUS_REPORT.md"
  "END_TO_END_INTEGRATION_REVIEW.md"
  "BEDROCK_AGENT_RESEARCH_INTEGRATION.md"
  "LAMBDA_RAG_SUMMARY.md"
  "LAMBDA_RAG_SETUP.md"
  "KB_TERRAFORM_DEPLOY.md"
  "KB_QUICK_START.txt"
  "KB_VISUAL_GUIDE.md"
  "KB_SETUP_REFERENCE.md"
  "KNOWLEDGE_BASE_SETUP_GUIDE.md"
  "BEFORE_AFTER_COMPARISON.md"
  "RESEARCH_ENHANCEMENT_OVERVIEW.md"
  "IMPLEMENTATION_SUMMARY.md"
  "IMPLEMENTATION_TESTING_GUIDE.md"
  "CLEAR_PROFILE_IMPROVEMENTS.md"
  "CLEAR_PROFILE_FEATURE.md"
  "PROFILE_FEATURE.md"
  "UI_IMPROVEMENTS.md"
  "BACKEND_PROFILE_INTEGRATION.md"
  "TESTING_COMMANDS.md"
  "LOCAL_TESTING_GUIDE.md"
  "PROFILE_QUICK_START.md"
  "PROFILE_SETUP_COMPLETE.md"
)

# Move files to archive
for file in "${OLD_DOCS[@]}"; do
  if [ -f "$file" ]; then
    echo "  Moving $file to archive..."
    mv "$file" docs/archive/
  fi
done

echo "✅ Documentation cleanup complete!"
echo ""
echo "📁 Current documentation structure:"
echo "  README.md                 - Main project documentation"
echo "  docs/API.md              - API reference"
echo "  docs/DEPLOYMENT.md       - Deployment guide"
echo "  docs/TROUBLESHOOTING.md  - Troubleshooting guide"
echo "  docs/archive/            - Old documentation files"
echo ""
echo "🎯 All important information has been consolidated into README.md"
