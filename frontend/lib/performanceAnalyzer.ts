// Performance Analyzer for generating insights and feedback

import { SessionHistoryEntry, PersonalBest } from './sessionHistory'

export type PerformanceLevel = 'excellent' | 'good' | 'moderate' | 'needs-improvement'
export type Trend = 'improving' | 'stable' | 'declining'

export interface ComparisonData {
  previousAccuracy: number
  change: number
  changePercentage: number
  trend: Trend
}

export interface PerformanceAnalysis {
  performanceLevel: PerformanceLevel
  feedbackMessage: string
  strengths: string[]
  improvements: string[]
  comparisonData?: ComparisonData
  isPersonalBest: boolean
  suggestedNextLevel?: string
}

interface SessionData {
  level: string
  startTime: number
  endTime: number
  gazeData: Array<{
    timestamp: number
    gazeX: number
    gazeY: number
    objectId: string | null
    objectX: number
    objectY: number
  }>
  events: Array<{ type: string; timestamp: number; data: any }>
}

export class PerformanceAnalyzer {
  private static readonly THRESHOLDS = {
    excellent: 80,
    good: 60,
    moderate: 40,
    needsImprovement: 0
  }

  private static readonly TARGET_DURATION = 300 // 5 minutes in seconds

  /**
   * Analyze session performance and generate insights
   */
  static analyze(
    sessionData: SessionData,
    trackingAccuracy: number,
    levelMetrics: any,
    previousSession?: SessionHistoryEntry,
    personalBest?: PersonalBest
  ): PerformanceAnalysis {
    const performanceLevel = this.determinePerformanceLevel(trackingAccuracy)
    const isPersonalBest = !personalBest || trackingAccuracy > personalBest.accuracy
    
    const comparisonData = previousSession 
      ? this.compareWithPrevious(trackingAccuracy, previousSession.trackingAccuracy)
      : undefined

    const feedbackMessage = this.generateFeedback(
      performanceLevel,
      trackingAccuracy,
      sessionData,
      comparisonData,
      isPersonalBest
    )

    const strengths = this.identifyStrengths(
      sessionData,
      trackingAccuracy,
      levelMetrics,
      comparisonData
    )

    const improvements = this.suggestImprovements(
      sessionData,
      trackingAccuracy,
      levelMetrics,
      performanceLevel
    )

    const suggestedNextLevel = this.suggestNextLevel(
      sessionData.level,
      performanceLevel,
      trackingAccuracy
    )

    return {
      performanceLevel,
      feedbackMessage,
      strengths,
      improvements,
      comparisonData,
      isPersonalBest,
      suggestedNextLevel
    }
  }

  /**
   * Determine performance level based on accuracy
   */
  private static determinePerformanceLevel(accuracy: number): PerformanceLevel {
    if (accuracy >= this.THRESHOLDS.excellent) return 'excellent'
    if (accuracy >= this.THRESHOLDS.good) return 'good'
    if (accuracy >= this.THRESHOLDS.moderate) return 'moderate'
    return 'needs-improvement'
  }

  /**
   * Compare current performance with previous session
   */
  private static compareWithPrevious(
    currentAccuracy: number,
    previousAccuracy: number
  ): ComparisonData {
    const change = currentAccuracy - previousAccuracy
    const changePercentage = previousAccuracy > 0 
      ? Math.round((change / previousAccuracy) * 100)
      : 0

    let trend: Trend = 'stable'
    if (Math.abs(change) >= 5) {
      trend = change > 0 ? 'improving' : 'declining'
    }

    return {
      previousAccuracy,
      change: Math.round(change * 10) / 10,
      changePercentage,
      trend
    }
  }

  /**
   * Generate personalized feedback message
   */
  private static generateFeedback(
    performanceLevel: PerformanceLevel,
    accuracy: number,
    sessionData: SessionData,
    comparisonData?: ComparisonData,
    isPersonalBest?: boolean
  ): string {
    const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000)
    const isFullSession = duration >= this.TARGET_DURATION - 10 // Allow 10s tolerance

    if (isPersonalBest) {
      return "🏆 New Personal Best! You've reached a new peak in your performance!"
    }

    if (comparisonData && comparisonData.trend === 'improving') {
      return `Great progress! Your accuracy improved by ${Math.abs(comparisonData.change)}% from your last session.`
    }

    switch (performanceLevel) {
      case 'excellent':
        return isFullSession
          ? "Excellent tracking! Your focus was strong throughout the entire session."
          : "Excellent tracking! Try completing the full 5-minute session to maximize your training."
      
      case 'good':
        return isFullSession
          ? "Good effort! You maintained solid focus. Keep practicing to reach excellence."
          : "Good effort! Try to maintain focus on the targets for longer periods."
      
      case 'moderate':
        return "You're making progress! Focus on keeping your eyes on the targets for longer stretches."
      
      case 'needs-improvement':
        return "Keep practicing! Make sure you're in a well-lit area and positioned comfortably in front of the camera."
    }
  }

  /**
   * Identify strengths based on performance
   */
  private static identifyStrengths(
    sessionData: SessionData,
    accuracy: number,
    levelMetrics: any,
    comparisonData?: ComparisonData
  ): string[] {
    const strengths: string[] = []
    const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000)

    // Accuracy-based strengths
    if (accuracy >= 80) {
      strengths.push("Excellent eye tracking accuracy")
    } else if (accuracy >= 60) {
      strengths.push("Good tracking consistency")
    }

    // Duration-based strengths
    if (duration >= this.TARGET_DURATION - 10) {
      strengths.push("Completed full 5-minute session")
    }

    // Improvement-based strengths
    if (comparisonData && comparisonData.trend === 'improving') {
      strengths.push(`${Math.abs(comparisonData.change)}% improvement from last session`)
    }

    // Level-specific strengths
    if (levelMetrics) {
      switch (sessionData.level) {
        case 'level1':
          if (levelMetrics.objectsFollowed >= 15) {
            strengths.push(`Successfully followed ${levelMetrics.objectsFollowed} objects`)
          }
          if (levelMetrics.averageFollowTime >= 2000) {
            strengths.push("Strong sustained attention")
          }
          break
        
        case 'level2':
          if (levelMetrics.collisionsAvoided >= 10) {
            strengths.push(`Avoided ${levelMetrics.collisionsAvoided} collisions`)
          }
          if (levelMetrics.totalCollisions <= 3) {
            strengths.push("Excellent collision avoidance")
          }
          break
        
        case 'level3':
          if (levelMetrics.patternsIdentified >= 12) {
            strengths.push(`Identified ${levelMetrics.patternsIdentified} patterns`)
          }
          if (levelMetrics.distractorsIgnored >= 20) {
            strengths.push("Great focus filtering out distractions")
          }
          break
      }
    }

    // Data quality strength
    if (sessionData.gazeData.length >= 1000) {
      strengths.push("High quality eye tracking data collected")
    }

    return strengths.length > 0 ? strengths : ["Session completed successfully"]
  }

  /**
   * Suggest improvements based on performance
   */
  private static suggestImprovements(
    sessionData: SessionData,
    accuracy: number,
    levelMetrics: any,
    performanceLevel: PerformanceLevel
  ): string[] {
    const improvements: string[] = []
    const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000)

    // Accuracy-based improvements
    if (accuracy < 60) {
      improvements.push("Try to keep your eyes focused on the moving targets")
      improvements.push("Ensure good lighting and camera positioning")
    } else if (accuracy < 80) {
      improvements.push("Work on maintaining focus for longer periods")
    }

    // Duration-based improvements
    if (duration < this.TARGET_DURATION - 30) {
      improvements.push("Try to complete the full 5-minute session for better results")
    }

    // Level-specific improvements
    if (levelMetrics) {
      switch (sessionData.level) {
        case 'level1':
          if (levelMetrics.objectsFollowed < 15) {
            improvements.push("Focus on following each object smoothly")
          }
          if (levelMetrics.averageFollowTime < 2000) {
            improvements.push("Try to track objects for longer durations")
          }
          break
        
        case 'level2':
          if (levelMetrics.totalCollisions > 5) {
            improvements.push("Work on anticipating object movements")
          }
          if (levelMetrics.collisionsAvoided < 10) {
            improvements.push("Practice quick eye movements to avoid collisions")
          }
          break
        
        case 'level3':
          if (levelMetrics.patternsIdentified < 10) {
            improvements.push("Take time to identify patterns before moving on")
          }
          if (levelMetrics.distractorsIgnored < 15) {
            improvements.push("Practice filtering out distracting elements")
          }
          break
      }
    }

    // Data quality improvements
    if (sessionData.gazeData.length < 500) {
      improvements.push("Ensure your face stays visible to the camera throughout")
    }

    return improvements.length > 0 
      ? improvements.slice(0, 3) // Limit to top 3 suggestions
      : ["Keep practicing to improve your skills"]
  }

  /**
   * Suggest next level based on performance
   */
  private static suggestNextLevel(
    currentLevel: string,
    performanceLevel: PerformanceLevel,
    accuracy: number
  ): string | undefined {
    // Excellent performance - suggest harder level
    if (performanceLevel === 'excellent' && accuracy >= 85) {
      switch (currentLevel) {
        case 'level1':
          return 'level2'
        case 'level2':
          return 'level3'
        case 'level3':
          return undefined // Already at hardest level
      }
    }

    // Poor performance - suggest easier level or retry
    if (performanceLevel === 'needs-improvement' && accuracy < 50) {
      switch (currentLevel) {
        case 'level3':
          return 'level2'
        case 'level2':
          return 'level1'
        case 'level1':
          return undefined // Already at easiest level
      }
    }

    return undefined // Stay at current level
  }

  /**
   * Get level name for display
   */
  static getLevelName(level: string): string {
    switch (level) {
      case 'level1': return 'Follow the Leader'
      case 'level2': return 'Collision Course'
      case 'level3': return 'Find the Pattern'
      default: return level
    }
  }

  /**
   * Get performance color for UI
   */
  static getPerformanceColor(performanceLevel: PerformanceLevel): string {
    switch (performanceLevel) {
      case 'excellent': return '#10b981' // green
      case 'good': return '#f59e0b' // yellow
      case 'moderate': return '#f97316' // orange
      case 'needs-improvement': return '#ef4444' // red
    }
  }
}
