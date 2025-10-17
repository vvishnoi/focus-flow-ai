# FocusFlow AI - Complete Deployment Guide

End-to-end deployment guide for the entire FocusFlow AI application on AWS.

## 📋 Overview

This guide covers deploying:
1. **Backend Infrastructure** (Lambda, API Gateway, DynamoDB, S3, Bedrock)
2. **Frontend Application** (Next.js PWA on S3 + CloudFront)

## 🏗️ Complete Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (Desktop/Mobile/Tablet)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    CloudFront CDN                            │
│              (Global Edge Locations)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  S3: Frontend Static Files                   │
│            (HTML, CSS, JS, Images, PWA Manifest)            │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ API Calls
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (HTTP API)                    │
│         POST /submit-session  |  GET /reports/{userId}      │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             ↓                            ↓
┌────────────────────────┐    ┌──────────────────────────────┐
│ Lambda: Data Ingestor  │    │  Lambda: Get Reports         │
└────────────┬───────────┘    └──────────────┬───────────────┘
             │                               │
             ↓                               ↓
┌────────────────────────┐    ┌──────────────────────────────┐
│   S3: Session Data     │    │  DynamoDB: Reports Table     │
└────────────┬───────────┘    └──────────────────────────────┘
             │
             │ S3 Event
             ↓
┌────────────────────────┐
│ Lambda: Analysis       │
│       Trigger          │
└────────────┬───────────┘
             │
             ↓
┌─────────────────────────────────────────────────────────────┐
│              Bedrock Agent (Claude Sonnet 4.5)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │   Metrics    │  │  Knowledge   │  │   Therapeutic    │ │
│  │  Calculator  │  │     Base     │  │     Prompt       │ │
│  │   (Lambda)   │  │  (S3 Bucket) │  │                  │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              DynamoDB: Reports Table                         │
│           (AI-Generated Therapeutic Reports)                 │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Steps

### Phase 1: Prerequisites (15 minutes)

#### 1.1 AWS Account Setup

```bash
# Verify AWS CLI
aws --version
# Should show: aws-cli/2.31.15

# Check credentials
aws sts get-caller-identity
# Should show your account info
```

#### 1.2 Request Bedrock Access

1. Go to AWS Console → Bedrock
2. Click "Model access"
3. Request access to "Claude Sonnet 4.5"
4. Wait for approval (usually instant)

Verify:
```bash
aws bedrock list-foundation-models --region us-east-1 | grep claude-sonnet-4
```

#### 1.3 Install Tools

```bash
# Terraform
terraform --version
# Should show: Terraform v1.5.7

# Node.js
node --version
# Should show: v18.x or higher
```

### Phase 2: Deploy Backend Infrastructure (10 minutes)

#### 2.1 Initialize Terraform

```bash
cd infra/terraform
terraform init
```

#### 2.2 Review Plan

```bash
terraform plan
```

Expected resources: ~30
- 2 S3 buckets (sessions + knowledge base + frontend)
- 2 DynamoDB tables
- 4 Lambda functions
- 1 Bedrock Agent
- 1 API Gateway
- 1 CloudFront distribution
- IAM roles and policies
- CloudWatch log groups

#### 2.3 Deploy

```bash
terraform apply
```

Type `yes` when prompted.

Deployment time: ~5-8 minutes

#### 2.4 Save Outputs

```bash
# Save all outputs
terraform output > ../outputs.txt

# Display key outputs
terraform output api_gateway_url
terraform output cloudfront_url
terraform output bedrock_agent_id
```

### Phase 3: Deploy Frontend (5 minutes)

#### 3.1 Automated Deployment

```bash
cd ../..
./scripts/deploy-frontend.sh
```

This will:
1. Get infrastructure details
2. Configure environment
3. Build Next.js app
4. Upload to S3
5. Invalidate CloudFront cache

#### 3.2 Manual Deployment (Alternative)

```bash
cd frontend

# Get API URL
API_URL=$(cd ../infra/terraform && terraform output -raw api_gateway_url)

# Configure environment
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.production

# Build and deploy
npm install
npm run build
npx next export -o out

# Upload to S3
BUCKET=$(cd ../infra/terraform && terraform output -raw frontend_bucket_name)
aws s3 sync out/ s3://$BUCKET/ --delete

# Invalidate CloudFront
DIST_ID=$(cd ../infra/terraform && terraform output -raw cloudfront_distribution_id)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### Phase 4: Verification (5 minutes)

#### 4.1 Test Backend

```bash
# Get API URL
API_URL=$(cd infra/terraform && terraform output -raw api_gateway_url)

# Test submit session
curl -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
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

# Expected: {"message":"Session data received successfully",...}
```

#### 4.2 Test Frontend

```bash
# Get CloudFront URL
FRONTEND_URL=$(cd infra/terraform && terraform output -raw cloudfront_url)

echo "Frontend URL: $FRONTEND_URL"

# Open in browser
open $FRONTEND_URL  # macOS
# or visit the URL manually
```

#### 4.3 Test Complete Flow

1. Open frontend URL in browser
2. Select a game level
3. Allow camera access
4. Complete calibration
5. Play for 30 seconds
6. End session
7. Check session summary

#### 4.4 Verify AI Analysis

```bash
# Wait 30 seconds for Bedrock processing
sleep 30

# Fetch report
curl $API_URL/reports/test-user-001 | jq
```

Expected: AI-generated therapeutic report

## 📊 Post-Deployment

### Monitor Logs

```bash
# API Gateway logs
aws logs tail /aws/apigateway/focusflow-dev --follow

# Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow

# Check Bedrock invocations
aws bedrock-agent-runtime list-agent-aliases \
  --agent-id $(cd infra/terraform && terraform output -raw bedrock_agent_id)
```

### Check Costs

```bash
# Current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost
```

### Set Up Alerts

```bash
# Budget alert
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json

# High error rate alert
aws cloudwatch put-metric-alarm \
  --alarm-name focusflow-high-errors \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold
```

## 💰 Cost Summary

### Monthly Costs (1000 users, 10 sessions each)

**Infrastructure:**
- Lambda: ~$5
- S3: ~$1
- DynamoDB: ~$2
- API Gateway: ~$3.50
- CloudFront: ~$10
- CloudWatch: ~$1

**AI/ML:**
- Bedrock (Claude Sonnet 4.5): ~$135

**Total: ~$157/month**

### Cost Optimization

**Option 1: Use Claude Haiku**
- Bedrock cost: ~$12 (instead of $135)
- Total: ~$34/month

**Option 2: Free Tier (First Year)**
- Most infrastructure covered by free tier
- Only pay for Bedrock: ~$135/month

## 🔄 Updates and Maintenance

### Update Backend

```bash
cd infra/terraform

# Make changes to Terraform files
# ...

# Apply changes
terraform plan
terraform apply
```

### Update Frontend

```bash
# Make changes to frontend code
# ...

# Redeploy
./scripts/deploy-frontend.sh
```

### Update Lambda Functions

```bash
# Edit Lambda code in backend/functions/
# ...

# Terraform will detect changes and update
cd infra/terraform
terraform apply
```

### Update Bedrock Agent

```bash
# Edit prompts or knowledge base
# ...

# Terraform will update agent
cd infra/terraform
terraform apply
```

## 🗑️ Teardown

### Destroy Everything

```bash
cd infra/terraform

# Empty S3 buckets first
SESSIONS_BUCKET=$(terraform output -raw s3_bucket_name)
FRONTEND_BUCKET=$(terraform output -raw frontend_bucket_name)
KB_BUCKET=$(terraform output -raw knowledge_base_bucket)

aws s3 rm s3://$SESSIONS_BUCKET --recursive
aws s3 rm s3://$FRONTEND_BUCKET --recursive
aws s3 rm s3://$KB_BUCKET --recursive

# Destroy infrastructure
terraform destroy
```

Type `yes` when prompted.

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] AWS account created
- [ ] AWS CLI configured
- [ ] Bedrock access approved
- [ ] Terraform installed
- [ ] Node.js installed

### Backend Deployment
- [ ] Terraform initialized
- [ ] Plan reviewed
- [ ] Infrastructure deployed
- [ ] Outputs saved
- [ ] API Gateway tested
- [ ] Lambda functions working
- [ ] Bedrock Agent responding
- [ ] DynamoDB tables created

### Frontend Deployment
- [ ] Environment configured
- [ ] Application built
- [ ] Files uploaded to S3
- [ ] CloudFront cache invalidated
- [ ] Frontend accessible
- [ ] API calls working
- [ ] PWA features working

### Post-Deployment
- [ ] Complete flow tested
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Budget alerts set
- [ ] Documentation updated
- [ ] Team notified

## 🐛 Common Issues

### Issue: Terraform Apply Fails

**Solution**: Check AWS permissions, verify Bedrock access

### Issue: Frontend Not Loading

**Solution**: Wait 5-10 minutes for CloudFront distribution, check invalidation status

### Issue: API Calls Failing

**Solution**: Check CORS configuration, verify API Gateway URL in frontend

### Issue: Bedrock Agent Not Responding

**Solution**: Verify model access, check IAM permissions, review CloudWatch logs

### Issue: High Costs

**Solution**: Switch to Claude Haiku, optimize caching, review usage patterns

## 🎯 Success Criteria

✅ Frontend accessible via CloudFront URL
✅ Users can play all 3 game levels
✅ Eye-tracking calibration works
✅ Session data saved to S3
✅ Bedrock Agent generates reports
✅ Reports accessible via API
✅ All CloudWatch logs showing activity
✅ No errors in console
✅ PWA installable on mobile
✅ HTTPS working
✅ Costs within budget

## 📚 Documentation

- [AWS Setup Guide](./AWS_SETUP.md)
- [Backend Deployment](./DEPLOYMENT_GUIDE.md)
- [Frontend Deployment](./FRONTEND_DEPLOYMENT.md)
- [Bedrock Setup](./BEDROCK_SETUP.md)
- [Terraform README](./infra/terraform/README.md)

## 🎉 Congratulations!

Your FocusFlow AI application is now fully deployed on AWS!

**Frontend URL**: Check `terraform output cloudfront_url`
**API URL**: Check `terraform output api_gateway_url`

Share the CloudFront URL with users to start helping children develop their visual tracking skills! 🚀
