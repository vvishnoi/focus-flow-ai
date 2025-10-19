# Scorecard Issues & Fixes

## Issues Found

### 1. ❌ Objects Followed showing 0
**Problem:** Game engine doesn't emit `object_followed` events  
**Impact:** Level 1 metrics always show 0  
**Fix:** Add event tracking to gameEngine.ts

### 2. ❌ CORS Error
**Problem:** API Gateway not allowing CloudFront origin  
**Error:** `Access-Control-Allow-Origin header is present on the requested resource`  
**Fix:** Update API Gateway CORS configuration

### 3. ❌ 404 Error on /dev/submit-session
**Problem:** Wrong API endpoint  
**Current:** `/dev/submit-session`  
**Should be:** `/sessions` (based on terraform config)  
**Fix:** Update API URL in frontend

### 4. ⚠️ AI Report Status - Static
**Problem:** Shows "~30 seconds" but no real-time updates  
**Enhancement:** Add polling or WebSocket for live status  
**Quick Fix:** Add animated spinner and countdown timer

### 5. ⚠️ Missing PWA Icons
**Problem:** icon-192.png and icon-512.png don't exist  
**Fix:** Add PWA icons or remove from manifest

## Priority Fixes

### HIGH PRIORITY

#### Fix 1: Add Event Tracking to Game Engine
The game engine needs to track when objects are followed, collisions occur, and patterns are identified.

**File:** `frontend/lib/gameEngine.ts`

Need to add:
- Track when gaze is on an object for X duration → emit `object_followed` event
- Track collision events → emit `collision` and `collision_avoided` events  
- Track pattern identification → emit `pattern_identified` event

#### Fix 2: Fix API Endpoint
**File:** `frontend/lib/api.ts`

Change:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

// In submitSession:
const response = await fetch(`${API_URL}/submit-session`, {
```

To:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev'

// In submitSession:
const response = await fetch(`${API_URL}/sessions`, {
```

#### Fix 3: Fix CORS in API Gateway
**File:** `infra/terraform/modules/api-gateway/main.tf`

Need to add CloudFront domain to allowed origins:
```hcl
allowed_origins = [
  "http://localhost:3000",
  "https://d3sy81kn37rion.cloudfront.net"
]
```

### MEDIUM PRIORITY

#### Fix 4: Add Real-time AI Report Status

**Option A: Simple Countdown Timer**
```typescript
const [aiReportCountdown, setAiReportCountdown] = useState(30)

useEffect(() => {
  const timer = setInterval(() => {
    setAiReportCountdown(prev => prev > 0 ? prev - 1 : 0)
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

**Option B: Poll for Report Status**
```typescript
useEffect(() => {
  const pollInterval = setInterval(async () => {
    const report = await getReports(userId)
    if (report.reports.find(r => r.sessionId === sessionId)) {
      setAiReportReady(true)
      clearInterval(pollInterval)
    }
  }, 5000) // Poll every 5 seconds
  
  return () => clearInterval(pollInterval)
}, [])
```

### LOW PRIORITY

#### Fix 5: Add PWA Icons
Create icons and add to public folder:
- icon-192.png (192x192)
- icon-512.png (512x512)

Or remove from manifest.json

## Implementation Order

1. **Fix API Endpoint** (5 min) - Critical for backend communication
2. **Fix CORS** (10 min) - Critical for API calls to work
3. **Add Event Tracking** (30 min) - Critical for metrics
4. **Add AI Report Countdown** (15 min) - Better UX
5. **Add PWA Icons** (10 min) - Nice to have

## Quick Test After Fixes

1. Play Level 1 game
2. Check console - no CORS errors
3. Check console - session submitted successfully
4. Check scorecard - objects followed > 0
5. Check AI status - countdown timer working
6. Wait 30 seconds - check if report appears

## Estimated Time
- Critical fixes: ~45 minutes
- All fixes: ~70 minutes
