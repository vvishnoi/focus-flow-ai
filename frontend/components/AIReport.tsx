'use client'

import { useMemo } from 'react'
import styles from './AIReport.module.css'

interface AIReportProps {
  report: string
  timestamp: number
  sessionId: string
  modelUsed: string
}

export default function AIReport({ report, timestamp, sessionId, modelUsed }: AIReportProps) {
  // Parse the markdown-style report into structured sections
  const parsedReport = useMemo(() => {
    const sections: { title: string; content: string; level: number }[] = []
    const lines = report.split('\n')
    
    let currentSection = { title: '', content: '', level: 0 }
    
    lines.forEach((line) => {
      // Check for headers
      if (line.startsWith('# ')) {
        if (currentSection.title) sections.push(currentSection)
        currentSection = { title: line.replace('# ', ''), content: '', level: 1 }
      } else if (line.startsWith('## ')) {
        if (currentSection.title) sections.push(currentSection)
        currentSection = { title: line.replace('## ', ''), content: '', level: 2 }
      } else if (line.startsWith('### ')) {
        if (currentSection.title) sections.push(currentSection)
        currentSection = { title: line.replace('### ', ''), content: '', level: 3 }
      } else {
        currentSection.content += line + '\n'
      }
    })
    
    if (currentSection.title) sections.push(currentSection)
    
    return sections
  }, [report])

  // Extract metrics from the report
  const extractMetrics = (content: string) => {
    const metrics: { label: string; value: string; icon: string }[] = []
    
    // Look for patterns like "**Label: Value**" or "**Label:** Value"
    const metricPattern = /\*\*([^:]+):\s*([^*\n]+)\*\*/g
    let match
    
    while ((match = metricPattern.exec(content)) !== null) {
      const label = match[1].trim()
      const value = match[2].trim()
      
      let icon = '📊'
      if (label.toLowerCase().includes('accuracy')) icon = '🎯'
      if (label.toLowerCase().includes('focus')) icon = '🌟'
      if (label.toLowerCase().includes('time')) icon = '⏱️'
      if (label.toLowerCase().includes('distance')) icon = '📏'
      if (label.toLowerCase().includes('duration')) icon = '⏰'
      if (label.toLowerCase().includes('level') || label.toLowerCase().includes('activity')) icon = '🎮'
      
      metrics.push({ label, value, icon })
    }
    
    return metrics
  }

  // Format content with better styling
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((line, idx) => {
        // Bold text
        line = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        
        // Bullet points
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          return `<li key="${idx}">${line.replace(/^[-•]\s*/, '')}</li>`
        }
        
        // Numbered lists
        if (/^\d+\./.test(line.trim())) {
          return `<li key="${idx}">${line.replace(/^\d+\.\s*/, '')}</li>`
        }
        
        // Regular paragraphs
        if (line.trim()) {
          return `<p key="${idx}">${line}</p>`
        }
        
        return ''
      })
      .join('')
  }

  const getIconForSection = (title: string) => {
    const lower = title.toLowerCase()
    if (lower.includes('summary')) return '📋'
    if (lower.includes('highlight')) return '✨'
    if (lower.includes('metric') || lower.includes('interpretation')) return '📊'
    if (lower.includes('strength')) return '💪'
    if (lower.includes('growth') || lower.includes('improve')) return '🌱'
    if (lower.includes('recommendation')) return '💡'
    if (lower.includes('closing') || lower.includes('message')) return '💙'
    return '📌'
  }

  return (
    <div className={styles.reportContainer}>
      {/* Header */}
      <div className={styles.reportHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerIcon}>🤖</div>
          <div>
            <h2 className={styles.reportTitle}>AI Therapeutic Session Report</h2>
            <p className={styles.reportMeta}>
              {new Date(timestamp).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        <div className={styles.aiPowered}>
          <span className={styles.aiIcon}>✨</span>
          <span>Powered by {modelUsed}</span>
        </div>
      </div>

      {/* Sections */}
      <div className={styles.reportBody}>
        {parsedReport.map((section, idx) => {
          const metrics = extractMetrics(section.content)
          const hasMetrics = metrics.length > 0
          
          return (
            <div key={idx} className={styles.section} data-level={section.level}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{getIconForSection(section.title)}</span>
                <h3 className={styles.sectionTitle}>{section.title}</h3>
              </div>
              
              {hasMetrics && (
                <div className={styles.metricsGrid}>
                  {metrics.map((metric, midx) => (
                    <div key={midx} className={styles.metricCard}>
                      <div className={styles.metricIcon}>{metric.icon}</div>
                      <div className={styles.metricContent}>
                        <div className={styles.metricLabel}>{metric.label}</div>
                        <div className={styles.metricValue}>{metric.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div 
                className={styles.sectionContent}
                dangerouslySetInnerHTML={{ __html: formatContent(section.content) }}
              />
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className={styles.reportFooter}>
        <div className={styles.footerInfo}>
          <span className={styles.footerIcon}>🔬</span>
          <span>Session ID: {sessionId}</span>
        </div>
        <div className={styles.footerDisclaimer}>
          <span className={styles.disclaimerIcon}>ℹ️</span>
          <span>This report is generated by AI analysis and should be reviewed by qualified therapists.</span>
        </div>
      </div>
    </div>
  )
}
