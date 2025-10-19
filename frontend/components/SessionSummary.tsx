'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './SessionSummary.module.css'
import MetricCard from './MetricCard'
import PerformanceBadge from './PerformanceBadge'
import LevelMetricsCard from './LevelMetricsCard'
import InsightsSection from './InsightsSection'
import ProgressSection from './ProgressSection'
import { SessionHistoryManager, SessionHistoryEntry } from '@/lib/sessionHistory'
import { PerformanceAnalyzer, PerformanceAnalysis } from '@/lib/performanceAnalyzer'
import { generateSessionId } from '@/lib/api'

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

interface SessionSummaryProps {
  sessionData: SessionData
  onClose: () => void
  onPlayAgain?: () => void
  onTryDifferentLevel?: () => void
}

export default function SessionSummary({ 
  sessionData, 
  onClose,
  onPlayAgain,
  onTryDifferentLevel 
}: SessionSummaryProps) {
  const router = useRouter()
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null)
  const [previousSession, setPreviousSession] = useState<SessionHistoryEntry | null>(null)
  const [isFirstSession, setIsFirstSession] = useState(false)

  // Calculate metrics
  const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000)
  const totalDataPoints = sessionData.gazeData.length
  const trackedPoints = sessionData.gazeData.filter(d => d.objectId !== null).length
  const trackingAccuracy = totalDataPoints > 0 
    ? Math.round((trackedPoints / totalDataPoints) * 100) 
    : 0

  // Calculate level-specific metrics
  const calculateLevelMetrics = () => {
    const metrics: any = {}
    
    switch (sessionData.level) {
      case 'level1':
        const followEvents = sessionData.events.filter((e: any) => e.type === 'object_followed')
        metrics.objectsFollowed = followEvents.length
        metrics.averageFollowTime = followEvents.length > 0 
          ? followEvents.reduce((sum: number, e: any) => sum + (e.data?.duration || 0), 0) / followEvents.length 
          : 0
        break
        
      case 'level2':
        const collisionEvents = sessionData.events.filter((e: any) => e.type === 'collision_avoided')
        metrics.collisionsAvoided = collisionEvents.length
        metrics.totalCollisions = sessionData.events.filter((e: any) => e.type === 'collision').length
        break
        
      case 'level3':
        const patternEvents = sessionData.events.filter((e: any) => e.type === 'pattern_identified')
        metrics.patternsIdentified = patternEvents.length
        metrics.distractorsIgnored = sessionData.events.filter((e: any) => e.type === 'distractor_ignored').length
        break
    }
    
    return metrics
  }

  const levelMetrics = calculateLevelMetrics()

  useEffect(() => {
    // Load previous session and analyze performance
    const prev = SessionHistoryManager.getPreviousSession(sessionData.level)
    const personalBest = SessionHistoryManager.getPersonalBest(sessionData.level)
    const history = SessionHistoryManager.getHistory()
    
    setPreviousSession(prev)
    setIsFirstSession(history.entries.length === 0)

    // Analyze performance
    const performanceAnalysis = PerformanceAnalyzer.analyze(
      sessionData,
      trackingAccuracy,
      levelMetrics,
      prev || undefined,
      personalBest || undefined
    )
    
    setAnalysis(performanceAnalysis)

    // Save current session to history
    const sessionEntry: SessionHistoryEntry = {
      sessionId: generateSessionId(),
      timestamp: sessionData.endTime,
      level: sessionData.level,
      duration,
      trackingAccuracy,
      levelMetrics
    }
    
    SessionHistoryManager.saveSession(sessionEntry)
  }, [])

  const handlePlayAgain = () => {
    if (onPlayAgain) {
      onPlayAgain()
    } else {
      router.push(`/game/${sessionData.level}`)
    }
  }

  const handleTryDifferentLevel = () => {
    if (onTryDifferentLevel) {
      onTryDifferentLevel()
    } else {
      router.push('/')
    }
  }

  const getLevelName = () => {
    return PerformanceAnalyzer.getLevelName(sessionData.level)
  }

  const getNextLevelPath = () => {
    if (!analysis?.suggestedNextLevel) return null
    return `/game/${analysis.suggestedNextLevel}`
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  if (!analysis) {
    return (
      <div className={styles.overlay}>
        <div className={styles.summaryBox}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.summaryBox}>
        {/* Header with Badge */}
        <div className={styles.header}>
          <h2 className={styles.title}>Session Complete! 🎉</h2>
          
          {analysis.isPersonalBest ? (
            <PerformanceBadge type="personal-best" animated />
          ) : isFirstSession ? (
            <PerformanceBadge type="first-session" animated />
          ) : (
            <PerformanceBadge 
              type="performance" 
              performanceLevel={analysis.performanceLevel}
              animated 
            />
          )}
        </div>

        {/* Primary Metrics */}
        <div className={styles.metricsGrid}>
          <MetricCard
            value={`${trackingAccuracy}%`}
            label="Tracking Accuracy"
            description="Percentage of time your eyes were on target"
            performanceLevel={analysis.performanceLevel}
            icon="🎯"
            animated
            comparison={analysis.comparisonData ? {
              previousValue: analysis.comparisonData.previousAccuracy,
              change: analysis.comparisonData.change,
              trend: analysis.comparisonData.trend === 'improving' ? 'up' : 
                     analysis.comparisonData.trend === 'declining' ? 'down' : 'stable'
            } : undefined}
          />

          <MetricCard
            value={formatDuration(duration)}
            label="Session Duration"
            description={duration >= 290 ? "Full session completed!" : "Try for the full 5 minutes"}
            icon="⏱️"
            animated
          />

          <MetricCard
            value={totalDataPoints}
            label="Data Points"
            description={totalDataPoints >= 1000 ? "High quality data" : "Good data collected"}
            icon="📊"
            animated
          />
        </div>

        {/* Level-Specific Metrics */}
        <LevelMetricsCard level={sessionData.level} metrics={levelMetrics} />

        {/* Insights Section */}
        <InsightsSection analysis={analysis} />

        {/* Progress Section */}
        <ProgressSection
          comparisonData={analysis.comparisonData}
          isPersonalBest={analysis.isPersonalBest}
          isFirstSession={isFirstSession}
        />

        {/* AI Analysis Status */}
        <div className={styles.aiStatus}>
          <div className={styles.aiIcon}>🤖</div>
          <div className={styles.aiText}>
            <strong>AI Analysis in Progress</strong>
            <p>Your detailed performance report will be ready in ~30 seconds</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={handlePlayAgain} className={`${styles.button} ${styles.primary}`}>
            Play Again
          </button>
          
          {analysis.suggestedNextLevel && (
            <button 
              onClick={() => router.push(getNextLevelPath()!)} 
              className={styles.button}
            >
              Try {PerformanceAnalyzer.getLevelName(analysis.suggestedNextLevel)}
            </button>
          )}
          
          <button onClick={handleTryDifferentLevel} className={styles.button}>
            Choose Level
          </button>
          
          <button onClick={onClose} className={`${styles.button} ${styles.secondary}`}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
