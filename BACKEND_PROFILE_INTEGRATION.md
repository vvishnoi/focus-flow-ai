# Backend Profile Integration - Complete Guide

## ✅ What's Been Implemented

### Backend Infrastructure

**New DynamoDB Table:**
- `focusflow-profiles-dev` - Stores all child profiles
  - Partition Key: `therapistId` (S)
  - Sort Key: `profileId` (S)
  - GSI: `CreatedAtIndex` for sorting by creation date

**New Lambda Functions:**
1. `create-profile` - Create a new child profile
2. `get-profiles` - Get all profiles for a therapist
3. `delete-profile` - Delete a profile

**New API Endpoints:**
- `POST /profiles` - Create profile
- `GET /profiles/{therapistId}` - Get all profiles
- `DELETE /profiles/{therapistId}/{profileId}` - Delete profile

### Frontend Changes

**Updated Files:**
- `frontend/lib/profiles.ts` - Now uses backend API instead of localStorage
- `frontend/app/profiles/page.tsx` - Async profile operations
- `frontend/app/page.tsx` - Async profile loading
- `frontend/app/dashboard/page.tsx` - Async profile loading
- `frontend/components/GameCanvas.tsx` - Uses sync profile getter

**Key Changes:**
- Profiles stored in DynamoDB (not localStorage)
- Active profile cached in localStorage for quick access
- Therapist ID generated and stored in localStorage
- All profile operations go through backend API

## 🏗️ Architecture

```
Therapist Browser
    ↓
localStorage (therapistId + active profile cache)
    ↓
Frontend (React/Next.js)
    ↓
API Gateway
    ├── POST /profiles → Lambda: create-profile → DynamoDB
    ├── GET /profiles/{therapistId} → Lambda: get-profiles → DynamoDB
    └── DELETE /profiles/{therapistId}/{profileId} → Lambda: delete-profile → DynamoDB
```

## 📊 Data Flow

### 1. Therapist Opens App
```
1. Frontend checks localStorage for therapistId
2. If not found, generates new therapistId
3. Stores therapistId in localStorage
4. Fetches profiles from backend using therapistId
```

### 2. Create Profile
```
1. Therapist fills form
2. Frontend sends POST /profiles with therapistId
3. Lambda creates profile in DynamoDB
4. Returns profile with generated profileId
5. Frontend updates profile list
```

### 3. Select Profile
```
1. Therapist clicks "Select Profile"
2. Frontend stores profile in localStorage (cache)
3. Redirects to home page
4. Home page reads from localStorage cache
```

### 4. Play Game
```
1. Game reads active profile from localStorage
2. Includes profile data in session submission
3. Backend stores session with profile info
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend Infrastructure

```bash
cd infra/terraform

# Initialize (if first time)
terraform init

# Review changes
terraform plan

# Deploy
terraform apply
```

**What gets created:**
- DynamoDB profiles table
- 3 new Lambda functions
- 3 new API Gateway routes
- IAM policies for Lambda access

### Step 2: Verify Deployment

```bash
# Check outputs
terraform output

# Should see:
# - api_gateway_url
# - profiles_table_name
# - All Lambda function names
```

### Step 3: Configure Frontend

```bash
cd ../../frontend

# Get API URL
API_URL=$(cd ../infra/terraform && terraform output -raw api_gateway_url)

# Create environment file
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local

# Verify
cat .env.local
```

### Step 4: Install Dependencies

```bash
# In frontend directory
npm install
```

### Step 5: Test Locally

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

## 🧪 Testing

### Test 1: Create Profile via API

```bash
cd infra/terraform
API_URL=$(terraform output -raw api_gateway_url)

# Create a test profile
curl -X POST $API_URL/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "test-therapist-001",
    "name": "Test Child",
    "age": 8,
    "gender": "male",
    "weight": 30,
    "height": 130
  }'
```

Expected response:
```json
{
  "message": "Profile created successfully",
  "profile": {
    "profileId": "profile_xxx",
    "therapistId": "test-therapist-001",
    "name": "Test Child",
    "age": 8,
    "gender": "male",
    "weight": 30,
    "height": 130,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
}
```

### Test 2: Get Profiles

```bash
curl $API_URL/profiles/test-therapist-001 | jq
```

Expected response:
```json
{
  "therapistId": "test-therapist-001",
  "profiles": [
    {
      "profileId": "profile_xxx",
      "name": "Test Child",
      ...
    }
  ],
  "count": 1
}
```

### Test 3: Delete Profile

```bash
curl -X DELETE $API_URL/profiles/test-therapist-001/profile_xxx
```

Expected response:
```json
{
  "message": "Profile deleted successfully",
  "profileId": "profile_xxx"
}
```

### Test 4: Verify DynamoDB

```bash
# Get table name
TABLE=$(terraform output -raw profiles_table_name)

# Scan profiles
aws dynamodb scan --table-name $TABLE | jq

# Query profiles for therapist
aws dynamodb query \
  --table-name $TABLE \
  --key-condition-expression "therapistId = :tid" \
  --expression-attribute-values '{":tid": {"S": "test-therapist-001"}}' | jq
```

### Test 5: Frontend End-to-End

1. **Open app**: http://localhost:3000
2. **Check console**: Should see therapistId generated
3. **Create profile**: Fill form and submit
4. **Check network tab**: Should see POST /profiles request
5. **Verify profile appears**: Should show in grid
6. **Select profile**: Click "Select Profile"
7. **Check localStorage**: Should have active profile cached
8. **Play game**: Profile data should be in session submission
9. **Delete profile**: Click × button
10. **Verify deleted**: Should disappear from grid

## 📝 API Documentation

### POST /profiles

Create a new child profile.

**Request:**
```json
{
  "therapistId": "therapist_xxx",
  "name": "John Doe",
  "age": 8,
  "gender": "male",
  "weight": 30,
  "height": 130
}
```

**Response (201):**
```json
{
  "message": "Profile created successfully",
  "profile": {
    "profileId": "profile_xxx",
    "therapistId": "therapist_xxx",
    "name": "John Doe",
    "age": 8,
    "gender": "male",
    "weight": 30,
    "height": 130,
    "createdAt": 1234567890,
    "updatedAt": 1234567890
  }
}
```

**Errors:**
- 400: Missing required fields or invalid age
- 500: Server error

### GET /profiles/{therapistId}

Get all profiles for a therapist.

**Response (200):**
```json
{
  "therapistId": "therapist_xxx",
  "profiles": [
    {
      "profileId": "profile_xxx",
      "therapistId": "therapist_xxx",
      "name": "John Doe",
      "age": 8,
      "gender": "male",
      "weight": 30,
      "height": 130,
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "count": 1
}
```

**Errors:**
- 400: Missing therapistId
- 500: Server error

### DELETE /profiles/{therapistId}/{profileId}

Delete a profile.

**Response (200):**
```json
{
  "message": "Profile deleted successfully",
  "profileId": "profile_xxx"
}
```

**Errors:**
- 400: Missing therapistId or profileId
- 500: Server error

## 🔍 Monitoring

### CloudWatch Logs

```bash
# Create profile logs
aws logs tail /aws/lambda/focusflow-create-profile-dev --follow

# Get profiles logs
aws logs tail /aws/lambda/focusflow-get-profiles-dev --follow

# Delete profile logs
aws logs tail /aws/lambda/focusflow-delete-profile-dev --follow
```

### DynamoDB Metrics

Check AWS Console → DynamoDB → focusflow-profiles-dev → Metrics:
- Read/write capacity
- Item count
- Throttled requests

### API Gateway Metrics

Check AWS Console → API Gateway → focusflow-api-dev → Metrics:
- Request count
- Latency
- 4xx/5xx errors

## 💰 Cost Impact

**Additional Monthly Costs (1000 therapists, 10 profiles each):**

- **DynamoDB**: ~$0.50
  - Storage: 10,000 profiles × 1KB = 10MB (negligible)
  - Reads: 1000 therapists × 10 loads/day × 30 days = 300K reads = $0.08
  - Writes: 10,000 profiles created = $0.01

- **Lambda**: ~$0.10
  - 300K invocations × $0.20/1M = $0.06
  - Compute time: negligible

- **API Gateway**: ~$0.30
  - 300K requests × $1.00/1M = $0.30

**Total Additional Cost: ~$0.90/month**

## 🐛 Troubleshooting

### Issue: "Failed to fetch profiles"

**Check:**
```bash
# Verify API URL
cat frontend/.env.local

# Test API directly
curl $API_URL/profiles/test-therapist-001

# Check Lambda logs
aws logs tail /aws/lambda/focusflow-get-profiles-dev --follow
```

### Issue: "Failed to create profile"

**Check:**
```bash
# Check request payload in browser Network tab
# Verify all required fields present

# Check Lambda logs
aws logs tail /aws/lambda/focusflow-create-profile-dev --follow

# Check DynamoDB table exists
aws dynamodb describe-table --table-name focusflow-profiles-dev
```

### Issue: Profiles not persisting

**Check:**
```bash
# Verify DynamoDB table
TABLE=$(cd infra/terraform && terraform output -raw profiles_table_name)
aws dynamodb scan --table-name $TABLE

# Check IAM permissions
aws iam get-role-policy \
  --role-name focusflow-lambda-role-dev \
  --policy-name focusflow-lambda-profiles-dynamodb-policy-dev
```

### Issue: CORS errors

**Check:**
```bash
# Verify frontend URL in Terraform
cd infra/terraform
terraform output

# Update if needed
terraform apply -var="frontend_url=http://localhost:3000"
```

## 📋 Deployment Checklist

- [ ] Backend deployed (`terraform apply`)
- [ ] Profiles table created
- [ ] Lambda functions deployed
- [ ] API Gateway routes created
- [ ] Frontend configured with API URL
- [ ] Dependencies installed
- [ ] Local testing passed
- [ ] API endpoints tested
- [ ] DynamoDB verified
- [ ] CloudWatch logs working
- [ ] CORS configured correctly
- [ ] Error handling tested
- [ ] Production deployment planned

## 🎯 Next Steps

1. ✅ Deploy to production
2. ✅ Add profile photos/avatars
3. ✅ Add profile editing capability
4. ✅ Add profile search/filter
5. ✅ Add bulk profile import
6. ✅ Add profile export
7. ✅ Add profile analytics
8. ✅ Add multi-therapist support with authentication

## 📚 Related Documentation

- `PROFILE_FEATURE.md` - Feature overview
- `PROFILE_QUICK_START.md` - User guide
- `LOCAL_TESTING_GUIDE.md` - Testing guide
- `TESTING_COMMANDS.md` - Command reference

---

**Backend integration complete! Profiles now stored in DynamoDB. 🎉**

