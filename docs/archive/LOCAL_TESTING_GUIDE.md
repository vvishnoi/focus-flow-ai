# Local End-to-End Testing Guide

## Prerequisites

1. **Node.js installed** (v18+)
   ```bash
   node --version
   ```

2. **AWS CLI configured** (for backend testing)
   ```bash
   aws configure list
   ```

3. **Backend deployed** (optional, for full E2E)
   ```bash
   cd infra/terraform
   terraform output api_gateway_url
   ```

## Option 1: Frontend Only (Quick Test)

This tests the profile feature without backend integration.

### Step 1: Install Dependencies

```bash
cd frontend
npm install
```

### Step 2: Start Development Server

**For Desktop (HTTP):**
```bash
npm run dev
```
Open: http://localhost:3000

**For Mobile Testing (HTTPS):**
```bash
# First time only: Generate SSL certificates
npm run generate-certs

# Start HTTPS server
npm run dev:https
```
Open: https://localhost:3000

### Step 3: Test Profile Management

1. **Open the app** - You'll be redirected to `/profiles`

2. **Create a profile:**
   - Click "+ Create New Profile"
   - Fill in:
     - Name: "Test Child"
     - Age: 8
     - Gender: Male
     - Weight: 30 (optional)
     - Height: 130 (optional)
   - Click "Create Profile"
   - ✅ Profile should appear in grid

3. **Verify localStorage:**
   - Open browser DevTools (F12)
   - Go to Application → Local Storage → http://localhost:3000
   - Check for:
     - `focusflow_profiles` (array of profiles)
     - `focusflow_active_profile` (profile ID)

4. **Select profile:**
   - Click "Select Profile"
   - ✅ Should redirect to home page
   - ✅ Profile banner should show: "Playing as: Test Child | Age 8"

5. **Create multiple profiles:**
   - Click "Change Profile"
   - Create 2-3 more profiles
   - ✅ All should appear in grid

6. **Switch profiles:**
   - Select different profile
   - ✅ Home page banner should update

7. **Delete profile:**
   - Go to profiles page
   - Click × on a profile
   - Confirm deletion
   - ✅ Profile should be removed

### Step 4: Test Game Flow

1. **Start a game:**
   - Select Level 1
   - Allow camera access
   - Complete calibration
   - ✅ Game should start

2. **Check console:**
   - Open DevTools Console (F12)
   - Play for 10-20 seconds
   - End session
   - Look for: "Submitting session to backend..."
   - ✅ Should see profile data in the log:
     ```
     {
       profileId: "profile_xxx",
       profileName: "Test Child",
       profileAge: 8,
       profileGender: "male",
       ...
     }
     ```

3. **Session summary:**
   - ✅ Summary screen should appear
   - ✅ Shows tracking accuracy
   - ✅ Shows session duration

### Step 5: Test Dashboard

1. **Open dashboard:**
   - Click "View Progress Dashboard"
   - ✅ Profile banner should show active profile
   - ✅ "No reports yet" message (without backend)

## Option 2: Full End-to-End (With Backend)

This tests the complete flow including AWS backend.

### Step 1: Verify Backend is Deployed

```bash
cd infra/terraform
terraform output
```

You should see:
- `api_gateway_url`
- `s3_bucket_name`
- `reports_table_name`

### Step 2: Configure Frontend

```bash
cd frontend

# Get API URL
API_URL=$(cd ../infra/terraform && terraform output -raw api_gateway_url)

# Create environment file
echo "NEXT_PUBLIC_API_URL=$API_URL" > .env.local

# Verify
cat .env.local
```

### Step 3: Start Frontend

```bash
npm run dev
```

### Step 4: Complete Test Flow

1. **Create and select profile** (same as Option 1)

2. **Play a game session:**
   - Select Level 1
   - Complete calibration
   - Play for 30+ seconds
   - End session
   - ✅ Check console for "Session submitted successfully"

3. **Verify backend received data:**
   ```bash
   # In another terminal
   cd infra/terraform
   
   # Get bucket name
   BUCKET=$(terraform output -raw s3_bucket_name)
   
   # List sessions (wait 5 seconds after submission)
   aws s3 ls s3://$BUCKET/sessions/ --recursive
   
   # Download and view latest session
   aws s3 cp s3://$BUCKET/sessions/user_xxx/session_xxx.json - | jq
   ```

4. **Verify profile data in S3:**
   ```bash
   # Should see in the JSON:
   {
     "profileId": "profile_xxx",
     "profileName": "Test Child",
     "profileAge": 8,
     "profileGender": "male",
     ...
   }
   ```

5. **Check DynamoDB:**
   ```bash
   # Get table name
   TABLE=$(terraform output -raw users_table_name)
   
   # Get user record
   aws dynamodb scan --table-name $TABLE --limit 5 | jq
   
   # Should see profile fields:
   {
     "profileId": { "S": "profile_xxx" },
     "profileName": { "S": "Test Child" },
     "profileAge": { "N": "8" },
     "profileGender": { "S": "male" }
   }
   ```

6. **Wait for AI analysis:**
   ```bash
   # Check analysis trigger logs
   aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow
   
   # Wait ~30 seconds for Bedrock processing
   ```

7. **Check dashboard for report:**
   - Refresh dashboard page
   - ✅ AI-generated report should appear
   - ✅ Profile banner shows correct profile

## Option 3: Backend Testing Only

Test backend without frontend.

### Test Profile Data Submission

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

Expected response:
```json
{
  "message": "Session data received successfully",
  "s3Key": "sessions/test-user-001/session-xxx_xxx.json",
  "sessionId": "session-xxx"
}
```

### Verify S3 Storage

```bash
BUCKET=$(terraform output -raw s3_bucket_name)
aws s3 ls s3://$BUCKET/sessions/test-user-001/

# Download and check
aws s3 cp s3://$BUCKET/sessions/test-user-001/session-xxx.json - | jq '.profileName'
# Should output: "Test Child"
```

### Verify DynamoDB

```bash
TABLE=$(terraform output -raw users_table_name)
aws dynamodb get-item \
  --table-name $TABLE \
  --key '{"userId": {"S": "test-user-001"}}' | jq '.Item.profileName'
# Should output: { "S": "Test Child" }
```

## Common Issues & Solutions

### Issue: "No profiles yet" after creating profile

**Solution:**
```bash
# Check browser localStorage
# DevTools → Application → Local Storage
# Should see focusflow_profiles

# If empty, check browser console for errors
# Try incognito mode to rule out extensions
```

### Issue: Profile not showing in session submission

**Solution:**
```bash
# Check browser console
# Look for: "No active profile found"

# Verify active profile is set:
# localStorage.getItem('focusflow_active_profile')

# If null, select profile again
```

### Issue: Backend returns 400 error

**Solution:**
```bash
# Check Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow

# Common causes:
# - Missing profileId field
# - Invalid JSON
# - CORS issue

# Verify request includes all required fields:
# userId, sessionId, profileId, profileName, profileAge, profileGender, level
```

### Issue: Camera not working

**Solution:**
```bash
# For HTTPS (required for camera):
npm run generate-certs
npm run dev:https

# Accept certificate warning in browser
# Allow camera permissions when prompted
```

### Issue: API calls failing (CORS)

**Solution:**
```bash
# Check .env.local has correct API URL
cat frontend/.env.local

# Should be:
# NEXT_PUBLIC_API_URL=https://xxx.execute-api.us-east-1.amazonaws.com/dev

# Restart dev server after changing .env.local
```

## Testing Checklist

### Frontend Only
- [ ] Profile creation works
- [ ] Profile appears in grid
- [ ] Profile stored in localStorage
- [ ] Profile selection works
- [ ] Profile banner shows on home
- [ ] Profile banner shows on dashboard
- [ ] Profile switching works
- [ ] Profile deletion works
- [ ] Multiple profiles can be created
- [ ] Form validation works
- [ ] Mobile responsive design works

### With Backend
- [ ] Session submission includes profile data
- [ ] Profile data stored in S3
- [ ] Profile data stored in DynamoDB
- [ ] AI analysis receives profile data
- [ ] Reports show profile information
- [ ] Multiple profiles tracked separately
- [ ] Backend logs show profile fields

### Edge Cases
- [ ] Create profile with minimum fields (name, age)
- [ ] Create profile with all fields
- [ ] Delete active profile (should clear active)
- [ ] Switch profiles mid-session (should prevent)
- [ ] Create profile with age 3 (minimum)
- [ ] Create profile with age 18 (maximum)
- [ ] Long names (20+ characters)
- [ ] Special characters in name

## Performance Testing

### Load Test (Optional)

```bash
# Create 10 profiles
for i in {1..10}; do
  echo "Creating profile $i"
  # Use browser to create profiles
done

# Verify all profiles load quickly
# Grid should render smoothly
```

### Session Submission Test

```bash
# Submit 5 sessions rapidly
for i in {1..5}; do
  curl -X POST $API_URL/submit-session \
    -H "Content-Type: application/json" \
    -d '{...}' &
done
wait

# Check all sessions stored
aws s3 ls s3://$BUCKET/sessions/test-user-001/
```

## Debugging Tips

### Enable Verbose Logging

```javascript
// In browser console
localStorage.setItem('debug', 'focusflow:*')

// Reload page
// Check console for detailed logs
```

### Check Network Requests

```
DevTools → Network tab
Filter: XHR/Fetch
Look for:
- POST /submit-session
- GET /reports/{userId}
Check request/response payloads
```

### Monitor Backend

```bash
# Watch all Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow &
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow &
aws logs tail /aws/lambda/focusflow-get-reports-dev --follow &

# Play a session and watch logs in real-time
```

## Success Criteria

✅ **Profile Management:**
- Can create, view, select, and delete profiles
- Profile data persists across page reloads
- Profile banner shows correct information

✅ **Game Integration:**
- Profile data included in session submissions
- Console shows profile fields in submission log
- Session summary appears after game

✅ **Backend Integration:**
- Profile data stored in S3
- Profile data stored in DynamoDB
- AI analysis receives profile data

✅ **User Experience:**
- Smooth navigation between pages
- Clear visual feedback
- No console errors
- Mobile responsive

## Next Steps After Testing

1. ✅ Fix any issues found
2. ✅ Test on different browsers
3. ✅ Test on mobile devices
4. ✅ Deploy to production
5. ✅ Train therapists on new feature
6. ✅ Monitor usage and gather feedback

---

**Happy Testing! 🧪**

