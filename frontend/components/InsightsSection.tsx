'use client'

import styles from './InsightsSection.module.css'
import { PerformanceAnalysis } from '@/lib/performanceAnalyzer'

export interface InsightsSectionProps {
  analysis: PerformanceAnalysis
}

export default function InsightsSection({ analysis }: InsightsSectionProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Performance Insights</h3>
      
      {/* Main Feedback Message */}
      <div className={styles.feedbackBox}>
        <div className={styles.feedbackIcon}>💡</div>
        <p className={styles.feedbackMessage}>{analysis.feedbackMessage}</p>
      </div>

      <div className={styles.columns}>
        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnIcon}>✨</span>
              <h4 className={styles.columnTitle}>Strengths</h4>
            </div>
            <ul className={styles.list}>
              {analysis.strengths.map((strength, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.bullet}>•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {analysis.improvements.length > 0 && (
          <div className={styles.column}>
            <div className={styles.columnHeader}>
              <span className={styles.columnIcon}>🎯</span>
              <h4 className={styles.columnTitle}>Areas to Improve</h4>
            </div>
            <ul className={styles.list}>
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className={styles.listItem}>
                  <span className={styles.bullet}>•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
