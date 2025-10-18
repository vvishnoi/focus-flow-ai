#!/bin/bash

# Quick fix for Terraform state issues
# This script helps resolve "resource already exists" errors

set -e

cd infra/terraform

echo "🔧 Terraform Quick Fix"
echo "====================="
echo ""
echo "The resources already exist in AWS. Here are your options:"
echo ""
echo "Option 1: Import existing resources (RECOMMENDED)"
echo "  This will bring existing resources under Terraform management"
echo ""
echo "Option 2: Destroy and recreate (DANGEROUS - will lose data)"
echo "  This will delete existing resources and create new ones"
echo ""
echo "Option 3: Skip and continue (if only adding new resources)"
echo "  This will only create the new resources we added"
echo ""

read -p "Choose option (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "📥 Importing existing resources..."
    ../scripts/fix-terraform-state.sh
    ;;
  2)
    echo ""
    echo "⚠️  WARNING: This will DELETE existing resources!"
    read -p "Are you sure? Type 'yes' to confirm: " confirm
    if [ "$confirm" = "yes" ]; then
      echo "Destroying resources..."
      terraform destroy -auto-approve
      echo "Creating resources..."
      terraform apply -auto-approve
    else
      echo "Cancelled."
      exit 1
    fi
    ;;
  3)
    echo ""
    echo "⏭️  Skipping import. Applying only new resources..."
    echo ""
    echo "Run this command to target only the new resources:"
    echo ""
    echo "terraform apply \\"
    echo "  -target=module.bedrock.aws_s3_object.papers_folder \\"
    echo "  -target=module.bedrock.aws_s3_object.extracted_folder \\"
    echo "  -target=module.bedrock.aws_s3_object.metadata_folder \\"
    echo "  -target=module.bedrock.aws_s3_object.research_metadata \\"
    echo "  -target=module.bedrock.aws_s3_bucket_public_access_block.knowledge_base"
    echo ""
    ;;
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "✅ Done!"
