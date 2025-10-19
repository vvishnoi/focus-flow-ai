# Frontend Testing Guide

## ✅ Backend is Ready!

All profile API endpoints are working:
- POST /profiles ✅
- GET /profiles/{therapistId} ✅
- DELETE /profiles/{therapistId}/{profileId} ✅

## 🚀 Start Frontend

```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

## 🧪 Test Steps

### 1. First Visit
- You'll be redirected to `/profiles` (no profiles yet)
- Should see "No profiles yet. Create one to get started!"

### 2. Create Profile
- Click "+ Create New Profile"
- Fill in:
  - Name: "Emma"
  - Age: 8
  - Gender: Female
  - Weight: 30 (optional)
  - Height: 130 (optional)
- Click "Create Profile"
- ✅ Profile should appear in grid

### 3. Check Browser Console
- Open DevTools (F12) → Console
- Should see:
  - `therapistId` generated
  - API call to POST /profiles
  - Response with profile data

### 4. Check Network Tab
- DevTools → Network tab
- Should see:
  - POST request to `/profiles`
  - Status: 201
  - Response with profile data

### 5. Select Profile
- Click "Select Profile" on the profile card
- ✅ Should redirect to home page
- ✅ Profile banner shows: "Playing as: Emma | Age 8"

### 6. Check localStorage
- DevTools → Application → Local Storage
- Should see:
  - `focusflow_therapist_id`: therapist_xxx
  - `focusflow_active_profile`: {profile object}

### 7. Create More Profiles
- Click "Change Profile"
- Create 2-3 more profiles
- ✅ All should appear in grid

### 8. Switch Profiles
- Select different profile
- ✅ Home page banner should update

### 9. Delete Profile
- Go to profiles page
- Click × on a profile
- Confirm deletion
- ✅ Profile should disappear

### 10. Play Game (Optional)
- Select a profile
- Choose Level 1
- Allow camera access
- Play for 10 seconds
- End session
- Check console for profile data in submission

## 🔍 What to Check

### Console Logs
```javascript
// Should see:
"therapistId: therapist_xxx"
"Fetching profiles..."
"Profile created: {profile object}"
"Profile selected: {profile object}"
```

### Network Requests
```
POST /profiles → 201 Created
GET /profiles/therapist_xxx → 200 OK
DELETE /profiles/therapist_xxx/profile_xxx → 200 OK
```

### localStorage
```javascript
{
  "focusflow_therapist_id": "therapist_1760747280_abc123",
  "focusflow_active_profile": "{...profile object...}"
}
```

### DynamoDB (Backend)
```bash
# Check profiles in DynamoDB
aws dynamodb scan --table-name focusflow-profiles-dev | jq '.Items[].name.S'
```

## ✅ Success Criteria

- [ ] Profile creation works
- [ ] Profiles appear in grid
- [ ] Profile selection works
- [ ] Profile banner shows on home
- [ ] Profile switching works
- [ ] Profile deletion works
- [ ] API calls visible in Network tab
- [ ] No console errors
- [ ] localStorage has therapistId
- [ ] DynamoDB has profiles

## 🐛 Troubleshooting

### "Failed to fetch profiles"
- Check `.env.local` has correct API URL
- Check Network tab for CORS errors
- Verify API Gateway stage exists

### Profiles not appearing
- Check browser console for errors
- Check Network tab for API response
- Verify DynamoDB has data

### "No active profile found"
- Create a profile first
- Select a profile
- Check localStorage has active profile

## 📊 Expected Flow

```
1. Open app → Redirect to /profiles
2. Create profile → POST /profiles → DynamoDB
3. Select profile → Cache in localStorage → Redirect to home
4. Home page → Show profile banner
5. Play game → Profile data in session
6. Dashboard → Show profile-specific reports
```

## 🎉 When Everything Works

You should be able to:
1. ✅ Create multiple child profiles
2. ✅ See them persist across page reloads
3. ✅ Switch between profiles
4. ✅ Delete profiles
5. ✅ Play games with profile data
6. ✅ See profile info in dashboard

---

**Ready to test! Start the dev server and follow the steps above.** 🚀

