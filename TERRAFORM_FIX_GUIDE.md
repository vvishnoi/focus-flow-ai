# Terraform "Resource Already Exists" - Fix Guide

## Problem

You're getting errors like:
```
Error: creating S3 Bucket (focusflow-bedrock-kb-dev): BucketAlreadyExists
Error: creating IAM Role (focusflow-bedrock-agent-role-dev): EntityAlreadyExists
```

This happens because the resources were created in a previous deployment but aren't in your current Terraform state.

## Solution Options

### Option 1: Apply Only New Resources (EASIEST) ⭐

Since the bucket already exists, we only need to add the new folders and metadata:

```bash
cd infra/terraform

# Apply only the new resources
terraform apply \
  -target=module.bedrock.aws_s3_object.papers_folder \
  -target=module.bedrock.aws_s3_object.extracted_folder \
  -target=module.bedrock.aws_s3_object.metadata_folder \
  -target=module.bedrock.aws_s3_object.research_metadata \
  -target=module.bedrock.aws_s3_bucket_public_access_block.knowledge_base
```

### Option 2: Skip Terraform, Upload Manually (FASTEST) ⭐⭐

Since the bucket exists, just upload the files directly:

```bash
# 1. Prepare documents
./scripts/prepare-research-documents.sh

# 2. Get bucket name
cd infra/terraform
BUCKET=$(terraform output -raw knowledge_base_bucket 2>/dev/null || echo "focusflow-bedrock-kb-dev")

# 3. Upload metadata
aws s3 cp backend/bedrock/knowledge-base/research-metadata.json \
  s3://$BUCKET/metadata/research-metadata.json

# 4. Create folders (they'll be created automatically when you upload files)
# No action needed - folders are virtual in S3

# 5. Upload research documents
cd ../..
./scripts/upload-research-documents.sh
```

### Option 3: Import Existing Resources (THOROUGH)

Import all existing resources into Terraform state:

```bash
./scripts/fix-terraform-state.sh
```

Then run:
```bash
cd infra/terraform
terraform plan
terraform apply
```

### Option 4: Fresh Start (DANGEROUS - WILL DELETE DATA)

⚠️ **WARNING**: This will delete all existing resources!

```bash
cd infra/terraform
terraform destroy
terraform apply
```

## Recommended Approach

**For this task, use Option 2 (Skip Terraform, Upload Manually)**:

1. The bucket already exists ✓
2. We just need to upload files
3. No need to modify existing infrastructure
4. Fastest and safest

```bash
# Quick commands:
./scripts/prepare-research-documents.sh
./scripts/upload-research-documents.sh
```

## Why This Happened

Terraform state can get out of sync when:
- Resources are created manually
- State file is lost or not shared
- Multiple people deploy to same environment
- Resources are created outside Terraform

## Prevention

For future deployments:
1. Always use Terraform for infrastructure
2. Store state in S3 backend (remote state)
3. Use state locking with DynamoDB
4. Never create resources manually in AWS console

## Verification

After uploading, verify the files:

```bash
cd infra/terraform
BUCKET=$(terraform output -raw knowledge_base_bucket 2>/dev/null || echo "focusflow-bedrock-kb-dev")

# List all files
aws s3 ls s3://$BUCKET/ --recursive

# Should see:
# metadata/research-metadata.json
# (papers and extracted text after you upload them)
```

## Next Steps

Once files are uploaded:
1. ✅ Task 1.1 is complete
2. Move to Task 1.2: Create OpenSearch Serverless collection
3. Then Task 1.3: Create Bedrock Knowledge Base

---

**TL;DR**: Just run these two commands:
```bash
./scripts/prepare-research-documents.sh
./scripts/upload-research-documents.sh
```

The bucket already exists, so we're good to go! 🎉
