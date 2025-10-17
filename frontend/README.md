# FocusFlow AI - Frontend

Next.js 14 Progressive Web App with real-time eye-tracking and visual feedback.

## ✨ Features

### Game Mechanics
- **Three Progressive Levels**: Beginner, Mid-Level, and Pro
- **Real-Time Eye Tracking**: WebGazer.js integration
- **Visual Feedback System**: 
  - Gaze cursor showing where user is looking
  - Green glow when successfully tracking objects
  - Live accuracy percentage
- **Session Management**: 
  - 5-minute auto-end timer
  - Manual end option
  - Proper camera cleanup
- **Session Summary**: Beautiful results screen with performance metrics

### Technical Features
- PWA support for offline capability
- HTTPS support for mobile camera access
- Canvas-based rendering for 60fps performance
- TypeScript for type safety
- Responsive design

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

**Option 1: Desktop Testing (HTTP)**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Option 2: Mobile Testing (HTTPS)**

1. Generate SSL certificates (first time only):
   ```bash
   npm run generate-certs
   ```

2. Start HTTPS server:
   ```bash
   npm run dev:https
   ```

3. Access from mobile:
   ```
   https://<your-local-ip>:3000
   ```
   Example: `https://192.168.4.56:3000`

### Mobile Certificate Setup

WebGazer requires HTTPS to access the camera on mobile devices.

**iOS Setup:**
1. Transfer `certificates/ca.pem` to iPhone (AirDrop/email)
2. Settings > General > VPN & Device Management
3. Install "FocusFlow AI Dev" profile
4. Settings > General > About > Certificate Trust Settings
5. Enable full trust

**Android Setup:**
1. Transfer `certificates/ca.pem` to device
2. Settings > Security > Install from storage
3. Select certificate file
4. Name: "FocusFlow AI Dev"

## 🎮 Game Levels

### Level 1: Follow the Leader (Beginner)
**Goal**: Follow a single moving object with your eyes

**Metrics Tracked**:
- Time on Target
- Smooth Pursuit accuracy
- Session duration

**UI**: Large, bright circle moving slowly across black background

---

### Level 2: Collision Course (Mid-Level)
**Goal**: Track multiple objects and focus on collision events

**Metrics Tracked**:
- Target Acquisition Speed
- Distraction Rate
- Collision event attention

**UI**: 2-3 colored objects moving at varying speeds with collision detection

---

### Level 3: Find the Pattern (Pro-Level)
**Goal**: Identify and follow pattern-based movement while ignoring distractors

**Metrics Tracked**:
- Pattern Recognition
- Distractor Inhibition
- Predictive tracking

**UI**: Blue objects moving in square pattern + random gray distractors

## 📊 Visual Feedback System

### During Gameplay

**Gaze Cursor**:
- Small dot showing current gaze position
- Green when tracking object
- White when not tracking

**Object Highlighting**:
- Green glow around object when tracked
- Increased shadow effect
- Green ring indicator

**Live Metrics** (HUD):
- Top Left: Session timer (5:00 countdown)
- Top Center: Tracking accuracy percentage
- Top Right: End Session button

### After Session

**Session Summary Screen**:
- Level completed
- Total duration
- Final tracking accuracy
- Total data points collected
- Motivational message

## 🔧 Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Home page with level selection
│   ├── layout.tsx            # Root layout with PWA config
│   ├── globals.css           # Global styles
│   ├── game/[level]/
│   │   └── page.tsx          # Dynamic game page
│   └── dashboard/
│       └── page.tsx          # Progress dashboard (placeholder)
├── components/
│   ├── GameCanvas.tsx        # Main game component
│   ├── GameCanvas.module.css # Game styles
│   ├── SessionSummary.tsx    # Results screen
│   └── SessionSummary.module.css
├── lib/
│   ├── gameEngine.ts         # Game logic and rendering
│   └── eyeTracker.ts         # WebGazer integration
├── public/
│   └── manifest.json         # PWA manifest
├── scripts/
│   └── generate-certs.js     # SSL certificate generator
└── certificates/             # Generated SSL certs (gitignored)
```

## 🛠️ Tech Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **WebGazer.js 3.0**: Eye-tracking library
- **Canvas API**: High-performance game rendering
- **mkcert**: Local SSL certificate generation
- **CSS Modules**: Component-scoped styling

## 📦 Scripts

```bash
npm run dev          # Start development server (HTTP)
npm run dev:https    # Start HTTPS server for mobile
npm run generate-certs  # Generate SSL certificates
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## 🔍 Data Collection

Each session captures:

```typescript
{
  level: string,
  startTime: number,
  endTime: number,
  gazeData: Array<{
    timestamp: number,
    gazeX: number,
    gazeY: number,
    objectId: string | null,
    objectX: number,
    objectY: number
  }>,
  events: Array<{
    type: string,
    timestamp: number,
    data: any
  }>
}
```

## 🐛 Troubleshooting

**Camera not working on mobile:**
- Ensure you're using HTTPS
- Check certificate is installed and trusted
- Try restarting browser
- Check camera permissions in browser settings

**WebGazer initialization error:**
- Ensure good lighting
- Face should be visible to camera
- Try refreshing the page
- Check browser console for errors

**Low tracking accuracy:**
- Improve lighting conditions
- Position face closer to camera
- Recalibrate by clicking calibration points
- Ensure camera is stable

## 🔜 Next Steps

- [ ] Send session data to AWS backend
- [ ] Implement real dashboard with historical data
- [ ] Add user authentication
- [ ] Store sessions in database
- [ ] Generate AI-powered progress reports
- [ ] Add more game levels
- [ ] Implement difficulty adjustment

## 📝 Notes

- Sessions auto-end after 5 minutes
- Camera is properly cleaned up after session
- All data is currently logged to console
- Backend integration coming in next iteration
