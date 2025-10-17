# FocusFlow AI - Terraform Infrastructure

This directory contains Terraform configuration to deploy the FocusFlow AI backend infrastructure on AWS.

## Architecture

```
API Gateway (HTTP API)
    ├── POST /submit-session → Lambda: Data Ingestor → S3
    └── GET /reports/{userId} → Lambda: Get Reports → DynamoDB

S3 Bucket
    └── Session data storage with lifecycle policies

DynamoDB Tables
    ├── focusflow-reports-dev (userId, sessionId)
    └── focusflow-users-dev (userId)

Lambda Functions
    ├── data-ingestor (Store session data)
    ├── metrics-calculator (Calculate metrics)
    └── get-reports (Fetch user reports)
```

## Prerequisites

1. **AWS CLI configured**
   ```bash
   aws configure list
   ```

2. **Terraform installed**
   ```bash
   terraform --version
   ```

3. **Node.js** (for Lambda functions)
   ```bash
   node --version
   ```

## Project Structure

```
infra/terraform/
├── main.tf                 # Root configuration
├── variables.tf            # Input variables
├── outputs.tf              # Output values
├── modules/
│   ├── s3/                # S3 bucket module
│   ├── dynamodb/          # DynamoDB tables module
│   ├── lambda/            # Lambda functions module
│   └── api-gateway/       # API Gateway module
└── README.md
```

## Deployment Steps

### 1. Initialize Terraform

```bash
cd infra/terraform
terraform init
```

This will:
- Download required providers (AWS, Archive)
- Initialize backend
- Prepare modules

### 2. Review the Plan

```bash
terraform plan
```

This shows what resources will be created:
- 1 S3 bucket
- 2 DynamoDB tables
- 3 Lambda functions
- 1 API Gateway
- IAM roles and policies
- CloudWatch log groups

### 3. Deploy Infrastructure

```bash
terraform apply
```

Type `yes` when prompted.

Deployment takes ~2-3 minutes.

### 4. Get Outputs

```bash
terraform output
```

You'll see:
- `api_gateway_url` - Your API endpoint
- `s3_bucket_name` - Session data bucket
- `reports_table_name` - DynamoDB table
- Lambda function names

### 5. Test the API

```bash
# Get the API URL
API_URL=$(terraform output -raw api_gateway_url)

# Test submit session endpoint
curl -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "sessionId": "session-456",
    "level": "level1",
    "startTime": 1234567890,
    "endTime": 1234567900,
    "gazeData": [],
    "events": []
  }'

# Test get reports endpoint
curl $API_URL/reports/test-user-123
```

## Configuration

### Variables

Edit `variables.tf` or create `terraform.tfvars`:

```hcl
aws_region   = "us-east-1"
project_name = "focusflow"
environment  = "dev"
frontend_url = "http://localhost:3000"
```

### Environment-Specific Deployments

For production:

```bash
terraform apply -var="environment=prod" -var="frontend_url=https://focusflow.app"
```

## Modules

### S3 Module
- Creates encrypted bucket
- Enables versioning
- Configures lifecycle (90 days → Glacier, 365 days → Delete)
- Blocks public access

### DynamoDB Module
- Creates reports and users tables
- On-demand billing
- Point-in-time recovery
- Server-side encryption
- Global secondary index for timestamp queries

### Lambda Module
- Creates 3 Lambda functions
- IAM role with least privilege
- Environment variables configured
- CloudWatch logging enabled

### API Gateway Module
- HTTP API (cheaper than REST)
- CORS configured
- CloudWatch logging
- Lambda integrations

## Cost Estimation

### Monthly costs (estimated for 1000 users, 10 sessions each):

- **Lambda**: ~$5 (10,000 invocations)
- **S3**: ~$1 (10GB storage)
- **DynamoDB**: ~$2 (on-demand)
- **API Gateway**: ~$3.50 (10,000 requests)
- **CloudWatch**: ~$1 (logs)

**Total**: ~$12-15/month (without Bedrock)

### Free Tier Benefits:
- Lambda: 1M requests/month free
- S3: 5GB storage free
- DynamoDB: 25GB storage free
- API Gateway: 1M requests/month free (first 12 months)

## Updating Infrastructure

### Update Lambda Functions

After changing Lambda code:

```bash
terraform apply
```

Terraform detects code changes via hash and updates functions.

### Update Configuration

1. Edit `variables.tf` or `terraform.tfvars`
2. Run `terraform plan` to review changes
3. Run `terraform apply` to apply changes

## Destroying Infrastructure

**⚠️ Warning**: This deletes all resources and data!

```bash
terraform destroy
```

Type `yes` when prompted.

## Troubleshooting

### "Error: creating Lambda Function"
- Check IAM permissions
- Verify Lambda code is valid
- Check CloudWatch logs

### "Error: creating API Gateway"
- Verify Lambda functions exist
- Check IAM permissions

### "Access Denied" errors
- Verify AWS credentials: `aws sts get-caller-identity`
- Check IAM user has required permissions

### Lambda function not updating
- Terraform uses source code hash
- If hash doesn't change, function won't update
- Force update: `terraform taint module.lambda.aws_lambda_function.data_ingestor`

## State Management

### Local State (Default)
State is stored in `terraform.tfstate` locally.

**⚠️ Don't commit state files to git!**

### Remote State (Recommended for teams)

Create S3 bucket for state:

```bash
aws s3 mb s3://focusflow-terraform-state
```

Enable versioning:

```bash
aws s3api put-bucket-versioning \
  --bucket focusflow-terraform-state \
  --versioning-configuration Status=Enabled
```

Update `main.tf`:

```hcl
terraform {
  backend "s3" {
    bucket = "focusflow-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}
```

Re-initialize:

```bash
terraform init -migrate-state
```

## Security Best Practices

✅ **Do's:**
- Use IAM roles for Lambda (not access keys)
- Enable encryption at rest (S3, DynamoDB)
- Use HTTPS only
- Enable CloudWatch logging
- Use least privilege IAM policies
- Enable MFA on AWS account

❌ **Don'ts:**
- Don't commit `terraform.tfstate` to git
- Don't use root AWS account
- Don't disable encryption
- Don't use overly permissive IAM policies

## Monitoring

### CloudWatch Logs

```bash
# View Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow

# View API Gateway logs
aws logs tail /aws/apigateway/focusflow-dev --follow
```

### Metrics

Check AWS Console → CloudWatch → Metrics:
- Lambda invocations, errors, duration
- API Gateway requests, latency, errors
- DynamoDB read/write capacity

## Next Steps

1. ✅ Deploy infrastructure with Terraform
2. ⏳ Set up Bedrock Agent (manual or separate Terraform)
3. ⏳ Update frontend with API Gateway URL
4. ⏳ Test end-to-end flow
5. ⏳ Set up CI/CD pipeline
6. ⏳ Add monitoring and alerts

## Resources

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
