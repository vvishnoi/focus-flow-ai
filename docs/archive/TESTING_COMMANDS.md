# Quick Testing Commands Reference

## Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Start development server (HTTP)
npm run dev
# Open: http://localhost:3000

# Start development server (HTTPS - for mobile/camera)
npm run generate-certs  # First time only
npm run dev:https
# Open: https://localhost:3000

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## Backend Verification

```bash
# Get infrastructure outputs
cd infra/terraform
terraform output

# Get specific values
terraform output -raw api_gateway_url
terraform output -raw s3_bucket_name
terraform output -raw reports_table_name
```

## Configure Frontend with Backend

```bash
cd frontend

# Set API URL
API_URL=$(cd ../infra/terraform && terraform output -raw api_gateway_url)
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local

# Verify
cat .env.local
```

## Test Session Submission

```bash
# Get API URL
cd infra/terraform
API_URL=$(terraform output -raw api_gateway_url)

# Submit test session with profile
curl -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-001",
    "sessionId": "session-'$(date +%s)'",
    "profileId": "profile-test-001",
    "profileName": "Test Child",
    "profileAge": 8,
    "profileGender": "male",
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

## Verify S3 Storage

```bash
# Get bucket name
cd infra/terraform
BUCKET=$(terraform output -raw s3_bucket_name)

# List all sessions
aws s3 ls s3://$BUCKET/sessions/ --recursive

# List sessions for specific user
aws s3 ls s3://$BUCKET/sessions/test-user-001/

# Download and view session
aws s3 cp s3://$BUCKET/sessions/test-user-001/session-xxx.json - | jq

# Check for profile data
aws s3 cp s3://$BUCKET/sessions/test-user-001/session-xxx.json - | jq '.profileName'
```

## Verify DynamoDB

```bash
# Get table name
cd infra/terraform
TABLE=$(terraform output -raw users_table_name)

# Scan all users
aws dynamodb scan --table-name $TABLE | jq

# Get specific user
aws dynamodb get-item \
  --table-name $TABLE \
  --key '{"userId": {"S": "test-user-001"}}' | jq

# Check profile fields
aws dynamodb get-item \
  --table-name $TABLE \
  --key '{"userId": {"S": "test-user-001"}}' | jq '.Item.profileName'
```

## Monitor Lambda Logs

```bash
# Data Ingestor
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow

# Analysis Trigger
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow

# Metrics Calculator
aws logs tail /aws/lambda/focusflow-metrics-calculator-dev --follow

# Get Reports
aws logs tail /aws/lambda/focusflow-get-reports-dev --follow

# All at once (in separate terminals)
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow &
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow &
aws logs tail /aws/lambda/focusflow-metrics-calculator-dev --follow &
```

## Check Reports

```bash
# Get API URL
cd infra/terraform
API_URL=$(terraform output -raw api_gateway_url)

# Fetch reports for user
curl $API_URL/reports/test-user-001 | jq

# Count reports
curl $API_URL/reports/test-user-001 | jq '.count'

# View latest report
curl $API_URL/reports/test-user-001 | jq '.reports[0].report'
```

## Browser Console Commands

```javascript
// Check localStorage profiles
JSON.parse(localStorage.getItem('focusflow_profiles'))

// Check active profile
localStorage.getItem('focusflow_active_profile')

// Get active profile details
const profiles = JSON.parse(localStorage.getItem('focusflow_profiles'))
const activeId = localStorage.getItem('focusflow_active_profile')
profiles.find(p => p.id === activeId)

// Clear all profiles (reset)
localStorage.removeItem('focusflow_profiles')
localStorage.removeItem('focusflow_active_profile')

// Enable debug logging
localStorage.setItem('debug', 'focusflow:*')
```

## Deployment Commands

```bash
# Deploy frontend
./scripts/deploy-frontend.sh

# Deploy backend
cd infra/terraform
terraform apply

# Deploy specific Lambda
cd infra/terraform
terraform taint module.lambda.aws_lambda_function.data_ingestor
terraform apply
```

## Cleanup Commands

```bash
# Clear S3 bucket
cd infra/terraform
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 rm s3://$BUCKET/sessions/ --recursive

# Clear DynamoDB table
TABLE=$(terraform output -raw users_table_name)
aws dynamodb scan --table-name $TABLE --attributes-to-get userId | \
  jq -r '.Items[].userId.S' | \
  xargs -I {} aws dynamodb delete-item --table-name $TABLE --key '{"userId": {"S": "{}"}}'

# Destroy infrastructure (CAREFUL!)
cd infra/terraform
terraform destroy
```

## Quick Test Script

```bash
#!/bin/bash
# Save as test-profile-feature.sh

echo "🧪 Testing Profile Feature..."

# 1. Check frontend
echo "1️⃣ Checking frontend..."
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Frontend builds successfully"
else
  echo "❌ Frontend build failed"
  exit 1
fi

# 2. Check backend
echo "2️⃣ Checking backend..."
cd ../infra/terraform
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null)
if [ -z "$API_URL" ]; then
  echo "⚠️  Backend not deployed"
else
  echo "✅ Backend deployed: $API_URL"
fi

# 3. Test API
echo "3️⃣ Testing API..."
RESPONSE=$(curl -s -X POST $API_URL/submit-session \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test",
    "sessionId": "test",
    "profileId": "test",
    "profileName": "Test",
    "profileAge": 8,
    "profileGender": "male",
    "level": "level1",
    "startTime": 1234567890000,
    "endTime": 1234567900000,
    "gazeData": [],
    "events": []
  }')

if echo "$RESPONSE" | grep -q "successfully"; then
  echo "✅ API accepts profile data"
else
  echo "❌ API test failed"
  echo "$RESPONSE"
fi

echo ""
echo "🎉 Testing complete!"
```

## Troubleshooting Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check AWS CLI
aws --version
aws sts get-caller-identity

# Check Terraform
terraform --version

# Check if port 3000 is in use
lsof -i :3000

# Kill process on port 3000
kill -9 $(lsof -t -i:3000)

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for TypeScript errors
cd frontend
npx tsc --noEmit

# Check for linting errors
npx eslint . --ext .ts,.tsx
```

## Performance Testing

```bash
# Test multiple session submissions
for i in {1..10}; do
  echo "Submitting session $i..."
  curl -X POST $API_URL/submit-session \
    -H "Content-Type: application/json" \
    -d '{
      "userId": "perf-test-'$i'",
      "sessionId": "session-'$(date +%s)'",
      "profileId": "profile-'$i'",
      "profileName": "Test Child '$i'",
      "profileAge": 8,
      "profileGender": "male",
      "level": "level1",
      "startTime": '$(date +%s000)',
      "endTime": '$(($(date +%s) + 300))000',
      "gazeData": [],
      "events": []
    }' &
done
wait
echo "All submissions complete"

# Check S3
aws s3 ls s3://$BUCKET/sessions/ --recursive | wc -l
```

## Useful Aliases

```bash
# Add to ~/.zshrc or ~/.bashrc

# FocusFlow shortcuts
alias ff-dev='cd ~/git/focus-flow-ai/frontend && npm run dev'
alias ff-https='cd ~/git/focus-flow-ai/frontend && npm run dev:https'
alias ff-build='cd ~/git/focus-flow-ai/frontend && npm run build'
alias ff-logs='aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow'
alias ff-deploy='cd ~/git/focus-flow-ai && ./scripts/deploy-frontend.sh'
alias ff-tf='cd ~/git/focus-flow-ai/infra/terraform'

# Reload shell
source ~/.zshrc  # or source ~/.bashrc
```

---

**Copy and paste these commands as needed! 📋**

