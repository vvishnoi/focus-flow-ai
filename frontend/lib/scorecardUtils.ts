// Utility functions for scorecard enhancements

import { PERFORMANCE_THRESHOLDS, TARGET_DURATION, DATA_QUALITY_THRESHOLDS } from './scorecardConstants'
import { PerformanceLevel } from './performanceAnalyzer'

/**
 * Format duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (mins > 0) {
    return `${mins}m ${secs}s`
  }
  return `${secs}s`
}

/**
 * Format duration with full labels
 */
export function formatDurationLong(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (mins > 0) {
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'} ${secs} ${secs === 1 ? 'second' : 'seconds'}`
  }
  return `${secs} ${secs === 1 ? 'second' : 'seconds'}`
}

/**
 * Format percentage with optional decimal places
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate tracking accuracy from gaze data
 */
export function calculateTrackingAccuracy(gazeData: Array<{ objectId: string | null }>): number {
  if (gazeData.length === 0) return 0
  
  const trackedPoints = gazeData.filter(d => d.objectId !== null).length
  return Math.round((trackedPoints / gazeData.length) * 100)
}

/**
 * Determine if session is complete (within tolerance)
 */
export function isSessionComplete(duration: number, tolerance: number = 10): boolean {
  return duration >= TARGET_DURATION - tolerance
}

/**
 * Get data quality level
 */
export function getDataQuality(dataPoints: number): 'high' | 'medium' | 'low' {
  if (dataPoints >= DATA_QUALITY_THRESHOLDS.high) return 'high'
  if (dataPoints >= DATA_QUALITY_THRESHOLDS.medium) return 'medium'
  return 'low'
}

/**
 * Get data quality description
 */
export function getDataQualityDescription(dataPoints: number): string {
  const quality = getDataQuality(dataPoints)
  
  switch (quality) {
    case 'high':
      return 'High quality data collected'
    case 'medium':
      return 'Good data collected'
    case 'low':
      return 'Limited data collected'
  }
}

/**
 * Determine performance level from accuracy
 */
export function getPerformanceLevel(accuracy: number): PerformanceLevel {
  if (accuracy >= PERFORMANCE_THRESHOLDS.excellent) return 'excellent'
  if (accuracy >= PERFORMANCE_THRESHOLDS.good) return 'good'
  if (accuracy >= PERFORMANCE_THRESHOLDS.moderate) return 'moderate'
  return 'needs-improvement'
}

/**
 * Get color for performance level
 */
export function getPerformanceColor(performanceLevel: PerformanceLevel): string {
  const colors = {
    'excellent': '#10b981',
    'good': '#f59e0b',
    'moderate': '#f97316',
    'needs-improvement': '#ef4444'
  }
  return colors[performanceLevel]
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Get level display name
 */
export function getLevelName(level: string): string {
  const names: Record<string, string> = {
    'level1': 'Follow the Leader',
    'level2': 'Collision Course',
    'level3': 'Find the Pattern'
  }
  return names[level] || level
}

/**
 * Get level number from level string
 */
export function getLevelNumber(level: string): number {
  const match = level.match(/\d+/)
  return match ? parseInt(match[0]) : 0
}

/**
 * Check if level exists
 */
export function isValidLevel(level: string): boolean {
  return ['level1', 'level2', 'level3'].includes(level)
}

/**
 * Get next level
 */
export function getNextLevel(currentLevel: string): string | null {
  const levelNum = getLevelNumber(currentLevel)
  if (levelNum >= 3) return null
  return `level${levelNum + 1}`
}

/**
 * Get previous level
 */
export function getPreviousLevel(currentLevel: string): string | null {
  const levelNum = getLevelNumber(currentLevel)
  if (levelNum <= 1) return null
  return `level${levelNum - 1}`
}
