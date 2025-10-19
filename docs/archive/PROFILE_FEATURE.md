# Profile Management Feature

## Overview

The profile management feature allows therapists to create and manage multiple child profiles. Each profile contains demographic information that is stored with session data for better AI analysis and personalized recommendations.

## Features

### Profile Creation
- **Name** (required): Child's name
- **Age** (required): Age in years (3-18)
- **Gender**: Male, Female, Other, or Prefer not to say
- **Weight** (optional): Weight in kg
- **Height** (optional): Height in cm

### Profile Management
- Create unlimited profiles
- View all profiles in a grid layout
- Select active profile before playing
- Delete profiles (with confirmation)
- Profile information displayed during gameplay

### Session Tracking
- All game sessions are linked to a profile
- Profile data included in backend storage
- AI analysis considers age-appropriate benchmarks
- Dashboard shows profile-specific reports

## User Flow

### 1. First Time User
```
Open App → Redirected to /profiles → Create Profile → Select Profile → Home Page → Play Game
```

### 2. Returning User
```
Open App → Shows Active Profile → Play Game
```

### 3. Switching Profiles
```
Home Page → Click "Change Profile" → Select Different Profile → Play Game
```

## Technical Implementation

### Frontend

**New Files:**
- `frontend/lib/profiles.ts` - Profile management utilities
- `frontend/app/profiles/page.tsx` - Profile management UI
- `frontend/app/profiles/profiles.module.css` - Profile page styles

**Updated Files:**
- `frontend/app/page.tsx` - Added profile check and banner
- `frontend/app/page.module.css` - Added profile banner styles
- `frontend/components/GameCanvas.tsx` - Include profile in session submission
- `frontend/app/dashboard/page.tsx` - Show active profile
- `frontend/app/dashboard/dashboard.module.css` - Profile banner styles
- `frontend/lib/api.ts` - Updated SessionData interface

### Backend

**Updated Files:**
- `backend/functions/data-ingestor/index.js` - Store profile data with sessions

### Data Storage

**LocalStorage (Frontend):**
```javascript
{
  "focusflow_profiles": [
    {
      "id": "profile_xxx",
      "name": "John Doe",
      "age": 8,
      "gender": "male",
      "weight": 30,
      "height": 130,
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ],
  "focusflow_active_profile": "profile_xxx"
}
```

**S3 (Session Data):**
```json
{
  "userId": "user_xxx",
  "sessionId": "session_xxx",
  "profileId": "profile_xxx",
  "profileName": "John Doe",
  "profileAge": 8,
  "profileGender": "male",
  "level": "level1",
  "startTime": 1234567890,
  "endTime": 1234567900,
  "gazeData": [...],
  "events": [...]
}
```

**DynamoDB (Users Table):**
```json
{
  "userId": "user_xxx",
  "profileId": "profile_xxx",
  "profileName": "John Doe",
  "profileAge": 8,
  "profileGender": "male",
  "lastSessionId": "session_xxx",
  "lastSessionTime": 1234567890,
  "updatedAt": 1234567890
}
```

## API Changes

### POST /submit-session

**Request Body (Updated):**
```json
{
  "userId": "user_xxx",
  "sessionId": "session_xxx",
  "profileId": "profile_xxx",
  "profileName": "John Doe",
  "profileAge": 8,
  "profileGender": "male",
  "level": "level1",
  "startTime": 1234567890,
  "endTime": 1234567900,
  "gazeData": [...],
  "events": [...]
}
```

## UI Screenshots

### Profile Management Page
- Grid layout of existing profiles
- "Create New Profile" button
- Profile cards with name, age, gender, weight, height
- "Select Profile" and delete buttons

### Home Page with Active Profile
- Profile banner at top showing:
  - "Playing as: [Name]"
  - Age badge
  - "Change Profile" button
- Game level selection below

### Dashboard with Profile
- Profile banner showing whose reports are displayed
- All reports filtered by active profile

## Testing

### Manual Testing Steps

1. **Create Profile**
   ```
   - Navigate to /profiles
   - Click "Create New Profile"
   - Fill in name: "Test Child"
   - Fill in age: 8
   - Select gender: Male
   - Click "Create Profile"
   - Verify profile appears in grid
   ```

2. **Select Profile**
   ```
   - Click "Select Profile" on a profile card
   - Verify redirect to home page
   - Verify profile banner shows correct name and age
   ```

3. **Play Game with Profile**
   ```
   - Select a game level
   - Complete calibration
   - Play for 30 seconds
   - End session
   - Check browser console for profile data in submission
   ```

4. **Switch Profiles**
   ```
   - Click "Change Profile" on home page
   - Select different profile
   - Verify new profile shown in banner
   - Play game and verify correct profile in submission
   ```

5. **Delete Profile**
   ```
   - Go to /profiles
   - Click delete (×) button
   - Confirm deletion
   - Verify profile removed from grid
   ```

### Backend Verification

```bash
# Check S3 for profile data
aws s3 cp s3://BUCKET_NAME/sessions/user_xxx/session_xxx.json - | jq

# Should show profileId, profileName, profileAge, profileGender

# Check DynamoDB users table
aws dynamodb get-item \
  --table-name focusflow-users-dev \
  --key '{"userId": {"S": "user_xxx"}}' | jq

# Should show profile fields
```

## Future Enhancements

### Phase 2 (Optional)
- [ ] Profile photos/avatars
- [ ] Multiple therapist accounts
- [ ] Profile-specific settings (difficulty, duration)
- [ ] Export profile data
- [ ] Profile history and statistics
- [ ] Bulk profile import (CSV)

### Phase 3 (Optional)
- [ ] Parent/guardian information
- [ ] Medical history fields
- [ ] Therapy goals and notes
- [ ] Progress milestones
- [ ] Share reports with parents

## Notes

- Profiles are stored locally in browser localStorage
- No authentication required (therapist portal assumption)
- Profile data is included in all backend submissions
- AI analysis can use age for age-appropriate benchmarks
- Gender field for future demographic analysis
- Weight/height optional for future physical development tracking

## Deployment

After implementing this feature:

1. **Frontend**: Redeploy with updated code
   ```bash
   ./scripts/deploy-frontend.sh
   ```

2. **Backend**: Update Lambda function
   ```bash
   cd infra/terraform
   terraform apply
   ```

3. **Test**: Verify end-to-end flow works

## Support

For issues or questions about the profile feature:
1. Check browser console for errors
2. Verify localStorage has profile data
3. Check backend logs for profile fields
4. Ensure all required fields are provided

