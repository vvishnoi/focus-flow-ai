# Design Document

## Overview

The Profile Management & Session Tracking System is a full-stack feature that enables therapists to manage patient profiles with professional sequential IDs, enforce profile selection before gameplay, and capture comprehensive session data for AI analysis. The system consists of a React/Next.js frontend with modal-based UI, AWS backend infrastructure (DynamoDB, Lambda, API Gateway), and enhanced session tracking integrated into the game engine.

## Implementation Status

### ✅ Already Implemented (Verified)
- Profile management UI with modal interface
- Backend API (Lambda + DynamoDB) for CRUD operations
- Profile storage with therapistId scoping
- Profile search and filtering
- Clear profile with confirmation dialog
- Professional navbar with profile display
- localStorage caching for active profile

### ⚠️ Needs Implementation (From Requirements)
- **Sequential FOC-XXX profile IDs** (currently using random IDs)
- **Game access restriction** (currently allows play without profile)
- **Enhanced session data capture** (needs profile integration)
- **Level-specific metrics calculation**
- **Profile requirement enforcement**

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Therapist Browser                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  React/Next.js Frontend                                 │ │
│  │  - Profile Modal UI                                     │ │
│  │  - Game Access Control                                  │ │
│  │  - Session Data Capture                                 │ │
│  │  - localStorage (therapistId + active profile cache)    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    AWS API Gateway                           │
│  - CORS enabled                                              │
│  - REST API endpoints                                        │
│  - Request validation                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    AWS Lambda Functions                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │create-profile│  │ get-profiles │  │delete-profile│      │
│  │              │  │              │  │              │      │
│  │ - Generate   │  │ - Query by   │  │ - Delete by  │      │
│  │   FOC-XXX ID │  │   therapistId│  │   composite  │      │
│  │ - Validate   │  │ - Sort by    │  │   key        │      │
│  │   input      │  │   createdAt  │  │ - Validate   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    DynamoDB Tables                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  focusflow-profiles-dev                                 │ │
│  │  - PK: therapistId (S)                                  │ │
│  │  - SK: profileId (S)                                    │ │
│  │  - GSI: CreatedAtIndex (sort by createdAt)             │ │
│  │  - Attributes: name, age, gender, weight, height       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  focusflow-users-dev                                    │ │
│  │  - Stores session metadata                              │ │
│  │  - Updated with last session info                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    S3 Bucket                                 │
│  - Stores complete session data                              │
│  - Organized by userId/sessionId                             │
│  - Includes gaze data, events, metrics                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow Diagrams

#### Profile Creation Flow
```
User fills form → Frontend validates → POST /profiles
                                            ↓
                                    Lambda: create-profile
                                            ↓
                                    Query existing profiles
                                            ↓
                                    Calculate next number (FOC-XXX)
                                            ↓
                                    Store in DynamoDB
                                            ↓
                                    Return profile object
                                            ↓
Frontend updates UI ← Response with FOC-XXX ID
```

#### Game Session Flow
```
User navigates to game → Check active profile
                              ↓
                         No profile?
                              ↓
                    Show "Profile Required" screen
                              ↓
                    User selects profile
                              ↓
                    Load game with profile data
                              ↓
                    Track gaze data + events
                              ↓
                    Calculate metrics
                              ↓
                    Submit session data
                              ↓
                    Store in S3 + DynamoDB
                              ↓
                    Trigger AI analysis
```

## Components and Interfaces

### Frontend Components

#### 1. ProfileModal Component
**Purpose**: Modal dialog for profile management (create, select, delete)

**Props**:
```typescript
interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  onProfileSelected: (profile: Profile) => void
}
```

**State**:
- `profiles: Profile[]` - List of all profiles
- `showCreateForm: boolean` - Toggle create form
- `searchQuery: string` - Filter profiles
- `loading: boolean` - Loading state
- `error: string | null` - Error messages

**Key Methods**:
- `fetchProfiles()` - Load profiles from backend
- `handleCreateProfile(data)` - Create new profile
- `handleSelectProfile(profile)` - Set active profile
- `handleDeleteProfile(profileId)` - Delete profile
- `filterProfiles()` - Search/filter logic

**Styling**: `ProfileModal.module.css`
- Glassmorphism overlay
- Centered modal with backdrop blur
- Responsive grid layout
- Smooth animations

#### 2. ConfirmDialog Component
**Purpose**: Reusable confirmation dialog for destructive actions

**Props**:
```typescript
interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}
```

**Usage**: Clear profile, delete profile confirmations

#### 3. Navbar Component
**Purpose**: Top navigation with profile display and actions

**Features**:
- Profile avatar with initials
- Profile name and age display
- "Change Profile" button
- "Clear Profile" button
- Responsive design

#### 4. GameCanvas Component (Enhanced)
**Purpose**: Game rendering with session tracking

**New Functionality**:
- Profile data integration
- Enhanced session metrics calculation
- Level-specific event tracking
- Comprehensive data submission

**Session Data Structure**:
```typescript
interface SessionData {
  userId: string
  sessionId: string
  profileId: string          // FOC-XXX format
  profileName: string
  profileAge: number
  profileGender: string
  profileWeight?: number
  profileHeight?: number
  level: string
  startTime: number
  endTime: number
  sessionDuration: number    // Calculated
  datePlayed: string         // ISO format
  gazeData: GazePoint[]
  events: GameEvent[]
  metrics: SessionMetrics    // Calculated
}
```

#### 5. Game Level Pages
**Purpose**: Game entry points with profile requirement enforcement

**Flow**:
1. Check for active profile on mount
2. If no profile: Show "Profile Required" screen
3. If profile exists: Load game with header
4. Display profile info in game header
5. Allow navigation back to home

### Backend Components

#### 1. create-profile Lambda
**Purpose**: Create new profile with sequential ID

**Input**:
```json
{
  "therapistId": "string",
  "name": "string",
  "age": number,
  "gender": "string",
  "weight": number (optional),
  "height": number (optional)
}
```

**Logic**:
1. Validate required fields (name, age, therapistId)
2. Query existing profiles for therapist
3. Count profiles to get next number
4. Generate profileId: `FOC-${(count + 1).toString().padStart(3, '0')}`
5. Create DynamoDB item with timestamp
6. Return profile object

**Output**:
```json
{
  "message": "Profile created successfully",
  "profile": {
    "profileId": "FOC-001",
    "therapistId": "string",
    "name": "string",
    "age": number,
    "gender": "string",
    "weight": number,
    "height": number,
    "createdAt": timestamp,
    "updatedAt": timestamp
  }
}
```

#### 2. get-profiles Lambda
**Purpose**: Retrieve all profiles for a therapist

**Input**: `therapistId` from path parameter

**Logic**:
1. Validate therapistId
2. Query DynamoDB with therapistId as partition key
3. Sort by createdAt (newest first)
4. Return array of profiles

**Output**:
```json
{
  "therapistId": "string",
  "profiles": [Profile[]],
  "count": number
}
```

#### 3. delete-profile Lambda
**Purpose**: Delete a profile

**Input**: `therapistId` and `profileId` from path parameters

**Logic**:
1. Validate both parameters
2. Delete item from DynamoDB using composite key
3. Return success message

**Output**:
```json
{
  "message": "Profile deleted successfully",
  "profileId": "string"
}
```

#### 4. data-ingestor Lambda (Enhanced)
**Purpose**: Store session data with enhanced profile and metrics

**Input**: Enhanced SessionData object

**Logic**:
1. Validate session data
2. Calculate additional metrics if needed
3. Store complete session in S3
4. Update user record in DynamoDB with:
   - Last session info
   - Profile details
   - Performance metrics
5. Trigger AI analysis (future)

## Data Models

### Profile Model
```typescript
interface Profile {
  profileId: string        // FOC-001, FOC-002, etc.
  therapistId: string      // Generated UUID
  name: string             // Required
  age: number              // Required, 1-18
  gender: string           // male, female, other
  weight?: number          // Optional, kg
  height?: number          // Optional, cm
  createdAt: number        // Unix timestamp
  updatedAt: number        // Unix timestamp
}
```

**DynamoDB Schema**:
```
{
  "therapistId": { "S": "therapist_xxx" },      // Partition Key
  "profileId": { "S": "FOC-001" },              // Sort Key
  "name": { "S": "Emma" },
  "age": { "N": "8" },
  "gender": { "S": "female" },
  "weight": { "N": "30" },
  "height": { "N": "130" },
  "createdAt": { "N": "1705574400000" },
  "updatedAt": { "N": "1705574400000" }
}
```

### Session Data Model
```typescript
interface SessionData {
  userId: string
  sessionId: string
  profileId: string
  profileName: string
  profileAge: number
  profileGender: string
  profileWeight?: number
  profileHeight?: number
  level: string
  startTime: number
  endTime: number
  sessionDuration: number
  datePlayed: string
  gazeData: GazePoint[]
  events: GameEvent[]
  metrics: SessionMetrics
}

interface GazePoint {
  timestamp: number
  gazeX: number
  gazeY: number
  objectId: string | null
  objectX: number
  objectY: number
}

interface GameEvent {
  type: string
  timestamp: number
  data: any
}

interface SessionMetrics {
  totalGazePoints: number
  accurateGazes: number
  accuracyPercentage: number
  // Level-specific metrics
  objectsFollowed?: number        // Level 1
  averageFollowTime?: number      // Level 1
  collisionsAvoided?: number      // Level 2
  totalCollisions?: number        // Level 2
  patternsIdentified?: number     // Level 3
  distractorsIgnored?: number     // Level 3
}
```

### Local Storage Model
```typescript
// Stored in browser localStorage
{
  "therapistId": "therapist_xxx",           // Generated once
  "activeProfile": {                        // Cached active profile
    "profileId": "FOC-001",
    "name": "Emma",
    "age": 8,
    "gender": "female",
    "weight": 30,
    "height": 130
  }
}
```

## Error Handling

### Frontend Error Handling

**Network Errors**:
```typescript
try {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  return await response.json()
} catch (error) {
  console.error('API Error:', error)
  setError('Failed to connect. Please try again.')
  return null
}
```

**Validation Errors**:
- Required field validation before submission
- Age range validation (1-18)
- Display inline error messages
- Prevent form submission if invalid

**User Feedback**:
- Loading states during API calls
- Success messages after operations
- Error messages with retry options
- Confirmation dialogs for destructive actions

### Backend Error Handling

**Lambda Error Responses**:
```javascript
// 400 Bad Request
{
  statusCode: 400,
  body: JSON.stringify({
    error: 'Missing required field: name'
  })
}

// 500 Internal Server Error
{
  statusCode: 500,
  body: JSON.stringify({
    error: 'Internal server error',
    message: error.message
  })
}
```

**DynamoDB Error Handling**:
- Retry logic for throttling
- Graceful degradation if table unavailable
- Logging to CloudWatch for debugging

**API Gateway Error Handling**:
- CORS preflight handling
- Request validation
- Rate limiting (future)

## Testing Strategy

### Unit Tests

**Frontend Components**:
```typescript
// ProfileModal.test.tsx
describe('ProfileModal', () => {
  it('renders profile list', () => {})
  it('filters profiles by search', () => {})
  it('creates new profile', () => {})
  it('deletes profile with confirmation', () => {})
  it('selects profile and closes modal', () => {})
})

// Game access tests
describe('GameLevel', () => {
  it('shows profile required screen when no profile', () => {})
  it('loads game when profile exists', () => {})
  it('displays profile in header', () => {})
})
```

**Backend Functions**:
```javascript
// create-profile.test.js
describe('create-profile', () => {
  it('generates sequential FOC-XXX IDs', () => {})
  it('validates required fields', () => {})
  it('stores profile in DynamoDB', () => {})
  it('returns 400 for invalid input', () => {})
})
```

### Integration Tests

**Profile Creation Flow**:
1. POST /profiles with valid data
2. Verify profile stored in DynamoDB
3. GET /profiles to confirm profile exists
4. Verify FOC-XXX ID format

**Game Session Flow**:
1. Create profile via API
2. Select profile in frontend
3. Start game session
4. End session and submit data
5. Verify session data in S3
6. Verify user record updated in DynamoDB

### End-to-End Tests

**User Journey 1: New Therapist**:
1. Open app (no profiles)
2. Modal appears automatically
3. Create first profile (FOC-001)
4. Select profile
5. Navigate to game
6. Play session
7. Verify data captured

**User Journey 2: Returning Therapist**:
1. Open app (has profiles)
2. Last profile auto-selected
3. Change profile via navbar
4. Select different profile
5. Play session
6. Verify correct profile data

**User Journey 3: Profile Management**:
1. Open profile modal
2. Search for profile
3. Delete old profile
4. Create new profile
5. Verify sequential ID
6. Select new profile

### Performance Tests

**Metrics to Track**:
- Profile modal open time: < 500ms
- Profile creation time: < 2s
- Profile list load time: < 1s
- Game session submission: < 3s
- DynamoDB query latency: < 100ms
- Lambda cold start: < 1s

### Manual Testing Checklist

**Profile Management**:
- [ ] Create profile with all fields
- [ ] Create profile with required fields only
- [ ] Search profiles by name
- [ ] Search profiles by ID
- [ ] Delete profile with confirmation
- [ ] Cancel profile deletion
- [ ] Select profile and verify cache
- [ ] Clear profile and verify removal

**Game Access**:
- [ ] Access game without profile (blocked)
- [ ] Select profile and access game (allowed)
- [ ] Verify profile in game header
- [ ] Play session and verify data
- [ ] Change profile mid-session

**Responsive Design**:
- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768x1024)
- [ ] Test on mobile (375x667)
- [ ] Test modal scrolling
- [ ] Test touch interactions

**Error Scenarios**:
- [ ] Network offline during profile creation
- [ ] Invalid age input
- [ ] Empty required fields
- [ ] Backend API unavailable
- [ ] DynamoDB throttling

## Security Considerations

**Frontend**:
- No sensitive data in localStorage (only IDs)
- Input validation and sanitization
- XSS prevention (React escaping)
- HTTPS only in production

**Backend**:
- API Gateway CORS configuration
- Lambda IAM roles with least privilege
- DynamoDB encryption at rest
- CloudWatch logging (no PII)
- Input validation in all Lambdas

**Data Privacy**:
- Profile data scoped to therapistId
- No cross-therapist data access
- Session data tied to specific profiles
- Future: Add authentication/authorization

## Performance Optimization

**Frontend**:
- Profile list caching in localStorage
- Debounced search input
- Lazy loading for large profile lists
- Optimistic UI updates
- Code splitting for modal component

**Backend**:
- DynamoDB GSI for efficient queries
- Lambda function optimization (< 1s execution)
- S3 lifecycle policies for old sessions
- CloudFront CDN for static assets (future)

**Database**:
- Composite key design for efficient queries
- GSI for sorting by createdAt
- On-demand billing for cost optimization
- TTL for old session data (future)

## Deployment Architecture

**Infrastructure as Code**: Terraform

**Resources**:
- DynamoDB table: `focusflow-profiles-dev`
- Lambda functions: 3 (create, get, delete)
- API Gateway: REST API with 3 routes
- IAM roles and policies
- CloudWatch log groups

**Environments**:
- Development: `-dev` suffix
- Production: `-prod` suffix (future)

**CI/CD** (future):
- GitHub Actions for automated deployment
- Terraform plan on PR
- Terraform apply on merge to main
- Frontend deployment to Vercel/Amplify

## Monitoring and Observability

**CloudWatch Metrics**:
- Lambda invocation count
- Lambda error rate
- Lambda duration
- DynamoDB read/write capacity
- API Gateway request count
- API Gateway 4xx/5xx errors

**CloudWatch Logs**:
- Lambda execution logs
- API Gateway access logs
- Error stack traces
- Performance metrics

**Alarms** (future):
- Lambda error rate > 5%
- API Gateway 5xx rate > 1%
- DynamoDB throttling events
- Lambda duration > 3s

## Future Enhancements

**Phase 2**:
- Profile photos/avatars
- Profile editing capability
- Bulk profile import (CSV)
- Profile export for reporting
- Profile groups/categories

**Phase 3**:
- Multi-therapist authentication
- Role-based access control
- Profile sharing between therapists
- Advanced analytics dashboard
- Progress tracking charts

**Phase 4**:
- Real-time collaboration
- Video session recording
- AI-powered insights per profile
- Automated report generation
- Mobile app (React Native)

## Dependencies

**Frontend**:
- React 18
- Next.js 14
- TypeScript 5
- CSS Modules

**Backend**:
- AWS SDK v3
- Node.js 18 runtime
- Terraform 1.5+

**Infrastructure**:
- AWS Account
- Terraform Cloud (optional)
- GitHub for version control

## Rollback Strategy

**Frontend**:
- Git revert to previous commit
- Redeploy previous version
- Clear browser cache if needed

**Backend**:
- Terraform state rollback
- Lambda version rollback
- DynamoDB point-in-time recovery

**Data Migration**:
- Export profiles before major changes
- Test migration in dev environment
- Backup DynamoDB table before production changes

---

**Design complete! Ready for implementation planning.** 🎯
