# FocusFlow AI

A gamified therapeutic tool designed to improve visual tracking and attention skills for children with special needs (Autism Spectrum, ADHD). Uses webcam-based eye-tracking to provide objective, actionable insights for parents and therapists.

## 🎯 Project Vision

FocusFlow AI combines engaging gameplay with powerful AI analysis to help children develop visual tracking and attention skills. Children play simple games while the system captures eye-tracking data, which is then analyzed by AWS AI to generate progress reports.

## 📁 Project Structure

```
focusflow-ai/
├── frontend/          # Next.js PWA with game UI and eye-tracking
│   ├── app/          # Next.js pages and routes
│   ├── components/   # React components (GameCanvas, SessionSummary)
│   ├── lib/          # Game engine and eye-tracking logic
│   ├── public/       # Static assets and PWA manifest
│   └── scripts/      # SSL certificate generation
├── backend/          # AWS Lambda functions (coming soon)
└── infra/           # Infrastructure as Code (coming soon)
```

## 🎮 Game Levels

### Level 1: Follow the Leader (Beginner)
- Single large object moving slowly
- Measures smooth pursuit tracking
- Focus on basic eye-following skills

### Level 2: Collision Course (Mid-Level)
- Multiple objects at varying speeds
- Collision detection with feedback
- Trains attention shifting and saccadic movements

### Level 3: Find the Pattern (Pro-Level)
- Pattern-based movement with distractors
- Blue objects move in predictable patterns
- Develops pattern recognition and distractor inhibition

## ✨ Features

### Real-Time Visual Feedback
- **Gaze Cursor**: Shows where user is looking (green when tracking, white when not)
- **Object Highlighting**: Green glow when successfully tracking the target
- **Live Accuracy Score**: Real-time tracking percentage displayed during gameplay
- **Session Timer**: 5-minute countdown with auto-end functionality

### Session Management
- Automatic session end after 5 minutes
- Manual end session option
- Proper camera cleanup (turns off camera light)
- Beautiful session summary with performance metrics

### Data Collection
- Timestamp-based gaze coordinates
- Object position tracking
- Tracking accuracy calculation
- Ready for AWS AI analysis

## 🚀 Getting Started

### Prerequisites

**For Local Development:**
- Node.js 18+ and npm
- Modern web browser (Chrome, Safari, Firefox)
- Webcam access
- HTTPS for mobile testing (camera access requires secure context)

**For AWS Deployment:**
- AWS Account with Bedrock access
- AWS CLI configured
- Terraform 1.5+

### Frontend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vikasvishnoi/focus-flow-ai.git
   cd focus-flow-ai
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Run development server**
   
   **For desktop testing (HTTP):**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

   **For mobile testing (HTTPS required):**
   ```bash
   # First time: Generate SSL certificates
   npm run generate-certs
   
   # Start HTTPS server
   npm run dev:https
   ```
   Access from mobile: `https://<your-local-ip>:3000`

### Mobile Setup (HTTPS Certificate)

WebGazer requires HTTPS to access the camera. Follow these steps for mobile testing:

1. **Generate certificates** (already done in setup above)
   ```bash
   npm run generate-certs
   ```

2. **Transfer certificate to mobile device**
   - Certificate location: `frontend/certificates/ca.pem`
   - Transfer via AirDrop, email, or file sharing

3. **Install certificate on mobile**

   **iOS:**
   - Open `ca.pem` file on iPhone
   - Go to Settings > General > VPN & Device Management
   - Install "FocusFlow AI Dev" profile
   - Go to Settings > General > About > Certificate Trust Settings
   - Enable full trust for "FocusFlow AI Dev"

   **Android:**
   - Go to Settings > Security > Install from storage
   - Select `ca.pem` file
   - Name it "FocusFlow AI Dev"

4. **Access from mobile**
   - Find your computer's local IP (e.g., 192.168.4.56)
   - Open browser on mobile
   - Navigate to `https://<your-ip>:3000`
   - Accept security warning (first time only)

## 🎯 How to Use

1. **Start the app** and select a game level
2. **Calibration**: Allow camera access and follow calibration instructions
3. **Play**: Follow the moving objects with your eyes
4. **Track progress**: Watch the live accuracy score
5. **Review**: See session summary with performance metrics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **WebGazer.js** - Eye-tracking library
- **Canvas API** - High-performance game rendering
- **PWA** - Progressive Web App capabilities

### Backend (Coming Soon)
- **AWS Lambda** - Serverless functions
- **API Gateway** - REST endpoints
- **Amazon Bedrock** - AI agent for analysis
- **DynamoDB** - Session data storage
- **S3** - Raw data storage

## 📊 Data Collected

Each session captures:
- Gaze coordinates (x, y) with timestamps
- Object positions and IDs
- Tracking accuracy metrics
- Session duration
- Collision events (Level 2)
- Pattern recognition data (Level 3)

## 🔜 Coming Soon

### Backend Integration
- AWS Lambda functions for data ingestion
- Bedrock Agent for AI-powered analysis
- Metrics calculator (Time on Target, Acquisition Speed, etc.)
- Knowledge base with benchmark data
- Natural language progress reports

### Dashboard
- Historical session data
- Progress tracking over time
- AI-generated insights
- Comparison with benchmarks
- Exportable reports for therapists

## 🤝 Contributing

This is a therapeutic tool for children with special needs. Contributions are welcome!

## 📝 License

[Add your license here]

## 👥 Authors

Vikas Vishnoi

## 🙏 Acknowledgments

- WebGazer.js for eye-tracking capabilities
- Next.js team for the amazing framework
- AWS for serverless infrastructure
