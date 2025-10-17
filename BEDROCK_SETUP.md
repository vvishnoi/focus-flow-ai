# FocusFlow AI - Bedrock Agent Setup Complete! 🎉

## ✅ What's Been Added

### 1. Bedrock Agent with Claude Sonnet 4.5
- **Model**: `anthropic.claude-sonnet-4-5-20250929-v1:0`
- **Purpose**: AI-powered analysis of eye-tracking data
- **Capabilities**: 
  - Calculates performance metrics
  - Compares against age-appropriate benchmarks
  - Generates natural language therapeutic reports
  - Provides actionable recommendations

### 2. Action Group: Metrics Calculator
- **Tool**: Lambda function
- **API**: OpenAPI 3.0 schema
- **Metrics Calculated**:
  - Tracking Accuracy (%)
  - Time on Target (seconds)
  - Focus Score (0-100)
  - Average Distance from Target
  - Target Acquisition Speed (Level 2)
  - Pattern Recognition (Level 3)

### 3. Knowledge Base
- **Storage**: S3 bucket
- **Content**: Age-appropriate benchmarks (5-7, 8-10, 11-13 years)
- **Levels**: All 3 game levels covered
- **Format**: Structured JSON with interpretation guidelines

### 4. Analysis Trigger
- **Trigger**: S3 ObjectCreated event
- **Flow**: New session → Trigger Lambda → Bedrock Agent → DynamoDB Report
- **Timeout**: 5 minutes for complex analyses

### 5. Therapeutic Prompt
- Expert child development specialist persona
- Warm, encouraging tone
- Structured report format
- Actionable recommendations
- Progress tracking

## 📁 New Files Created

```
backend/
├── bedrock/
│   ├── knowledge-base/
│   │   └── benchmarks.json          ✅ Age-appropriate benchmarks
│   ├── prompts/
│   │   └── analysis-prompt.txt      ✅ Agent instructions
│   └── README.md                     ✅ Bedrock documentation
└── functions/
    └── analysis-trigger/
        ├── index.js                  ✅ Bedrock invocation logic
        └── package.json              ✅ Dependencies

infra/terraform/
└── modules/
    └── bedrock/
        ├── main.tf                   ✅ Bedrock resources
        ├── variables.tf              ✅ Configuration
        └── outputs.tf                ✅ Agent IDs
```

## 🏗️ Complete Architecture

```
Frontend (PWA)
    ↓
API Gateway: POST /submit-session
    ↓
Lambda: Data Ingestor
    ↓
S3: Session Data Storage
    ↓ (S3 Event Trigger)
Lambda: Analysis Trigger
    ↓
Bedrock Agent (Claude Sonnet 4.5)
    ├── Tool: Metrics Calculator Lambda
    ├── Knowledge Base: Benchmarks (S3)
    └── Prompt: Therapeutic Analysis
    ↓
DynamoDB: Reports Table
    ↓
API Gateway: GET /reports/{userId}
    ↓
Frontend: Dashboard
```

## 🚀 Deployment

### Quick Deploy

```bash
cd infra/terraform
./deploy.sh
```

### What Gets Created

**Total Resources: ~25**

1. **S3 Buckets** (2)
   - Session data storage
   - Knowledge base storage

2. **DynamoDB Tables** (2)
   - Reports table
   - Users table

3. **Lambda Functions** (4)
   - data-ingestor
   - metrics-calculator
   - analysis-trigger
   - get-reports

4. **Bedrock Agent** (1)
   - Agent with Claude Sonnet 4.5
   - Action group
   - Agent alias

5. **API Gateway** (1)
   - HTTP API with 2 routes

6. **IAM Roles & Policies** (Multiple)
   - Lambda execution role
   - Bedrock agent role
   - S3, DynamoDB, Bedrock permissions

7. **CloudWatch Log Groups** (5)
   - One per Lambda + API Gateway

8. **S3 Event Notification** (1)
   - Triggers analysis on upload

## 💰 Cost Breakdown

### Monthly Costs (1000 users, 10 sessions each)

**Infrastructure:**
- Lambda: ~$5 (40,000 invocations)
- S3: ~$1 (10GB storage)
- DynamoDB: ~$2 (on-demand)
- API Gateway: ~$3.50 (10,000 requests)
- CloudWatch: ~$1 (logs)

**AI/ML:**
- Bedrock (Claude Sonnet 4.5): ~$100
  - 10,000 sessions × ~2,000 input tokens × $3/1M = $60
  - 10,000 sessions × ~500 output tokens × $15/1M = $75
  - Total: ~$135

**Total: ~$147/month**

### Cost Optimization Options

1. **Use Claude Haiku** (cheaper)
   - Input: $0.25/1M tokens (12x cheaper)
   - Output: $1.25/1M tokens (12x cheaper)
   - Monthly cost: ~$12 instead of $135
   - Trade-off: Slightly less sophisticated analysis

2. **Batch Processing**
   - Process multiple sessions together
   - Reduce per-session overhead

3. **Caching**
   - Cache knowledge base in prompt
   - Reduce input tokens

## 🧪 Testing the Complete Flow

### 1. Deploy Infrastructure

```bash
cd infra/terraform
terraform init
terraform apply
```

### 2. Get Outputs

```bash
# Save all outputs
terraform output > outputs.txt

# Get specific values
API_URL=$(terraform output -raw api_gateway_url)
AGENT_ID=$(terraform output -raw bedrock_agent_id)
BUCKET=$(terraform output -raw s3_bucket_name)
```

### 3. Submit Test Session

```bash
curl -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-child-001",
    "sessionId": "session-'$(date +%s)'",
    "level": "level1",
    "startTime": '$(date +%s000)',
    "endTime": '$(($(date +%s) + 300))000',
    "gazeData": [
      {
        "timestamp": '$(date +%s000)',
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

### 4. Monitor Processing

```bash
# Watch analysis trigger logs
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow

# Check S3 for session data
aws s3 ls s3://$BUCKET/sessions/test-child-001/

# Wait ~30 seconds for Bedrock processing
```

### 5. Fetch Report

```bash
curl $API_URL/reports/test-child-001 | jq
```

Expected response:
```json
{
  "userId": "test-child-001",
  "reports": [
    {
      "sessionId": "session-xxx",
      "timestamp": 1234567890,
      "report": "Session Summary\n===============\n...",
      "modelUsed": "claude-sonnet-4.5"
    }
  ],
  "count": 1
}
```

## 📊 Monitoring

### CloudWatch Dashboards

Create custom dashboard:
```bash
aws cloudwatch put-dashboard \
  --dashboard-name FocusFlow-AI \
  --dashboard-body file://dashboard.json
```

### Key Metrics to Monitor

1. **Lambda Invocations**
   - data-ingestor: Should match frontend submissions
   - analysis-trigger: Should match S3 uploads
   - metrics-calculator: Should match Bedrock invocations

2. **Bedrock Agent**
   - Invocation count
   - Average latency
   - Error rate
   - Token usage

3. **DynamoDB**
   - Read/write capacity
   - Item count
   - Throttled requests

4. **API Gateway**
   - Request count
   - 4xx/5xx errors
   - Latency

### Alerts to Set Up

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name focusflow-high-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# High Bedrock costs
aws cloudwatch put-metric-alarm \
  --alarm-name focusflow-high-bedrock-cost \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 86400 \
  --threshold 200 \
  --comparison-operator GreaterThanThreshold
```

## 🔐 Security Checklist

- [x] IAM roles with least privilege
- [x] S3 encryption at rest
- [x] DynamoDB encryption at rest
- [x] CloudWatch logging enabled
- [x] No hardcoded credentials
- [x] CORS configured properly
- [x] API Gateway throttling (default)
- [ ] API authentication (add in production)
- [ ] VPC for Lambda (optional)
- [ ] WAF for API Gateway (optional)

## 🐛 Troubleshooting

### Bedrock Agent Not Invoking

**Symptoms**: Analysis trigger runs but no report generated

**Solutions**:
1. Check Bedrock model access:
   ```bash
   aws bedrock list-foundation-models | grep claude-sonnet-4
   ```

2. Verify agent is prepared:
   ```bash
   aws bedrock-agent get-agent --agent-id <agent-id>
   ```

3. Check IAM permissions:
   ```bash
   aws iam get-role-policy --role-name focusflow-bedrock-agent-role-dev --policy-name focusflow-bedrock-model-policy-dev
   ```

### High Latency

**Symptoms**: Reports take >60 seconds

**Solutions**:
1. Increase Lambda timeout (currently 5 minutes)
2. Optimize prompt length
3. Consider using Claude Haiku
4. Check Bedrock service health

### Token Limit Exceeded

**Symptoms**: Error about context length

**Solutions**:
1. Reduce session data size
2. Summarize gaze data points
3. Use shorter prompts
4. Split analysis into chunks

## 📚 Next Steps

1. ✅ Bedrock Agent deployed
2. ⏳ Test with real session data
3. ⏳ Refine prompts based on output
4. ⏳ Add more benchmarks
5. ⏳ Implement progress tracking
6. ⏳ Build frontend dashboard
7. ⏳ Add user authentication
8. ⏳ Set up CI/CD pipeline

## 🎓 Learning Resources

- [Bedrock Agents Workshop](https://catalog.workshops.aws/bedrock-agents/)
- [Claude Prompt Engineering](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [OpenAPI Specification](https://swagger.io/specification/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## 🎉 You're Ready!

Your FocusFlow AI backend is now complete with:
- ✅ Serverless infrastructure
- ✅ AI-powered analysis
- ✅ Therapeutic insights
- ✅ Scalable architecture
- ✅ Cost-optimized design

**Deploy and start helping children develop their visual tracking skills!** 🚀
