# FocusFlow AI - Deployment Guide

Complete guide to deploy the FocusFlow AI backend infrastructure using Terraform.

## 📋 What We've Built

### Infrastructure Components

✅ **S3 Bucket**
- Stores raw session data
- Versioning enabled
- Encryption at rest
- Lifecycle policy (90 days → Glacier, 365 days → Delete)

✅ **DynamoDB Tables**
- `focusflow-reports-dev` - Processed session reports
- `focusflow-users-dev` - User metadata
- On-demand billing
- Point-in-time recovery

✅ **Lambda Functions**
- `data-ingestor` - Receives session data from frontend
- `metrics-calculator` - Calculates performance metrics
- `get-reports` - Fetches user reports

✅ **API Gateway**
- HTTP API (cost-effective)
- CORS configured
- Two endpoints:
  - `POST /submit-session`
  - `GET /reports/{userId}`

✅ **IAM Roles & Policies**
- Least privilege access
- Separate policies for S3, DynamoDB

✅ **CloudWatch Logging**
- API Gateway logs
- Lambda function logs

## 🚀 Quick Start Deployment

### Option 1: Using the Deploy Script (Recommended)

```bash
cd infra/terraform
./deploy.sh
```

The script will:
1. Check prerequisites
2. Initialize Terraform
3. Show you the plan
4. Ask for confirmation
5. Deploy infrastructure
6. Display outputs

### Option 2: Manual Deployment

```bash
cd infra/terraform

# Initialize
terraform init

# Plan
terraform plan

# Apply
terraform apply
```

## 📝 Step-by-Step Deployment

### 1. Verify Prerequisites

```bash
# Check AWS CLI
aws --version
# Should show: aws-cli/2.31.15

# Check Terraform
terraform --version
# Should show: Terraform v1.5.7

# Check AWS credentials
aws sts get-caller-identity
# Should show your AWS account info

# Check Bedrock model access
aws bedrock list-foundation-models --region us-east-1 | grep claude-sonnet-4
# Should show Claude Sonnet 4.5 model
```

**⚠️ Important**: Request Bedrock access if you haven't:
1. Go to AWS Console → Bedrock
2. Click "Model access"
3. Request access to "Claude Sonnet 4.5"
4. Wait for approval (usually instant)

### 2. Navigate to Terraform Directory

```bash
cd infra/terraform
```

### 3. Review Configuration (Optional)

Edit `variables.tf` if you want to change defaults:

```hcl
variable "aws_region" {
  default = "us-east-1"  # Change if needed
}

variable "project_name" {
  default = "focusflow"  # Change if needed
}

variable "environment" {
  default = "dev"  # dev, staging, or prod
}

variable "frontend_url" {
  default = "http://localhost:3000"  # Update for production
}
```

Or create `terraform.tfvars`:

```hcl
aws_region   = "us-east-1"
project_name = "focusflow"
environment  = "dev"
frontend_url = "http://localhost:3000"
```

### 4. Initialize Terraform

```bash
terraform init
```

This downloads:
- AWS provider
- Archive provider
- Module dependencies

### 5. Plan Deployment

```bash
terraform plan
```

Review the output. You should see:
- **+** symbols for resources to be created
- Approximately 15-20 resources

### 6. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

Deployment takes ~2-3 minutes.

### 7. Save Outputs

```bash
terraform output > ../outputs.txt
```

Or get specific outputs:

```bash
# API Gateway URL
terraform output -raw api_gateway_url

# S3 Bucket Name
terraform output -raw s3_bucket_name

# DynamoDB Table Names
terraform output -raw reports_table_name
terraform output -raw users_table_name
```

## 🧪 Testing the Deployment

### Test 1: Submit Session Data

```bash
# Get API URL
API_URL=$(terraform output -raw api_gateway_url)

# Submit test session
curl -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "sessionId": "session-' $(date +%s) '",
    "level": "level1",
    "startTime": 1234567890000,
    "endTime": 1234567900000,
    "gazeData": [
      {
        "timestamp": 1234567890100,
        "gazeX": 500,
        "gazeY": 300,
        "objectId": "obj1",
        "objectX": 510,
        "objectY": 305
      }
    ],
    "events": []
  }'
```

Expected response:
```json
{
  "message": "Session data received successfully",
  "s3Key": "sessions/test-user-123/session-xxx_xxx.json",
  "sessionId": "session-xxx"
}
```

### Test 2: Verify S3 Storage

```bash
# List objects in S3
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 ls s3://$BUCKET/sessions/test-user-123/
```

### Test 3: Check DynamoDB

```bash
# Query users table
TABLE=$(terraform output -raw users_table_name)
aws dynamodb get-item \
  --table-name $TABLE \
  --key '{"userId": {"S": "test-user-123"}}'
```

### Test 4: Get Reports (will be empty initially)

```bash
curl $API_URL/reports/test-user-123
```

Expected response:
```json
{
  "userId": "test-user-123",
  "reports": [],
  "count": 0
}
```

## 🔄 Updating Infrastructure

### Update Lambda Functions

After changing Lambda code:

```bash
cd infra/terraform
terraform apply
```

Terraform detects code changes via hash and updates functions automatically.

### Update Configuration

1. Edit `variables.tf` or `terraform.tfvars`
2. Run `terraform plan` to review
3. Run `terraform apply` to apply

### Force Lambda Update

If Terraform doesn't detect changes:

```bash
terraform taint module.lambda.aws_lambda_function.data_ingestor
terraform apply
```

## 🔍 Monitoring & Debugging

### View Lambda Logs

```bash
# Data Ingestor logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow

# Metrics Calculator logs
aws logs tail /aws/lambda/focusflow-metrics-calculator-dev --follow

# Get Reports logs
aws logs tail /aws/lambda/focusflow-get-reports-dev --follow
```

### View API Gateway Logs

```bash
aws logs tail /aws/apigateway/focusflow-dev --follow
```

### Check Lambda Function Status

```bash
aws lambda list-functions --query 'Functions[?starts_with(FunctionName, `focusflow`)].[FunctionName, Runtime, LastModified]' --output table
```

### Test Lambda Directly

```bash
aws lambda invoke \
  --function-name focusflow-data-ingestor-dev \
  --payload '{"body": "{\"userId\":\"test\",\"sessionId\":\"test\",\"level\":\"level1\"}"}' \
  response.json

cat response.json
```

## 💰 Cost Monitoring

### Check Current Costs

```bash
# Get cost for last 7 days
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '7 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics BlendedCost \
  --group-by Type=SERVICE
```

### Set Up Budget Alert

```bash
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json
```

Create `budget.json`:
```json
{
  "BudgetName": "FocusFlow-Monthly",
  "BudgetLimit": {
    "Amount": "50",
    "Unit": "USD"
  },
  "TimeUnit": "MONTHLY",
  "BudgetType": "COST"
}
```

## 🗑️ Destroying Infrastructure

**⚠️ Warning**: This deletes ALL resources and data!

```bash
cd infra/terraform
terraform destroy
```

Type `yes` when prompted.

This will delete:
- All Lambda functions
- S3 bucket (must be empty first)
- DynamoDB tables
- API Gateway
- IAM roles
- CloudWatch logs

## 🔐 Security Checklist

- [ ] AWS credentials configured securely
- [ ] MFA enabled on AWS account
- [ ] IAM user (not root) for deployment
- [ ] S3 bucket encryption enabled
- [ ] DynamoDB encryption enabled
- [ ] API Gateway CORS configured correctly
- [ ] CloudWatch logging enabled
- [ ] Budget alerts configured

## 🐛 Troubleshooting

### Error: "Error creating Lambda Function"

**Cause**: IAM permissions or invalid code

**Solution**:
```bash
# Check IAM permissions
aws iam get-user

# Validate Lambda code
cd backend/functions/data-ingestor
node index.js  # Should not error
```

### Error: "AccessDenied" when accessing S3

**Cause**: IAM role doesn't have S3 permissions

**Solution**: Check `infra/terraform/modules/lambda/main.tf` - IAM policy should include S3 permissions

### Lambda function not updating

**Cause**: Source code hash hasn't changed

**Solution**:
```bash
terraform taint module.lambda.aws_lambda_function.data_ingestor
terraform apply
```

### API Gateway returns 403

**Cause**: CORS or Lambda permission issue

**Solution**:
1. Check CORS configuration in `modules/api-gateway/main.tf`
2. Verify Lambda permission resource exists
3. Test Lambda directly to isolate issue

## 📚 Next Steps

1. ✅ Deploy infrastructure
2. ⏳ Update frontend with API Gateway URL
3. ⏳ Test end-to-end flow
4. ⏳ Set up Bedrock Agent (manual or separate Terraform)
5. ⏳ Add monitoring and alerts
6. ⏳ Set up CI/CD pipeline
7. ⏳ Deploy to production

## 🔗 Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)

## 📞 Support

If you encounter issues:
1. Check CloudWatch logs
2. Review Terraform plan output
3. Verify AWS permissions
4. Check AWS service quotas
5. Review error messages carefully

---

**Happy Deploying! 🚀**
