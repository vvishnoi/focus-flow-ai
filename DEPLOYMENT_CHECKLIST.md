# FocusFlow AI - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Prerequisites

- [ ] AWS CLI installed and configured
- [ ] Terraform installed (>= 1.5.0)
- [ ] Node.js installed (>= 18.x)
- [ ] Python 3 installed
- [ ] Git repository up to date

### ✅ AWS Account Setup

- [ ] AWS credentials configured (`aws sts get-caller-identity`)
- [ ] Sufficient permissions (Admin or PowerUser)
- [ ] Bedrock model access enabled (Claude, Titan)
- [ ] Region set to us-east-1

### ✅ Code Ready

- [ ] All changes committed to git
- [ ] Frontend code built successfully
- [ ] Lambda functions packaged
- [ ] Research embeddings processed

## Deployment Steps

### Option A: Automated Deployment (Recommended)

```bash
./scripts/deploy-complete-system.sh
```

This script will:
1. Check prerequisites
2. Deploy backend with Terraform
3. Build and deploy frontend
4. Verify all components
5. Display URLs and next steps

### Option B: Manual Deployment

#### 1. Deploy Backend Infrastructure

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
cd ../..
```

#### 2. Build Frontend

```bash
cd frontend
npm install
npm run build
cd ..
```

#### 3. Deploy Frontend to S3

```bash
BUCKET=$(aws s3 ls | grep focusflow-frontend-dev | awk '{print $3}')
aws s3 sync frontend/out/ s3://$BUCKET/ --delete
```

#### 4. Invalidate CloudFront Cache

```bash
DIST_ID=$(aws cloudfront list-distributions --query "DistributionList.Items[?contains(Origins.Items[0].DomainName, '$BUCKET')].Id" --output text)
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

## Post-Deployment Verification

### ✅ Backend Components

```bash
# Check Lambda functions
aws lambda list-functions --query 'Functions[?contains(FunctionName, `focusflow`)].FunctionName'

# Check DynamoDB tables
aws dynamodb list-tables --query 'TableNames[?contains(@, `focusflow`)]'

# Check S3 buckets
aws s3 ls | grep focusflow

# Check Bedrock Agent
aws bedrock-agent get-agent --agent-id QPVURTILVY

# Check Research RAG
aws lambda invoke \
  --function-name focusflow-research-rag-dev \
  --payload '{"inputText":"test"}' \
  response.json
```

### ✅ Frontend

```bash
# Get CloudFront URL
cd infra/terraform
terraform output cloudfront_url
```

Visit the URL and verify:
- [ ] Landing page loads
- [ ] Profile modal opens
- [ ] Game levels accessible
- [ ] Reports page loads

### ✅ Integration Tests

- [ ] Create a profile
- [ ] Complete a game session
- [ ] Verify session data in S3
- [ ] Check report generated in DynamoDB
- [ ] View report in frontend

## Rollback Plan

If deployment fails:

```bash
# Rollback Terraform
cd infra/terraform
terraform destroy -target=<failed-resource>

# Restore previous frontend
aws s3 sync s3://$BUCKET-backup/ s3://$BUCKET/
```

## Monitoring Setup

### CloudWatch Alarms

```bash
# Set billing alarm
aws cloudwatch put-metric-alarm \
  --alarm-name focusflow-billing-alarm \
  --alarm-description "Alert when costs exceed $50" \
  --metric-name EstimatedCharges \
  --namespace AWS/Billing \
  --statistic Maximum \
  --period 21600 \
  --evaluation-periods 1 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

### Log Groups

- `/aws/lambda/focusflow-*` - Lambda logs
- `/aws/apigateway/focusflow-dev` - API Gateway logs

## Cost Monitoring

Expected monthly costs:
- Frontend: $1-2
- Backend: $10-15
- AI/ML: $7-13
- **Total: $18-36/month**

## Troubleshooting

### Frontend not loading
- Check CloudFront distribution status
- Verify S3 bucket policy
- Check browser console for errors

### API errors
- Check Lambda function logs
- Verify API Gateway configuration
- Check IAM permissions

### Agent not responding
- Verify agent is PREPARED
- Check action group connections
- Review agent logs in CloudWatch

### Research RAG errors
- Verify embeddings in S3
- Check Lambda permissions
- Test Lambda directly

## Success Criteria

- [ ] All Lambda functions deployed (8)
- [ ] All DynamoDB tables created (3)
- [ ] All S3 buckets configured (3)
- [ ] Bedrock Agent status: PREPARED
- [ ] Research RAG tested successfully
- [ ] Frontend accessible via CloudFront
- [ ] End-to-end flow working
- [ ] Costs within budget

## Documentation

After deployment, review:
- `SYSTEM_STATUS_REPORT.md` - Complete system status
- `END_TO_END_INTEGRATION_REVIEW.md` - Integration details
- `BEDROCK_AGENT_RESEARCH_INTEGRATION.md` - Research setup

## Support

For issues:
1. Check CloudWatch logs
2. Review error messages
3. Consult documentation
4. Test individual components

## Next Steps After Deployment

1. **Test thoroughly**
   - Complete user flow
   - Test all features
   - Verify research integration

2. **Set up monitoring**
   - CloudWatch dashboards
   - Billing alarms
   - Error notifications

3. **Optimize**
   - Review performance metrics
   - Adjust Lambda memory/timeout
   - Optimize costs

4. **Document**
   - Update README
   - Document any custom configurations
   - Note any issues encountered

5. **Plan next iteration**
   - Gather feedback
   - Plan enhancements
   - Schedule updates
