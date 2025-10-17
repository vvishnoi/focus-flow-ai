'use client'

import styles from './SessionSummary.module.css'

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
}

export default function SessionSummary({ sessionData, onClose }: SessionSummaryProps) {
  const duration = Math.round((sessionData.endTime - sessionData.startTime) / 1000)
  const totalDataPoints = sessionData.gazeData.length
  const trackedPoints = sessionData.gazeData.filter(d => d.objectId !== null).length
  const trackingAccuracy = totalDataPoints > 0 
    ? Math.round((trackedPoints / totalDataPoints) * 100) 
    : 0

  const getLevelName = (level: string) => {
    switch (level) {
      case 'level1': return 'Follow the Leader'
      case 'level2': return 'Collision Course'
      case 'level3': return 'Find the Pattern'
      default: return level
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.summaryBox}>
        <h2>Session Complete! 🎉</h2>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{getLevelName(sessionData.level)}</div>
            <div className={styles.statLabel}>Level</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{duration}s</div>
            <div className={styles.statLabel}>Duration</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{trackingAccuracy}%</div>
            <div className={styles.statLabel}>Tracking Accuracy</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statValue}>{totalDataPoints}</div>
            <div className={styles.statLabel}>Data Points</div>
          </div>
        </div>

        <div className={styles.message}>
          <p>Great job! Your session data has been recorded.</p>
          <p className={styles.note}>
            In the next iteration, this data will be sent to AWS for AI-powered analysis.
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={onClose} className={styles.button}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
