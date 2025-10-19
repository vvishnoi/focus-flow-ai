# AWS Setup Guide for FocusFlow AI

## Step 1: AWS Account Setup ✅

### Create AWS Account (if you don't have one)
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Follow the registration process
4. Add payment method (Free tier available)

### Enable Required Services
- ✅ AWS Lambda
- ✅ Amazon S3
- ✅ Amazon DynamoDB
- ✅ Amazon API Gateway
- ⚠️ **Amazon Bedrock** (May require access request)

## Step 2: Request Amazon Bedrock Access

Amazon Bedrock requires explicit access request:

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Navigate to **Amazon Bedrock**
3. Click **"Model access"** in left sidebar
4. Click **"Request model access"**
5. Select models:
   - ✅ **Claude 3 Sonnet** (Anthropic)
   - ✅ **Claude 3 Haiku** (Anthropic) - Cheaper alternative
   - ✅ **Titan Text** (Amazon) - Optional
6. Submit request
7. Wait for approval (usually instant, sometimes 24-48 hours)

## Step 3: Create IAM User for Development

### Create User
1. Go to **IAM Console** → **Users** → **Create user**
2. Username: `focusflow-dev`
3. Enable **"Provide user access to the AWS Management Console"** (optional)
4. Click **Next**

### Attach Policies
Select these managed policies:
- ✅ `AWSLambda_FullAccess`
- ✅ `AmazonS3FullAccess`
- ✅ `AmazonDynamoDBFullAccess`
- ✅ `AmazonAPIGatewayAdministrator`
- ✅ `AmazonBedrockFullAccess`
- ✅ `CloudWatchLogsFullAccess`

### Create Access Keys
1. Go to user → **Security credentials**
2. Click **"Create access key"**
3. Select **"Command Line Interface (CLI)"**
4. Download or copy:
   - Access Key ID
   - Secret Access Key
5. **⚠️ Save these securely! You won't see the secret again.**

## Step 4: Configure AWS CLI ✅

AWS CLI is already installed. Now configure it:

```bash
aws configure
```

Enter when prompted:
```
AWS Access Key ID: <your-access-key-id>
AWS Secret Access Key: <your-secret-access-key>
Default region name: us-east-1
Default output format: json
```

### Verify Configuration

```bash
# Check configuration
aws configure list

# Test access
aws sts get-caller-identity

# Should return your account info
```

## Step 5: Choose Your Region

Recommended regions for Bedrock:
- ✅ **us-east-1** (N. Virginia) - Most services, best for Bedrock
- ✅ **us-west-2** (Oregon) - Good alternative
- ⚠️ **eu-west-1** (Ireland) - If you need EU data residency

**Note**: Not all regions support Bedrock. Check [Bedrock regions](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-regions.html)

## Step 6: Set Up AWS Budget Alerts (Recommended)

Avoid surprise bills:

1. Go to **AWS Billing Console** → **Budgets**
2. Click **"Create budget"**
3. Select **"Cost budget"**
4. Set amount: `$50/month` (adjust as needed)
5. Set alert at: `80%` and `100%`
6. Add your email for notifications

## Step 7: Install Additional Tools (Optional)

### AWS SAM CLI (for local Lambda testing)
```bash
brew install aws-sam-cli
sam --version
```

### AWS CDK (for Infrastructure as Code)
```bash
npm install -g aws-cdk
cdk --version
```

### Terraform (alternative IaC)
```bash
brew install terraform
terraform --version
```

## Step 8: Verify Bedrock Access

Once approved, test Bedrock access:

```bash
# List available models
aws bedrock list-foundation-models --region us-east-1

# Should show Claude and other models
```

## Step 9: Create S3 Bucket

```bash
# Create bucket for session data
aws s3 mb s3://focusflow-sessions-$(date +%s) --region us-east-1

# Enable versioning (optional)
aws s3api put-bucket-versioning \
  --bucket focusflow-sessions-<timestamp> \
  --versioning-configuration Status=Enabled
```

## Step 10: Create DynamoDB Tables

```bash
# Create reports table
aws dynamodb create-table \
  --table-name focusflow-reports \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=sessionId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
    AttributeName=sessionId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create users table
aws dynamodb create-table \
  --table-name focusflow-users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Checklist

- [ ] AWS Account created
- [ ] Amazon Bedrock access requested and approved
- [ ] IAM user created with appropriate permissions
- [ ] Access keys generated and saved securely
- [ ] AWS CLI configured (`aws configure`)
- [ ] Configuration verified (`aws sts get-caller-identity`)
- [ ] Region selected (us-east-1 recommended)
- [ ] Budget alerts set up
- [ ] Bedrock access verified
- [ ] S3 bucket created
- [ ] DynamoDB tables created
- [ ] (Optional) SAM CLI installed
- [ ] (Optional) CDK/Terraform installed

## Security Best Practices

### ✅ Do's
- Use IAM roles for Lambda functions
- Enable MFA on root account
- Use least privilege principle
- Rotate access keys regularly
- Enable CloudTrail for audit logs
- Use AWS Secrets Manager for sensitive data
- Enable S3 bucket encryption
- Use VPC for sensitive workloads

### ❌ Don'ts
- Don't use root account for daily operations
- Don't commit AWS credentials to git
- Don't share access keys
- Don't use overly permissive policies
- Don't disable CloudTrail
- Don't leave unused resources running

## Cost Optimization Tips

1. **Use Free Tier**: Take advantage of always-free services
2. **On-Demand Pricing**: Use DynamoDB on-demand for unpredictable workloads
3. **Lambda Memory**: Start with 128MB, increase only if needed
4. **S3 Lifecycle**: Move old sessions to Glacier after 90 days
5. **Bedrock Model**: Use Haiku instead of Sonnet for cost savings
6. **API Caching**: Enable API Gateway caching for repeated requests
7. **CloudWatch Logs**: Set retention period (7-30 days)

## Troubleshooting

### "Access Denied" Errors
- Check IAM permissions
- Verify region matches your resources
- Ensure Bedrock access is approved

### "Region Not Supported"
- Switch to us-east-1 or us-west-2
- Check service availability in your region

### High Costs
- Check AWS Cost Explorer
- Review CloudWatch metrics
- Look for unused resources
- Consider reserved capacity for predictable workloads

## Next Steps

Once setup is complete:
1. ✅ AWS CLI configured
2. ⏳ Create Lambda functions
3. ⏳ Set up Bedrock Agent
4. ⏳ Deploy API Gateway
5. ⏳ Test end-to-end flow
6. ⏳ Update frontend with API endpoints

## Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [AWS CLI Documentation](https://docs.aws.amazon.com/cli/)
- [Amazon Bedrock Getting Started](https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Cost Calculator](https://calculator.aws/)

## Support

- AWS Support: [console.aws.amazon.com/support](https://console.aws.amazon.com/support)
- AWS Forums: [forums.aws.amazon.com](https://forums.aws.amazon.com)
- Stack Overflow: Tag `amazon-web-services`
