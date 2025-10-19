'use client'

import styles from './ComparisonIndicator.module.css'

export interface ComparisonIndicatorProps {
  previousValue: number
  currentValue: number
  change: number
  trend: 'up' | 'down' | 'stable'
  label?: string
}

export default function ComparisonIndicator({
  previousValue,
  currentValue,
  change,
  trend,
  label = 'from last session'
}: ComparisonIndicatorProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↑'
      case 'down': return '↓'
      case 'stable': return '→'
    }
  }

  const getTrendText = () => {
    switch (trend) {
      case 'up': return 'Improved'
      case 'down': return 'Decreased'
      case 'stable': return 'Stable'
    }
  }

  return (
    <div className={`${styles.container} ${styles[`trend-${trend}`]}`}>
      <div className={styles.icon}>{getTrendIcon()}</div>
      <div className={styles.content}>
        <div className={styles.change}>
          {change > 0 ? '+' : ''}{change}%
        </div>
        <div className={styles.label}>
          {getTrendText()} {label}
        </div>
        <div className={styles.values}>
          {previousValue}% → {currentValue}%
        </div>
      </div>
    </div>
  )
}
