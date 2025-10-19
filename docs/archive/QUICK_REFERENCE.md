# FocusFlow AI - Quick Reference

## 🚀 Quick Start

### Test Everything
```bash
./scripts/test-api-endpoints.sh
```

### Deploy Frontend
```bash
cd frontend
npm run build
aws s3 sync out/ s3://focusflow-frontend-dev/
aws cloudfront create-invalidation --distribution-id d2iqvvvvvvvvvv --paths "/*"
```

### Deploy Lambda
```bash
cd backend/functions/[function-name]
zip -r ../[function-name].zip .
aws lambda update-function-code \
  --function-name focusflow-[function-name]-dev \
  --zip-file fileb://../[function-name].zip
```

### Deploy Infrastructure
```bash
cd infra/terraform
terraform apply
```

---

## 🔗 URLs

| Service | URL |
|---------|-----|
| Frontend | `https://d3sy81kn37rion.cloudfront.net` |
| API Gateway | `https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev` |
| S3 Frontend | `focusflow-frontend-dev` |
| S3 Sessions | `focusflow-sessions-dev` |
| S3 Knowledge Base | `focusflow-bedrock-kb-dev` |

---

## 📡 API Endpoints

```bash
BASE_URL="https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev"

# Submit session
POST $BASE_URL/submit-session

# Get reports
GET $BASE_URL/reports/{userId}

# Create profile
POST $BASE_URL/profiles

# Get profiles
GET $BASE_URL/profiles/{therapistId}

# Delete profile
DELETE $BASE_URL/profiles/{therapistId}/{profileId}
```

---

## 🔍 Debugging

### Check Logs
```bash
# API Gateway
aws logs tail /aws/apigateway/focusflow-dev --follow

# Lambda (any function)
aws logs tail /aws/lambda/focusflow-[function-name]-dev --follow
```

### Test Lambda Directly
```bash
aws lambda invoke \
  --function-name focusflow-[function-name]-dev \
  --payload '{"test":"data"}' \
  response.json
```

### Check API Gateway Routes
```bash
aws apigatewayv2 get-routes --api-id oiks1jrjw2
```

### Check Lambda Permissions
```bash
aws lambda get-policy --function-name focusflow-[function-name]-dev
```

---

## 📊 Status Check

### All Lambda Functions
```bash
aws lambda list-functions --output json | grep -i focusflow
```

### DynamoDB Tables
```bash
aws dynamodb list-tables | grep focusflow
```

### S3 Buckets
```bash
aws s3 ls | grep focusflow
```

### API Gateway
```bash
aws apigatewayv2 get-apis | grep focusflow
```

---

## 🛠️ Common Tasks

### Update Lambda Environment Variable
```bash
aws lambda update-function-configuration \
  --function-name focusflow-[function-name]-dev \
  --environment Variables={KEY=VALUE}
```

### Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id E1CP1219GKD5ZW \
  --paths "/*"
```

### Query DynamoDB
```bash
aws dynamodb scan --table-name focusflow-[table-name]-dev
```

### List S3 Objects
```bash
aws s3 ls s3://focusflow-sessions-dev/sessions/ --recursive
```

---

## 🐛 Troubleshooting

### Lambda 500 Error
1. Check Lambda permissions for API Gateway
2. Verify environment variables are set
3. Check CloudWatch logs for errors

### Frontend Not Updating
1. Clear browser cache
2. Invalidate CloudFront cache
3. Check S3 bucket has latest files

### API Gateway 404
1. Verify route exists: `aws apigatewayv2 get-routes --api-id oiks1jrjw2`
2. Check integration is configured
3. Verify Lambda permission exists

### DynamoDB Access Denied
1. Check Lambda IAM role has DynamoDB permissions
2. Verify table name in environment variables
3. Check table exists in correct region

---

## 📝 Key Files

| File | Purpose |
|------|---------|
| `COMPLETE_SYSTEM_STATUS.md` | Full system overview |
| `LAMBDA_FIX_COMPLETE.md` | Lambda fix summary |
| `SCORECARD_ENHANCEMENTS_COMPLETE.md` | Scorecard features |
| `scripts/test-api-endpoints.sh` | API testing script |

---

## 🎯 Quick Tests

### Test Session Submission
```bash
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/submit-session" \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","sessionId":"123","profileId":"p1","profileName":"Test","profileAge":10,"profileGender":"male","level":"follow-the-leader","startTime":1700000000000,"endTime":1700000046000,"sessionDuration":46,"datePlayed":"2024-01-15","gazeData":[{"timestamp":1700000000000,"gazeX":100,"gazeY":100,"objectId":"obj1","objectX":105,"objectY":105}],"events":[],"metrics":{"accuracyPercentage":85}}'
```

### Test Get Reports
```bash
curl "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/reports/test"
```

### Test Create Profile
```bash
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/profiles" \
  -H "Content-Type: application/json" \
  -d '{"therapistId":"therapist-1","name":"Test Patient","age":10,"gender":"female"}'
```

---

## ✅ System Status

**All Systems:** ✅ OPERATIONAL

- Frontend: ✅
- API Gateway: ✅
- Lambda Functions: ✅
- DynamoDB: ✅
- S3: ✅
- Bedrock Agent: ✅

**Last Verified:** October 19, 2025
