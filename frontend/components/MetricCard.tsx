'use client'

import { ReactNode } from 'react'
import styles from './MetricCard.module.css'
import { PerformanceLevel } from '@/lib/performanceAnalyzer'

export interface MetricCardProps {
  value: number | string
  label: string
  description?: string
  performanceLevel?: PerformanceLevel
  icon?: ReactNode
  animated?: boolean
  comparison?: {
    previousValue: number
    change: number
    trend: 'up' | 'down' | 'stable'
  }
}

export default function MetricCard({
  value,
  label,
  description,
  performanceLevel,
  icon,
  animated = true,
  comparison
}: MetricCardProps) {
  const getPerformanceClass = () => {
    if (!performanceLevel) return ''
    return styles[`performance-${performanceLevel}`]
  }

  return (
    <div className={`${styles.card} ${animated ? styles.animated : ''} ${getPerformanceClass()}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      
      <div className={styles.content}>
        <div className={styles.value}>{value}</div>
        <div className={styles.label}>{label}</div>
        {description && <div className={styles.description}>{description}</div>}
        
        {comparison && (
          <div className={`${styles.comparison} ${styles[`trend-${comparison.trend}`]}`}>
            {comparison.trend === 'up' && '↑'}
            {comparison.trend === 'down' && '↓'}
            {comparison.trend === 'stable' && '→'}
            {' '}
            {comparison.change > 0 ? '+' : ''}{comparison.change}%
            <span className={styles.comparisonLabel}> from last session</span>
          </div>
        )}
      </div>
    </div>
  )
}
