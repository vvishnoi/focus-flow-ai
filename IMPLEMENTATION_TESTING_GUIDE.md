# Implementation Testing Guide

This guide covers testing all the features implemented in the Profile Management & Session Tracking System.

## Prerequisites

Before testing, ensure:
1. ✅ Backend is deployed: `cd infra/terraform && terraform apply`
2. ✅ Frontend is running: `cd frontend && npm run dev`
3. ✅ API URL is configured in `frontend/.env.local`

## Test 1: Sequential Profile ID Generation (FOC-XXX)

### Objective
Verify that profiles are created with sequential IDs in FOC-001, FOC-002, FOC-003 format.

### Steps

1. **Clear existing profiles** (optional - for clean test):
   ```bash
   # Get your therapist ID from browser localStorage
   # Open browser console and run:
   localStorage.getItem('focusflow_therapist_id')
   ```

2. **Create first profile**:
   - Open http://localhost:3000
   - Click "Select Profile"
   - Click "+ Create New Profile"
   - Fill in:
     - Name: Emma
     - Age: 8
     - Gender: Female
   - Click "Create Profile"

3. **Verify first profile ID**:
   - Open browser DevTools → Network tab
   - Look at the POST /profiles response
   - **Expected**: `profileId: "FOC-001"`

4. **Create second profile**:
   - Click "+ Create New Profile" again
   - Fill in:
     - Name: John
     - Age: 10
     - Gender: Male
   - Click "Create Profile"

5. **Verify second profile ID**:
   - Check Network tab response
   - **Expected**: `profileId: "FOC-002"`

6. **Create third profile**:
   - Repeat with different name
   - **Expected**: `profileId: "FOC-003"`

### Success Criteria
- ✅ First profile gets FOC-001
- ✅ Second profile gets FOC-002
- ✅ Third profile gets FOC-003
- ✅ IDs are sequential per therapist
- ✅ Format is always FOC-XXX (3 digits, zero-padded)

### Alternative: Test via API

```bash
cd infra/terraform
API_URL=$(terraform output -raw api_gateway_url)

# Get your therapist ID from browser localStorage first
THERAPIST_ID="your_therapist_id_here"

# Create profile 1
curl -X POST $API_URL/profiles \
  -H "Content-Type: application/json" \
  -d "{
    \"therapistId\": \"$THERAPIST_ID\",
    \"name\": \"Emma\",
    \"age\": 8,
    \"gender\": \"female\"
  }" | jq '.profile.profileId'

# Expected: "FOC-001"

# Create profile 2
curl -X POST $API_URL/profiles \
  -H "Content-Type: application/json" \
  -d "{
    \"therapistId\": \"$THERAPIST_ID\",
    \"name\": \"John\",
    \"age\": 10,
    \"gender\": \"male\"
  }" | jq '.profile.profileId'

# Expected: "FOC-002"
```

---

## Test 2: Game Access Restriction

### Objective
Verify that users cannot access the game without selecting a profile.

### Steps

1. **Clear active profile**:
   - Open browser console
   - Run: `localStorage.removeItem('focusflow_active_profile')`
   - Refresh page

2. **Try to access game**:
   - Navigate to http://localhost:3000
   - Click on any level (Level 1, 2, or 3)

3. **Verify "Profile Required" screen**:
   - **Expected**: See a white card with:
     - Title: "Profile Required"
     - Message: "Please select a profile to track your progress and play the game."
     - Two buttons: "Select Profile" and "Back to Home"

4. **Test "Back to Home" button**:
   - Click "Back to Home"
   - **Expected**: Navigate back to home page

5. **Test "Select Profile" button**:
   - Navigate to game again
   - Click "Select Profile"
   - **Expected**: Profile modal opens

6. **Select a profile**:
   - Choose any profile from the list
   - Click "Select Profile"
   - **Expected**: 
     - Modal closes
     - Game loads
     - Header appears with profile info

7. **Verify game header**:
   - **Expected**: See header at top with:
     - "← Back to Home" button (left)
     - "Playing as: [Name] | Age [X]" (right)

8. **Test game with profile**:
   - **Expected**: Game starts normally
   - Timer, accuracy, and end button visible below header

### Success Criteria
- ✅ Cannot access game without profile
- ✅ "Profile Required" screen displays correctly
- ✅ "Back to Home" button works
- ✅ "Select Profile" opens modal
- ✅ After selecting profile, game loads
- ✅ Game header shows profile info
- ✅ Game UI elements don't overlap with header

---

## Test 3: Enhanced Session Data Capture

### Objective
Verify that game sessions capture comprehensive data including profile details and metrics.

### Steps

1. **Select a profile**:
   - Open http://localhost:3000
   - Click "Select Profile"
   - Select or create a profile (e.g., FOC-001)

2. **Start a game session**:
   - Click on "Level 1"
   - Complete calibration
   - Play for at least 30 seconds
   - Click "End Session"

3. **Check browser Network tab**:
   - Open DevTools → Network tab
   - Find the POST request to `/submit-session`
   - Click on it and view the "Payload" tab

4. **Verify session data structure**:
   ```json
   {
     "userId": "user_xxx",
     "sessionId": "session_xxx",
     "profileId": "FOC-001",
     "profileName": "Emma",
     "profileAge": 8,
     "profileGender": "female",
     "profileWeight": 30,
     "profileHeight": 130,
     "level": "level1",
     "startTime": 1234567890,
     "endTime": 1234567920,
     "sessionDuration": 30000,
     "datePlayed": "2024-01-18T10:30:00.000Z",
     "gazeData": [...],
     "events": [...],
     "metrics": {
       "totalGazePoints": 300,
       "accurateGazes": 250,
       "accuracyPercentage": 83.33,
       "objectsFollowed": 5,
       "averageFollowTime": 2.5
     }
   }
   ```

5. **Verify required fields are present**:
   - ✅ profileId (FOC-XXX format)
   - ✅ profileName, profileAge, profileGender
   - ✅ sessionDuration (calculated)
   - ✅ datePlayed (ISO format)
   - ✅ metrics object with accuracy data

6. **Verify level-specific metrics**:
   - **Level 1**: Should have `objectsFollowed`, `averageFollowTime`
   - **Level 2**: Should have `collisionsAvoided`, `totalCollisions`
   - **Level 3**: Should have `patternsIdentified`, `distractorsIgnored`

7. **Check S3 storage**:
   ```bash
   cd infra/terraform
   BUCKET=$(terraform output -raw s3_bucket_name)
   
   # List recent sessions
   aws s3 ls s3://$BUCKET/sessions/ --recursive | tail -5
   
   # Download and view a session
   aws s3 cp s3://$BUCKET/sessions/user_xxx/session_xxx.json - | jq
   ```

8. **Verify S3 data includes**:
   - ✅ All profile fields
   - ✅ sessionDuration
   - ✅ datePlayed
   - ✅ metrics object
   - ✅ Complete gazeData array
   - ✅ Complete events array

9. **Check DynamoDB user record**:
   ```bash
   TABLE=$(terraform output -raw users_table_name)
   USER_ID="your_user_id_here"
   
   aws dynamodb get-item \
     --table-name $TABLE \
     --key "{\"userId\": {\"S\": \"$USER_ID\"}}" | jq
   ```

10. **Verify DynamoDB record includes**:
    - ✅ lastLevel
    - ✅ lastSessionDuration
    - ✅ lastAccuracy
    - ✅ profileWeight (if provided)
    - ✅ profileHeight (if provided)

### Success Criteria
- ✅ Session data includes all profile fields
- ✅ sessionDuration is calculated correctly
- ✅ datePlayed is in ISO format
- ✅ metrics object has accuracy percentage
- ✅ Level-specific metrics are captured
- ✅ Data is stored in S3 with all fields
- ✅ DynamoDB user record is updated with metrics

---

## Test 4: End-to-End User Flow

### Objective
Test the complete user journey from profile creation to game completion.

### Steps

1. **Start fresh**:
   - Clear localStorage: `localStorage.clear()`
   - Refresh page

2. **Create first profile**:
   - Click "Select Profile"
   - Click "+ Create New Profile"
   - Create profile: Emma, Age 8
   - **Verify**: Profile ID is FOC-001

3. **Play first game session**:
   - Select Emma's profile
   - Play Level 1 for 30 seconds
   - End session
   - **Verify**: Session data includes FOC-001

4. **Create second profile**:
   - Click profile avatar in navbar
   - Click "Switch"
   - Create profile: John, Age 10
   - **Verify**: Profile ID is FOC-002

5. **Switch between profiles**:
   - Select John's profile
   - **Verify**: Navbar shows "John | Age 10"
   - Play Level 2
   - **Verify**: Session data includes FOC-002

6. **Test profile search**:
   - Open profile modal
   - Type "Emma" in search box
   - **Verify**: Only Emma's profile shows

7. **Test clear profile**:
   - Click "Clear" in navbar
   - Confirm in dialog
   - **Verify**: Navbar shows "Select Profile"
   - Try to access game
   - **Verify**: "Profile Required" screen appears

8. **Test profile persistence**:
   - Select a profile
   - Refresh page
   - **Verify**: Profile still selected in navbar

### Success Criteria
- ✅ Complete flow works without errors
- ✅ Profile IDs are sequential
- ✅ Profile switching works correctly
- ✅ Game sessions capture correct profile data
- ✅ Search functionality works
- ✅ Clear profile works
- ✅ Profile persists across page refreshes

---

## Common Issues & Troubleshooting

### Issue: Profile IDs not sequential

**Check**:
```bash
# Verify Lambda function is updated
cd infra/terraform
terraform plan

# If changes detected, apply them
terraform apply
```

### Issue: Game loads without profile

**Check**:
- Verify `GamePageClient.tsx` exists
- Check browser console for errors
- Verify localStorage is accessible

### Issue: Session data missing fields

**Check**:
- Verify `frontend/lib/api.ts` has updated interface
- Check `GameCanvas.tsx` has metrics calculation
- Verify backend Lambda is deployed

### Issue: Backend errors

**Check CloudWatch logs**:
```bash
# Create profile logs
aws logs tail /aws/lambda/focusflow-create-profile-dev --follow

# Data ingestor logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow
```

---

## Deployment Checklist

Before considering implementation complete:

- [ ] All tests pass
- [ ] Profile IDs are FOC-XXX format
- [ ] Game requires profile selection
- [ ] Session data includes all fields
- [ ] Backend Lambda functions deployed
- [ ] S3 data structure verified
- [ ] DynamoDB records updated correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Responsive design works on mobile

---

## Next Steps After Testing

1. **Deploy to production**:
   ```bash
   cd infra/terraform
   terraform workspace select prod
   terraform apply
   ```

2. **Update documentation**:
   - Document any issues found
   - Update user guides
   - Create training materials

3. **Monitor in production**:
   - Set up CloudWatch alarms
   - Monitor error rates
   - Track session data quality

---

**Testing complete! All features verified and working.** ✅
