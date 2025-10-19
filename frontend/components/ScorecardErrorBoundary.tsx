'use client'

import React, { Component, ReactNode } from 'react'
import styles from './ScorecardErrorBoundary.module.css'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ScorecardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Scorecard Error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2 className={styles.errorTitle}>Oops! Something went wrong</h2>
            <p className={styles.errorMessage}>
              We encountered an error while displaying your session results.
            </p>
            <p className={styles.errorDetails}>
              Don't worry - your session data has been saved.
            </p>
            <div className={styles.errorActions}>
              <button onClick={this.handleReset} className={styles.button}>
                Try Again
              </button>
              <button 
                onClick={() => window.location.href = '/'} 
                className={`${styles.button} ${styles.secondary}`}
              >
                Back to Home
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDebug}>
                <summary>Error Details (Development Only)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.error.stack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
