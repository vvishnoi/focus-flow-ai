'use client'

import styles from './PerformanceBadge.module.css'
import { PerformanceLevel } from '@/lib/performanceAnalyzer'

export interface PerformanceBadgeProps {
  type: 'performance' | 'personal-best' | 'first-session'
  performanceLevel?: PerformanceLevel
  animated?: boolean
}

export default function PerformanceBadge({
  type,
  performanceLevel,
  animated = true
}: PerformanceBadgeProps) {
  const getBadgeContent = () => {
    switch (type) {
      case 'personal-best':
        return {
          icon: '🏆',
          text: 'Personal Best!',
          className: styles.personalBest
        }
      
      case 'first-session':
        return {
          icon: '🎯',
          text: 'First Session',
          className: styles.firstSession
        }
      
      case 'performance':
        return getPerformanceBadgeContent()
    }
  }

  const getPerformanceBadgeContent = () => {
    switch (performanceLevel) {
      case 'excellent':
        return {
          icon: '✨',
          text: 'Excellent',
          className: styles.excellent
        }
      case 'good':
        return {
          icon: '👍',
          text: 'Good',
          className: styles.good
        }
      case 'moderate':
        return {
          icon: '💪',
          text: 'Keep Going',
          className: styles.moderate
        }
      case 'needs-improvement':
        return {
          icon: '🎓',
          text: 'Practice',
          className: styles.needsImprovement
        }
      default:
        return {
          icon: '⭐',
          text: 'Complete',
          className: ''
        }
    }
  }

  const content = getBadgeContent()

  return (
    <div className={`${styles.badge} ${content.className} ${animated ? styles.animated : ''}`}>
      <span className={styles.icon}>{content.icon}</span>
      <span className={styles.text}>{content.text}</span>
    </div>
  )
}
