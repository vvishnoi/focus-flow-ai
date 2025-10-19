# Deployment Guide

Complete guide for deploying FocusFlow AI to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (`aws configure`)
- Terraform 1.0+ installed
- Node.js 18+ and npm
- Git

## Quick Deployment

```bash
# Clone and setup
git clone <repository-url>
cd focus-flow-ai

# Deploy everything
./scripts/deploy-complete-system.sh
```

## Step-by-Step Deployment

### 1. Infrastructure Setup

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply infrastructure
terraform apply

# Note the outputs
terraform output
```

**Expected Outputs:**
- `api_gateway_url`: Your API Gateway endpoint
- `cloudfront_url`: Your frontend URL
- `s3_bucket_frontend`: Frontend bucket name
- `s3_bucket_sessions`: Sessions bucket name

### 2. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install

# Create production build
npm run build

# Deploy to S3
aws s3 sync out/ s3://focusflow-frontend-dev/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id E1CP1219GKD5ZW \
  --paths "/*"
```

### 3. Lambda Functions Deployment

```bash
cd backend/functions

# Package all functions
for func in */; do
  echo "Packaging $func..."
  cd $func
  npm install --production
  zip -r ../${func%/}.zip .
  cd ..
done

# Deploy via Terraform
cd ../../infra/terraform
terraform apply -target=module.lambda
```

### 4. Knowledge Base Setup

```bash
# Prepare research documents
cd backend/bedrock/knowledge-base
./scripts/prepare-research-documents.sh

# Upload to S3
aws s3 sync research/papers/ s3://focusflow-bedrock-kb-dev/research/

# Sync knowledge base (via AWS Console)
# Navigate to: Bedrock > Knowledge bases > focusflow-kb-dev > Sync
```

### 5. Verification

```bash
# Test API endpoints
./scripts/test-api-endpoints.sh

# Check frontend
curl https://d3sy81kn37rion.cloudfront.net/

# Monitor logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow
```

## Environment-Specific Deployment

### Development
```bash
terraform workspace select dev
terraform apply -var="environment=dev"
```

### Production
```bash
terraform workspace select prod
terraform apply -var="environment=prod"
```

## Rollback Procedure

```bash
# Rollback infrastructure
cd infra/terraform
terraform apply -target=module.lambda -var="lambda_version=previous"

# Rollback frontend
aws s3 sync s3://focusflow-frontend-backup/ s3://focusflow-frontend-dev/
aws cloudfront create-invalidation --distribution-id E1CP1219GKD5ZW --paths "/*"
```

## Monitoring Deployment

```bash
# Check Lambda function status
aws lambda list-functions --query "Functions[?contains(FunctionName, 'focusflow')].{Name:FunctionName, Status:State}"

# Check API Gateway
aws apigatewayv2 get-apis --query "Items[?contains(Name, 'focusflow')]"

# Check CloudFront distribution
aws cloudfront get-distribution --id E1CP1219GKD5ZW
```

## Troubleshooting

### Issue: Terraform State Lock
```bash
# Force unlock (use with caution)
terraform force-unlock <lock-id>
```

### Issue: Lambda Deployment Fails
```bash
# Check function logs
aws logs tail /aws/lambda/focusflow-<function-name>-dev --since 10m

# Verify IAM permissions
aws iam get-role-policy --role-name focusflow-lambda-role-dev --policy-name <policy-name>
```

### Issue: Frontend Not Updating
```bash
# Clear CloudFront cache completely
aws cloudfront create-invalidation \
  --distribution-id E1CP1219GKD5ZW \
  --paths "/*"

# Wait 5-10 minutes for propagation
```

## Post-Deployment Checklist

- [ ] Frontend accessible via CloudFront URL
- [ ] API Gateway endpoints responding
- [ ] Lambda functions deployed and active
- [ ] DynamoDB tables created
- [ ] S3 buckets configured
- [ ] Bedrock Agent and KB operational
- [ ] CloudWatch logs streaming
- [ ] IAM permissions correct
- [ ] All tests passing

## Deployment Costs

Estimated monthly costs (us-east-1):

| Service | Usage | Cost |
|---------|-------|------|
| Lambda | 100K invocations | $0.20 |
| API Gateway | 100K requests | $0.35 |
| DynamoDB | On-demand | $2.50 |
| S3 | 10GB storage | $0.23 |
| CloudFront | 10GB transfer | $0.85 |
| Bedrock | 100 reports | $15.00 |
| **Total** | | **~$19/month** |

## Security Considerations

- Enable AWS CloudTrail for audit logging
- Use AWS Secrets Manager for sensitive data
- Enable S3 bucket versioning
- Configure VPC for Lambda functions (optional)
- Enable API Gateway throttling
- Use AWS WAF for CloudFront (optional)

## Backup Strategy

```bash
# Backup DynamoDB tables
aws dynamodb create-backup --table-name focusflow-reports-dev --backup-name reports-backup-$(date +%Y%m%d)

# Backup S3 buckets
aws s3 sync s3://focusflow-sessions-dev/ s3://focusflow-sessions-backup/

# Export Terraform state
terraform state pull > terraform-state-backup-$(date +%Y%m%d).json
```
