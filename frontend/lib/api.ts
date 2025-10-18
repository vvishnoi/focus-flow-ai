// API client for FocusFlow AI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export interface SessionData {
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
  gazeData: Array<{
    timestamp: number
    gazeX: number
    gazeY: number
    objectId: string | null
    objectX: number
    objectY: number
  }>
  events: Array<{
    type: string
    timestamp: number
    data: any
  }>
  metrics: {
    totalGazePoints: number
    accurateGazes: number
    accuracyPercentage: number
    // Level-specific metrics
    objectsFollowed?: number
    averageFollowTime?: number
    collisionsAvoided?: number
    totalCollisions?: number
    patternsIdentified?: number
    distractorsIgnored?: number
  }
}

export interface Report {
  userId: string
  sessionId: string
  timestamp: number
  report: string
  s3Key: string
  generatedAt: number
  modelUsed: string
}

export interface SubmitSessionResponse {
  message: string
  s3Key: string
  sessionId: string
}

export interface GetReportsResponse {
  userId: string
  reports: Report[]
  count: number
}

/**
 * Submit a session to the backend for processing
 */
export async function submitSession(sessionData: SessionData): Promise<SubmitSessionResponse> {
  try {
    const response = await fetch(`${API_URL}/submit-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit session')
    }

    return await response.json()
  } catch (error) {
    console.error('Error submitting session:', error)
    throw error
  }
}

/**
 * Get reports for a user
 */
export async function getReports(userId: string): Promise<GetReportsResponse> {
  try {
    const response = await fetch(`${API_URL}/reports/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch reports')
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching reports:', error)
    throw error
  }
}

/**
 * Generate a unique user ID (stored in localStorage)
 */
export function getUserId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  
  let userId = localStorage.getItem('focusflow_user_id')
  
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('focusflow_user_id', userId)
  }
  
  return userId
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
