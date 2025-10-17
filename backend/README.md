# FocusFlow AI - Backend

AWS serverless backend for processing eye-tracking data and generating AI-powered insights using Amazon Bedrock.

## Architecture Overview

```
Frontend (PWA)
    ↓
API Gateway (REST API)
    ↓
Lambda: Data Ingestor
    ↓
S3: Raw Session Data
    ↓ (S3 Event Trigger)
Lambda: Analysis Trigger
    ↓
Amazon Bedrock Agent
    ├── Tool: Metrics Calculator (Lambda)
    ├── Knowledge Base: Benchmark Data
    └── LLM: Claude/Titan
    ↓
DynamoDB: Processed Reports
    ↓
API Gateway: Get Reports
    ↓
Frontend: Dashboard
```

## Prerequisites

### 1. AWS Account
- Active AWS account with appropriate permissions
- Access to Amazon Bedrock (may require requesting access)

### 2. AWS CLI
Already installed! Version: 2.31.15

### 3. Configure AWS Credentials

```bash
aws configure
```

You'll need:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `us-east-1`)
- Default output format (e.g., `json`)

### 4. Additional Tools (Optional)

**AWS SAM CLI** (for local testing):
```bash
brew install aws-sam-cli
```

**Terraform** (if using Terraform for IaC):
```bash
brew install terraform
```

**AWS CDK** (if using CDK for IaC):
```bash
npm install -g aws-cdk
```

## Project Structure

```
backend/
├── functions/
│   ├── data-ingestor/        # Receives session data from frontend
│   │   ├── index.js
│   │   └── package.json
│   ├── analysis-trigger/     # Triggers Bedrock Agent
│   │   ├── index.js
│   │   └── package.json
│   ├── metrics-calculator/   # Bedrock Agent tool
│   │   ├── index.js
│   │   └── package.json
│   └── get-reports/          # Fetches reports from DynamoDB
│       ├── index.js
│       └── package.json
├── bedrock/
│   ├── agent-config.json     # Bedrock Agent configuration
│   ├── knowledge-base/       # Benchmark data
│   │   └── benchmarks.json
│   └── prompts/              # Agent prompts
│       └── analysis-prompt.txt
├── infrastructure/
│   ├── cloudformation/       # CloudFormation templates
│   │   ├── api-gateway.yaml
│   │   ├── lambda.yaml
│   │   ├── s3.yaml
│   │   ├── dynamodb.yaml
│   │   └── bedrock.yaml
│   └── terraform/            # Terraform configs (alternative)
│       └── main.tf
└── README.md
```

## Components

### 1. Data Ingestor Lambda
**Purpose**: Receive session data from frontend and store in S3

**Trigger**: API Gateway POST /submit-session

**Input**:
```json
{
  "userId": "user123",
  "sessionId": "session456",
  "level": "level1",
  "startTime": 1760536494759,
  "endTime": 1760536794765,
  "gazeData": [...],
  "events": [...]
}
```

**Output**: S3 path to stored session

### 2. Analysis Trigger Lambda
**Purpose**: Invoke Bedrock Agent when new session is saved

**Trigger**: S3 Event (ObjectCreated)

**Action**: Calls Bedrock Agent with S3 path

### 3. Metrics Calculator Lambda
**Purpose**: Bedrock Agent tool to calculate performance metrics

**Input**: S3 path to session data

**Calculations**:
- Time on Target %
- Tracking Accuracy
- Target Acquisition Speed
- Smooth Pursuit Score
- Distraction Rate
- Pattern Recognition (Level 3)

**Output**: Structured metrics JSON

### 4. Bedrock Agent
**Purpose**: Analyze metrics and generate natural language reports

**Tools**:
- MetricsCalculator (Lambda function)

**Knowledge Base**:
- Benchmark data for different age groups
- Typical performance ranges
- Interpretation guidelines

**LLM**: Claude 3 Sonnet or Haiku

**Output**: Natural language report + scorecard

### 5. Get Reports Lambda
**Purpose**: Fetch processed reports for dashboard

**Trigger**: API Gateway GET /reports/{userId}

**Output**: List of session reports

## AWS Services Used

### Compute
- **AWS Lambda**: Serverless functions
- **Amazon Bedrock**: AI agent and LLM

### Storage
- **Amazon S3**: Raw session data storage
- **Amazon DynamoDB**: Processed reports and user data

### API
- **Amazon API Gateway**: REST API endpoints

### AI/ML
- **Amazon Bedrock Agent**: Orchestrates AI analysis
- **Amazon Bedrock Knowledge Base**: Stores benchmark data
- **Claude 3 (Anthropic)**: LLM for report generation

### Monitoring
- **Amazon CloudWatch**: Logs and metrics
- **AWS X-Ray**: Distributed tracing

## Environment Variables

Each Lambda function will need:

```bash
# Data Ingestor
S3_BUCKET_NAME=focusflow-sessions
DYNAMODB_TABLE=focusflow-users

# Analysis Trigger
BEDROCK_AGENT_ID=<agent-id>
BEDROCK_AGENT_ALIAS_ID=<alias-id>

# Metrics Calculator
# (No special env vars needed)

# Get Reports
DYNAMODB_TABLE=focusflow-reports
```

## Cost Estimation

### Monthly Costs (Estimated for 1000 users, 10 sessions each)

- **Lambda**: ~$5 (10,000 invocations)
- **S3**: ~$1 (10GB storage, 10,000 requests)
- **DynamoDB**: ~$2 (On-demand pricing)
- **API Gateway**: ~$3.50 (10,000 requests)
- **Bedrock**: ~$50-100 (10,000 agent invocations with Claude)

**Total**: ~$60-110/month

### Free Tier Benefits
- Lambda: 1M requests/month free
- S3: 5GB storage, 20,000 GET requests free
- DynamoDB: 25GB storage, 25 WCU, 25 RCU free
- API Gateway: 1M requests/month free (first 12 months)

## Security Considerations

1. **API Authentication**: Use API keys or AWS Cognito
2. **Data Encryption**: 
   - S3: Server-side encryption (SSE-S3)
   - DynamoDB: Encryption at rest
3. **IAM Roles**: Least privilege principle
4. **CORS**: Configure for frontend domain only
5. **Rate Limiting**: API Gateway throttling

## Next Steps

1. ✅ Install AWS CLI
2. ⏳ Configure AWS credentials
3. ⏳ Request Bedrock access (if needed)
4. ⏳ Create Lambda functions
5. ⏳ Set up S3 bucket
6. ⏳ Create DynamoDB tables
7. ⏳ Configure Bedrock Agent
8. ⏳ Deploy API Gateway
9. ⏳ Test end-to-end flow
10. ⏳ Update frontend with API endpoints

## Development Workflow

1. **Local Development**: Test Lambda functions locally with SAM
2. **Deploy**: Use CloudFormation/Terraform/CDK
3. **Test**: Use Postman or curl to test API endpoints
4. **Monitor**: Check CloudWatch logs
5. **Iterate**: Update functions and redeploy

## Useful Commands

```bash
# Check AWS CLI configuration
aws configure list

# List S3 buckets
aws s3 ls

# List Lambda functions
aws lambda list-functions

# Invoke Lambda locally (with SAM)
sam local invoke DataIngestor -e events/test-event.json

# Deploy with SAM
sam build
sam deploy --guided

# View CloudWatch logs
aws logs tail /aws/lambda/focusflow-data-ingestor --follow
```

## Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [AWS SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)
