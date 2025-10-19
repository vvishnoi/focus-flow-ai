# API Documentation

Complete API reference for FocusFlow AI backend services.

## Base URL

```
https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev
```

## Authentication

Currently, the API uses userId-based identification stored in localStorage. No authentication tokens required for MVP.

## Endpoints

### Session Management

#### Submit Session

Submit eye-gaze tracking session data for processing and AI analysis.

**Endpoint:** `POST /submit-session`

**Request Body:**
```json
{
  "userId": "string",
  "sessionId": "string",
  "profileId": "string",
  "profileName": "string",
  "profileAge": number,
  "profileGender": "string",
  "profileWeight": number (optional),
  "profileHeight": number (optional),
  "level": "string",
  "startTime": number,
  "endTime": number,
  "sessionDuration": number,
  "datePlayed": "string",
  "gazeData": [
    {
      "timestamp": number,
      "gazeX": number,
      "gazeY": number,
      "objectId": "string | null",
      "objectX": number,
      "objectY": number
    }
  ],
  "events": [
    {
      "type": "string",
      "timestamp": number,
      "data": any
    }
  ],
  "metrics": {
    "totalGazePoints": number,
    "accurateGazes": number,
    "accuracyPercentage": number,
    "objectsFollowed": number (optional),
    "averageFollowTime": number (optional),
    "collisionsAvoided": number (optional),
    "totalCollisions": number (optional),
    "patternsIdentified": number (optional),
    "distractorsIgnored": number (optional)
  }
}
```

**Response:** `200 OK`
```json
{
  "message": "Session data received successfully",
  "s3Key": "sessions/user_123/session_456_1760874216165.json",
  "sessionId": "session_456"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Missing required fields: userId, sessionId, profileId, level"
}
```

**Example:**
```bash
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/submit-session" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1760841054950",
    "sessionId": "session_1760873899825",
    "profileId": "FOC-001",
    "profileName": "John Doe",
    "profileAge": 10,
    "profileGender": "male",
    "level": "follow-the-leader",
    "startTime": 1760873880000,
    "endTime": 1760873926000,
    "sessionDuration": 46,
    "datePlayed": "2025-10-19",
    "gazeData": [...],
    "events": [],
    "metrics": {
      "totalGazePoints": 731,
      "accurateGazes": 39,
      "accuracyPercentage": 5.3
    }
  }'
```

---

#### Get Reports

Retrieve AI-generated reports for a specific user.

**Endpoint:** `GET /reports/{userId}`

**Path Parameters:**
- `userId` (string, required): User identifier

**Response:** `200 OK`
```json
{
  "userId": "user_123",
  "reports": [
    {
      "userId": "user_123",
      "sessionId": "session_456",
      "timestamp": 1760874242706,
      "report": "# FocusFlow AI Therapeutic Session Report\n\n## Session Summary...",
      "s3Key": "sessions/user_123/session_456.json",
      "generatedAt": 1760874242706,
      "modelUsed": "claude-sonnet-4.5"
    }
  ],
  "count": 1
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "userId is required"
}
```

**Example:**
```bash
curl "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/reports/user_1760841054950"
```

---

### Profile Management

#### Create Profile

Create a new patient profile.

**Endpoint:** `POST /profiles`

**Request Body:**
```json
{
  "therapistId": "string",
  "name": "string",
  "age": number (3-18),
  "gender": "string",
  "weight": number (optional),
  "height": number (optional)
}
```

**Response:** `201 Created`
```json
{
  "message": "Profile created successfully",
  "profile": {
    "profileId": "FOC-001",
    "therapistId": "therapist_123",
    "name": "John Doe",
    "age": 10,
    "gender": "male",
    "weight": 35,
    "height": 140,
    "createdAt": 1760874242706,
    "updatedAt": 1760874242706
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "error": "Age must be between 3 and 18"
}
```

**Example:**
```bash
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/profiles" \
  -H "Content-Type: application/json" \
  -d '{
    "therapistId": "therapist_123",
    "name": "John Doe",
    "age": 10,
    "gender": "male",
    "weight": 35,
    "height": 140
  }'
```

---

#### Get Profiles

List all profiles for a therapist.

**Endpoint:** `GET /profiles/{therapistId}`

**Path Parameters:**
- `therapistId` (string, required): Therapist identifier

**Response:** `200 OK`
```json
{
  "therapistId": "therapist_123",
  "profiles": [
    {
      "profileId": "FOC-001",
      "therapistId": "therapist_123",
      "name": "John Doe",
      "age": 10,
      "gender": "male",
      "weight": 35,
      "height": 140,
      "createdAt": 1760874242706,
      "updatedAt": 1760874242706
    }
  ],
  "count": 1
}
```

**Example:**
```bash
curl "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/profiles/therapist_123"
```

---

#### Delete Profile

Delete a patient profile.

**Endpoint:** `DELETE /profiles/{therapistId}/{profileId}`

**Path Parameters:**
- `therapistId` (string, required): Therapist identifier
- `profileId` (string, required): Profile identifier

**Response:** `200 OK`
```json
{
  "message": "Profile deleted successfully",
  "profileId": "FOC-001"
}
```

**Error Response:** `404 Not Found`
```json
{
  "error": "Profile not found"
}
```

**Example:**
```bash
curl -X DELETE "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/profiles/therapist_123/FOC-001"
```

---

## Data Models

### Session Data
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
  events: Event[]
  metrics: Metrics
}
```

### Gaze Point
```typescript
interface GazePoint {
  timestamp: number
  gazeX: number
  gazeY: number
  objectId: string | null
  objectX: number
  objectY: number
}
```

### Metrics
```typescript
interface Metrics {
  totalGazePoints: number
  accurateGazes: number
  accuracyPercentage: number
  objectsFollowed?: number
  averageFollowTime?: number
  collisionsAvoided?: number
  totalCollisions?: number
  patternsIdentified?: number
  distractorsIgnored?: number
}
```

### Report
```typescript
interface Report {
  userId: string
  sessionId: string
  timestamp: number
  report: string
  s3Key: string
  generatedAt: number
  modelUsed: string
}
```

### Profile
```typescript
interface Profile {
  profileId: string
  therapistId: string
  name: string
  age: number
  gender: string
  weight?: number
  height?: number
  createdAt: number
  updatedAt: number
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limits

Currently no rate limiting implemented. Consider implementing for production:
- 100 requests per minute per userId
- 1000 requests per hour per IP

---

## CORS Configuration

All endpoints support CORS with:
- **Allowed Origins:** `*` (all origins)
- **Allowed Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers:** content-type, authorization, x-requested-with
- **Max Age:** 3600 seconds

---

## Testing

### Test Script
```bash
./scripts/test-api-endpoints.sh
```

### Manual Testing
```bash
# Test submit session
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/submit-session" \
  -H "Content-Type: application/json" \
  -d @test-session.json

# Test get reports
curl "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/reports/test-user"

# Test create profile
curl -X POST "https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev/profiles" \
  -H "Content-Type: application/json" \
  -d @test-profile.json
```

---

## Monitoring

### CloudWatch Logs
```bash
# API Gateway logs
aws logs tail /aws/apigateway/focusflow-dev --follow

# Lambda logs
aws logs tail /aws/lambda/focusflow-data-ingestor-dev --follow
aws logs tail /aws/lambda/focusflow-get-reports-dev --follow
```

### Metrics
- API Gateway request count
- Lambda invocation count
- Lambda error rate
- Lambda duration
- DynamoDB read/write capacity

---

## Changelog

### v1.0.0 (2025-10-19)
- Initial API release
- Session submission endpoint
- Report retrieval endpoint
- Profile management endpoints
- AI report generation via Bedrock
