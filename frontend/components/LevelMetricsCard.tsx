'use client'

import styles from './LevelMetricsCard.module.css'

interface LevelMetric {
  label: string
  value: string | number
  target?: string | number
  description: string
  icon?: string
}

export interface LevelMetricsCardProps {
  level: string
  metrics: any
}

export default function LevelMetricsCard({ level, metrics }: LevelMetricsCardProps) {
  const getLevelMetrics = (): LevelMetric[] => {
    switch (level) {
      case 'level1':
        return getLevel1Metrics()
      case 'level2':
        return getLevel2Metrics()
      case 'level3':
        return getLevel3Metrics()
      default:
        return []
    }
  }

  const getLevel1Metrics = (): LevelMetric[] => {
    const objectsFollowed = metrics?.objectsFollowed || 0
    const averageFollowTime = metrics?.averageFollowTime || 0
    
    return [
      {
        label: 'Objects Followed',
        value: objectsFollowed,
        target: 20,
        description: 'Number of objects you successfully tracked',
        icon: '👁️'
      },
      {
        label: 'Avg Follow Time',
        value: `${(averageFollowTime / 1000).toFixed(1)}s`,
        target: '2.0s',
        description: 'Average time spent tracking each object',
        icon: '⏱️'
      }
    ]
  }

  const getLevel2Metrics = (): LevelMetric[] => {
    const collisionsAvoided = metrics?.collisionsAvoided || 0
    const totalCollisions = metrics?.totalCollisions || 0
    const avoidanceRate = totalCollisions + collisionsAvoided > 0
      ? Math.round((collisionsAvoided / (collisionsAvoided + totalCollisions)) * 100)
      : 0
    
    return [
      {
        label: 'Collisions Avoided',
        value: collisionsAvoided,
        description: 'Successfully avoided collisions',
        icon: '✅'
      },
      {
        label: 'Total Collisions',
        value: totalCollisions,
        target: '< 5',
        description: 'Collisions that occurred',
        icon: '💥'
      },
      {
        label: 'Avoidance Rate',
        value: `${avoidanceRate}%`,
        target: '80%',
        description: 'Percentage of collisions avoided',
        icon: '🎯'
      }
    ]
  }

  const getLevel3Metrics = (): LevelMetric[] => {
    const patternsIdentified = metrics?.patternsIdentified || 0
    const distractorsIgnored = metrics?.distractorsIgnored || 0
    
    return [
      {
        label: 'Patterns Identified',
        value: patternsIdentified,
        target: 15,
        description: 'Patterns you successfully recognized',
        icon: '🔍'
      },
      {
        label: 'Distractors Ignored',
        value: distractorsIgnored,
        description: 'Distracting elements you filtered out',
        icon: '🚫'
      }
    ]
  }

  const getLevelName = (): string => {
    switch (level) {
      case 'level1': return 'Follow the Leader'
      case 'level2': return 'Collision Course'
      case 'level3': return 'Find the Pattern'
      default: return level
    }
  }

  const levelMetrics = getLevelMetrics()

  if (levelMetrics.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{getLevelName()} Performance</h3>
      
      <div className={styles.metricsGrid}>
        {levelMetrics.map((metric, index) => (
          <div key={index} className={styles.metricItem}>
            {metric.icon && <div className={styles.icon}>{metric.icon}</div>}
            
            <div className={styles.metricContent}>
              <div className={styles.metricLabel}>{metric.label}</div>
              
              <div className={styles.metricValue}>
                {metric.value}
                {metric.target && (
                  <span className={styles.target}> / {metric.target}</span>
                )}
              </div>
              
              <div className={styles.metricDescription}>{metric.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
