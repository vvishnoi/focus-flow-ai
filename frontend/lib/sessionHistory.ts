// Session History Manager for tracking user progress over time

export interface SessionHistoryEntry {
  sessionId: string
  timestamp: number
  level: string
  duration: number
  trackingAccuracy: number
  levelMetrics: {
    // Level 1: Follow the Leader
    objectsFollowed?: number
    averageFollowTime?: number
    // Level 2: Collision Course
    collisionsAvoided?: number
    totalCollisions?: number
    // Level 3: Find the Pattern
    patternsIdentified?: number
    distractorsIgnored?: number
  }
}

export interface PersonalBest {
  accuracy: number
  sessionId: string
  timestamp: number
}

export interface SessionHistory {
  version: number
  entries: SessionHistoryEntry[]
  personalBests: {
    [level: string]: PersonalBest
  }
  streaks: {
    current: number
    longest: number
    lastPlayedDate: string
  }
}

export class SessionHistoryManager {
  private static readonly STORAGE_KEY = 'focusflow_session_history'
  private static readonly MAX_ENTRIES = 50
  private static readonly CURRENT_VERSION = 1

  /**
   * Save a session to history
   */
  static saveSession(entry: SessionHistoryEntry): void {
    try {
      const history = this.getHistory()
      
      // Add new entry
      history.entries.unshift(entry)
      
      // Limit to MAX_ENTRIES
      if (history.entries.length > this.MAX_ENTRIES) {
        history.entries = history.entries.slice(0, this.MAX_ENTRIES)
      }
      
      // Update personal best if applicable
      const currentBest = history.personalBests[entry.level]
      if (!currentBest || entry.trackingAccuracy > currentBest.accuracy) {
        history.personalBests[entry.level] = {
          accuracy: entry.trackingAccuracy,
          sessionId: entry.sessionId,
          timestamp: entry.timestamp
        }
      }
      
      // Update streaks
      this.updateStreaks(history, entry.timestamp)
      
      // Save to localStorage
      this.saveHistory(history)
    } catch (error) {
      console.error('Error saving session to history:', error)
    }
  }

  /**
   * Get complete session history
   */
  static getHistory(): SessionHistory {
    try {
      if (typeof window === 'undefined') {
        return this.createEmptyHistory()
      }

      const stored = localStorage.getItem(this.STORAGE_KEY)
      
      if (!stored) {
        return this.createEmptyHistory()
      }

      const history = JSON.parse(stored) as SessionHistory
      
      // Handle version migration if needed
      if (history.version !== this.CURRENT_VERSION) {
        return this.migrateHistory(history)
      }
      
      return history
    } catch (error) {
      console.error('Error loading session history:', error)
      return this.createEmptyHistory()
    }
  }

  /**
   * Get the previous session for a specific level
   */
  static getPreviousSession(level: string): SessionHistoryEntry | null {
    try {
      const history = this.getHistory()
      const levelSessions = history.entries.filter(entry => entry.level === level)
      
      // Return the most recent session (first in array after current)
      return levelSessions.length > 0 ? levelSessions[0] : null
    } catch (error) {
      console.error('Error getting previous session:', error)
      return null
    }
  }

  /**
   * Get personal best for a specific level
   */
  static getPersonalBest(level: string): PersonalBest | null {
    try {
      const history = this.getHistory()
      return history.personalBests[level] || null
    } catch (error) {
      console.error('Error getting personal best:', error)
      return null
    }
  }

  /**
   * Get all sessions for a specific level
   */
  static getLevelSessions(level: string, limit?: number): SessionHistoryEntry[] {
    try {
      const history = this.getHistory()
      const levelSessions = history.entries.filter(entry => entry.level === level)
      
      if (limit) {
        return levelSessions.slice(0, limit)
      }
      
      return levelSessions
    } catch (error) {
      console.error('Error getting level sessions:', error)
      return []
    }
  }

  /**
   * Get current streak information
   */
  static getStreaks(): { current: number; longest: number; lastPlayedDate: string } {
    try {
      const history = this.getHistory()
      return history.streaks
    } catch (error) {
      console.error('Error getting streaks:', error)
      return { current: 0, longest: 0, lastPlayedDate: '' }
    }
  }

  /**
   * Clear all session history
   */
  static clearHistory(): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing history:', error)
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      if (typeof window === 'undefined') return false
      const test = '__storage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      return false
    }
  }

  // Private helper methods

  private static createEmptyHistory(): SessionHistory {
    return {
      version: this.CURRENT_VERSION,
      entries: [],
      personalBests: {},
      streaks: {
        current: 0,
        longest: 0,
        lastPlayedDate: ''
      }
    }
  }

  private static saveHistory(history: SessionHistory): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history))
  }

  private static updateStreaks(history: SessionHistory, timestamp: number): void {
    const today = new Date(timestamp).toDateString()
    const lastPlayed = history.streaks.lastPlayedDate
    
    if (!lastPlayed) {
      // First session ever
      history.streaks.current = 1
      history.streaks.longest = 1
      history.streaks.lastPlayedDate = today
      return
    }
    
    const lastPlayedDate = new Date(lastPlayed)
    const currentDate = new Date(timestamp)
    const daysDiff = Math.floor((currentDate.getTime() - lastPlayedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff === 0) {
      // Same day, no change to streak
      return
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      history.streaks.current += 1
      history.streaks.longest = Math.max(history.streaks.longest, history.streaks.current)
    } else {
      // Streak broken, reset to 1
      history.streaks.current = 1
    }
    
    history.streaks.lastPlayedDate = today
  }

  private static migrateHistory(oldHistory: any): SessionHistory {
    // Handle future version migrations
    // For now, just return a new empty history
    console.warn('History version mismatch, creating new history')
    return this.createEmptyHistory()
  }
}
