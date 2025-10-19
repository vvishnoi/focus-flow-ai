// Profile management utilities - Backend integrated

export interface Profile {
  profileId: string
  therapistId: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say'
  weight?: number // in kg
  height?: number // in cm
  createdAt: number
  updatedAt: number
}

const THERAPIST_ID_KEY = 'focusflow_therapist_id'
const ACTIVE_PROFILE_KEY = 'focusflow_active_profile'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

/**
 * Get or create therapist ID (stored in localStorage)
 */
export function getTherapistId(): string {
  if (typeof window === 'undefined') return 'anonymous'
  
  let therapistId = localStorage.getItem(THERAPIST_ID_KEY)
  
  if (!therapistId) {
    therapistId = `therapist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(THERAPIST_ID_KEY, therapistId)
  }
  
  return therapistId
}

/**
 * Get all profiles from backend
 */
export async function getProfiles(): Promise<Profile[]> {
  try {
    const therapistId = getTherapistId()
    const response = await fetch(`${API_URL}/profiles/${therapistId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch profiles')
    }
    
    const data = await response.json()
    return data.profiles || []
  } catch (error) {
    console.error('Error fetching profiles:', error)
    return []
  }
}

/**
 * Create a new profile
 */
export async function createProfile(data: Omit<Profile, 'profileId' | 'therapistId' | 'createdAt' | 'updatedAt'>): Promise<Profile> {
  try {
    const therapistId = getTherapistId()
    
    const response = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        therapistId,
        ...data
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create profile')
    }
    
    const result = await response.json()
    return result.profile
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

/**
 * Delete a profile
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    const therapistId = getTherapistId()
    
    const response = await fetch(`${API_URL}/profiles/${therapistId}/${profileId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete profile')
    }
    
    // Clear active profile if it was deleted
    const activeProfile = getActiveProfileFromStorage()
    if (activeProfile?.profileId === profileId) {
      clearActiveProfile()
    }
    
    return true
  } catch (error) {
    console.error('Error deleting profile:', error)
    return false
  }
}

/**
 * Get a profile by ID from the list
 */
export async function getProfile(profileId: string): Promise<Profile | null> {
  const profiles = await getProfiles()
  return profiles.find(p => p.profileId === profileId) || null
}

/**
 * Set the active profile (stores in localStorage)
 */
export function setActiveProfile(profile: Profile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACTIVE_PROFILE_KEY, JSON.stringify(profile))
}

/**
 * Get the active profile from localStorage
 */
function getActiveProfileFromStorage(): Profile | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(ACTIVE_PROFILE_KEY)
  if (!stored) return null
  
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

/**
 * Get the active profile (from localStorage, validated against backend)
 */
export async function getActiveProfile(): Promise<Profile | null> {
  const stored = getActiveProfileFromStorage()
  if (!stored) return null
  
  // Validate profile still exists in backend
  const profile = await getProfile(stored.profileId)
  if (!profile) {
    clearActiveProfile()
    return null
  }
  
  return profile
}

/**
 * Get active profile synchronously (from localStorage only)
 */
export function getActiveProfileSync(): Profile | null {
  return getActiveProfileFromStorage()
}

/**
 * Clear the active profile
 */
export function clearActiveProfile(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACTIVE_PROFILE_KEY)
}
