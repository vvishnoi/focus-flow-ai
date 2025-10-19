'use client'

import styles from './ProgressSection.module.css'
import ComparisonIndicator from './ComparisonIndicator'
import { ComparisonData } from '@/lib/performanceAnalyzer'

export interface ProgressSectionProps {
  comparisonData?: ComparisonData
  isPersonalBest: boolean
  isFirstSession: boolean
}

export default function ProgressSection({
  comparisonData,
  isPersonalBest,
  isFirstSession
}: ProgressSectionProps) {
  // Don't render if it's the first session and not a personal best
  if (isFirstSession && !comparisonData) {
    return (
      <div className={styles.container}>
        <div className={styles.firstSessionBox}>
          <div className={styles.firstSessionIcon}>🎯</div>
          <div className={styles.firstSessionContent}>
            <h3 className={styles.firstSessionTitle}>First Session Complete!</h3>
            <p className={styles.firstSessionText}>
              This is your baseline for future comparisons. Keep playing to track your improvement over time!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if no comparison data
  if (!comparisonData) {
    return null
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Progress Tracking</h3>
      
      <div className={styles.content}>
        {/* Personal Best Badge */}
        {isPersonalBest && (
          <div className={styles.personalBestBox}>
            <div className={styles.personalBestIcon}>🏆</div>
            <div className={styles.personalBestContent}>
              <h4 className={styles.personalBestTitle}>New Personal Best!</h4>
              <p className={styles.personalBestText}>
                You've achieved your highest accuracy yet. Congratulations!
              </p>
            </div>
          </div>
        )}

        {/* Comparison with Previous Session */}
        <div className={styles.comparisonBox}>
          <h4 className={styles.comparisonTitle}>Compared to Last Session</h4>
          <ComparisonIndicator
            previousValue={comparisonData.previousAccuracy}
            currentValue={comparisonData.previousAccuracy + comparisonData.change}
            change={comparisonData.change}
            trend={comparisonData.trend === 'improving' ? 'up' : comparisonData.trend === 'declining' ? 'down' : 'stable'}
          />
          
          {comparisonData.trend === 'improving' && (
            <p className={styles.trendMessage}>
              Great progress! Keep up the momentum.
            </p>
          )}
          
          {comparisonData.trend === 'stable' && (
            <p className={styles.trendMessage}>
              Consistent performance. Try pushing yourself a bit more!
            </p>
          )}
          
          {comparisonData.trend === 'declining' && (
            <p className={styles.trendMessage}>
              Don't worry! Everyone has off days. Keep practicing.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
