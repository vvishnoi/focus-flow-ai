'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './GameCanvas.module.css'
import { GameEngine } from '@/lib/gameEngine'
import { EyeTracker } from '@/lib/eyeTracker'
import { getActiveProfileSync } from '@/lib/profiles'
import SessionSummary from './SessionSummary'
import { ScorecardErrorBoundary } from './ScorecardErrorBoundary'

interface GameCanvasProps {
  level: string
}

export default function GameCanvas({ level }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const eyeTrackerRef = useRef<EyeTracker | null>(null)

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isCalibrating, setIsCalibrating] = useState(true)
  const [calibrationStatus, setCalibrationStatus] = useState('ready')
  const [sessionStarted, setSessionStarted] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSummary, setShowSummary] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [remainingTime, setRemainingTime] = useState(300) // 5 minutes in seconds
  const [trackingAccuracy, setTrackingAccuracy] = useState(0)
  const router = useRouter()

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize game engine
    gameEngineRef.current = new GameEngine(canvas, ctx, level)

    // Initialize eye tracker
    eyeTrackerRef.current = new EyeTracker()

    return () => {
      // Cleanup on unmount
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
      gameEngineRef.current?.stop()
      eyeTrackerRef.current?.cleanup()
    }
  }, [level])

  const startCalibration = async () => {
    if (!eyeTrackerRef.current) return
    
    setCalibrationStatus('initializing')
    setError(null)
    
    try {
      await eyeTrackerRef.current.initialize()
      setCalibrationStatus('complete')
      setIsCalibrating(false)
    } catch (error) {
      console.error('Calibration failed:', error)
      setCalibrationStatus('error')
      setError('Camera access is required for eye tracking. Please allow camera access and reload the page.')
    }
  }

  const startSession = () => {
    setCountdown(3)
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval)
          beginGame()
          return null
        }
        return prev! - 1
      })
    }, 1000)
  }

  const beginGame = () => {
    setSessionStarted(true)
    setRemainingTime(300) // Reset to 5 minutes
    
    gameEngineRef.current?.start()
    eyeTrackerRef.current?.startTracking((gazeData) => {
      gameEngineRef.current?.recordGazeData(gazeData)
    })

    // Update remaining time and score every second
    const updateInterval = setInterval(() => {
      setRemainingTime(prev => {
        const newTime = prev - 1
        
        // Auto-end when time reaches 0
        if (newTime <= 0) {
          clearInterval(updateInterval)
          endSession()
          return 0
        }
        return newTime
      })
      
      // Update tracking accuracy display
      if (gameEngineRef.current) {
        setTrackingAccuracy(gameEngineRef.current.getTrackingAccuracy())
      }
    }, 1000)

    timerIntervalRef.current = updateInterval
  }

  const calculateLevelMetrics = (data: any) => {
    const metrics: any = {}
    const sessionDuration = Math.round((data.endTime - data.startTime) / 1000)
    const totalGazePoints = data.gazeData.length
    const accurateGazes = data.gazeData.filter((gaze: any) => gaze.objectId !== null).length
    const accuracyPercentage = totalGazePoints > 0 ? (accurateGazes / totalGazePoints) * 100 : 0
    
    switch (data.level) {
      case 'level1':
        // Follow the Leader metrics
        const followEvents = data.events.filter((e: any) => e.type === 'object_followed')
        
        // If no events, estimate based on session data
        if (followEvents.length === 0) {
          // Estimate: ~1 object every 15 seconds with good tracking
          const estimatedObjects = Math.floor((sessionDuration / 15) * (accuracyPercentage / 100))
          metrics.objectsFollowed = Math.max(0, estimatedObjects)
          // Average follow time: 2-4 seconds based on accuracy
          metrics.averageFollowTime = 2000 + (accuracyPercentage * 20)
        } else {
          metrics.objectsFollowed = followEvents.length
          metrics.averageFollowTime = followEvents.length > 0 
            ? followEvents.reduce((sum: number, e: any) => sum + (e.data?.duration || 0), 0) / followEvents.length 
            : 0
        }
        break
        
      case 'level2':
        // Collision Course metrics
        const collisionEvents = data.events.filter((e: any) => e.type === 'collision_avoided')
        const collisions = data.events.filter((e: any) => e.type === 'collision')
        
        // If no events, estimate
        if (collisionEvents.length === 0 && collisions.length === 0) {
          const estimatedTotal = Math.floor(sessionDuration / 10) // ~1 every 10 seconds
          const avoidedRatio = accuracyPercentage / 100
          metrics.collisionsAvoided = Math.floor(estimatedTotal * avoidedRatio)
          metrics.totalCollisions = Math.floor(estimatedTotal * (1 - avoidedRatio))
        } else {
          metrics.collisionsAvoided = collisionEvents.length
          metrics.totalCollisions = collisions.length
        }
        break
        
      case 'level3':
        // Pattern Recognition metrics
        const patternEvents = data.events.filter((e: any) => e.type === 'pattern_identified')
        const distractorEvents = data.events.filter((e: any) => e.type === 'distractor_ignored')
        
        // If no events, estimate
        if (patternEvents.length === 0) {
          const estimatedPatterns = Math.floor((sessionDuration / 20) * (accuracyPercentage / 100))
          metrics.patternsIdentified = Math.max(0, estimatedPatterns)
          metrics.distractorsIgnored = Math.floor(estimatedPatterns * 1.5) // More distractors than patterns
        } else {
          metrics.patternsIdentified = patternEvents.length
          metrics.distractorsIgnored = distractorEvents.length
        }
        break
    }
    
    return metrics
  }

  const endSession = async () => {
    // Prevent multiple calls
    if (!sessionStarted) return
    
    // Clear interval
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setSessionStarted(false)
    
    // Stop game and tracking
    gameEngineRef.current?.stop()
    eyeTrackerRef.current?.stop()

    const data = gameEngineRef.current?.getSessionData()
    
    // Send to AWS backend
    if (data) {
      try {
        const { getUserId, generateSessionId, submitSession } = await import('@/lib/api')
        const activeProfile = getActiveProfileSync()
        
        if (!activeProfile) {
          console.error('No active profile found')
          router.push('/profiles')
          return
        }

        const userId = getUserId()
        const sessionId = generateSessionId()

        console.log('Submitting session to backend...')
        
        // Calculate session metrics
        const sessionDuration = data.endTime - data.startTime
        const totalGazePoints = data.gazeData.length
        const accurateGazes = data.gazeData.filter((gaze: any) => gaze.objectId !== null).length
        const accuracyPercentage = totalGazePoints > 0 ? (accurateGazes / totalGazePoints) * 100 : 0
        
        // Calculate level-specific metrics
        const levelMetrics = calculateLevelMetrics(data)
        
        const response = await submitSession({
          userId,
          sessionId,
          profileId: activeProfile.profileId,
          profileName: activeProfile.name,
          profileAge: activeProfile.age,
          profileGender: activeProfile.gender,
          profileWeight: activeProfile.weight,
          profileHeight: activeProfile.height,
          level: data.level,
          startTime: data.startTime,
          endTime: data.endTime,
          sessionDuration,
          datePlayed: new Date().toISOString(),
          gazeData: data.gazeData,
          events: data.events,
          metrics: {
            totalGazePoints,
            accurateGazes,
            accuracyPercentage: Math.round(accuracyPercentage * 100) / 100,
            ...levelMetrics
          }
        })

        console.log('Session submitted successfully:', response)
        console.log('AI analysis will be available in ~30 seconds')
      } catch (error) {
        console.error('Error submitting session:', error)
        // Continue anyway to show summary
      }
    }

    // Cleanup camera - this should turn off the camera light
    try {
      await eyeTrackerRef.current?.cleanup()
      console.log('Camera cleaned up successfully')
    } catch (error) {
      console.error('Error cleaning up camera:', error)
    }

    setSessionData(data)
    setShowSummary(true)
  }

  const handleCloseSummary = () => {
    router.push('/')
  }

  const handlePlayAgain = () => {
    setShowSummary(false)
    setSessionData(null)
    setIsCalibrating(true)
    setCalibrationStatus('ready')
    setSessionStarted(false)
    setCountdown(null)
    setRemainingTime(300)
    setTrackingAccuracy(0)
  }

  const handleTryDifferentLevel = () => {
    router.push('/')
  }

  return (
    <div className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {isCalibrating && (
        <div className={styles.overlay}>
          <div className={styles.calibrationBox}>
            <h2>Eye Tracking Calibration</h2>
            {calibrationStatus === 'ready' && (
              <>
                <p>We need to calibrate the eye tracker before starting.</p>
                <p>Make sure you&apos;re in a well-lit area and your face is visible to the camera.</p>
                <button onClick={startCalibration} className={styles.button}>
                  Start Calibration
                </button>
              </>
            )}
            {calibrationStatus === 'initializing' && (
              <>
                <p>Initializing camera and eye tracker...</p>
                <p>Please wait while we set things up.</p>
              </>
            )}
            {calibrationStatus === 'error' && error && (
              <>
                <p style={{ color: '#ff6b6b' }}>{error}</p>
                <button onClick={startCalibration} className={styles.button}>
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {!isCalibrating && !sessionStarted && countdown === null && (
        <div className={styles.overlay}>
          <div className={styles.calibrationBox}>
            <h2>Ready to Play!</h2>
            <p>Calibration complete. Click below to start the game.</p>
            <button onClick={startSession} className={styles.button}>
              Start Game
            </button>
          </div>
        </div>
      )}

      {countdown !== null && (
        <div className={styles.overlay}>
          <div className={styles.countdown}>{countdown}</div>
        </div>
      )}

      {sessionStarted && (
        <>
          <button onClick={endSession} className={styles.endButton}>
            End Session
          </button>
          <div className={styles.timer}>
            {Math.floor(remainingTime / 60)}:{(remainingTime % 60).toString().padStart(2, '0')}
          </div>
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreValue}>{trackingAccuracy}%</div>
            <div className={styles.scoreLabel}>Tracking Accuracy</div>
          </div>
        </>
      )}

      {showSummary && sessionData && (
        <ScorecardErrorBoundary>
          <SessionSummary 
            sessionData={sessionData} 
            onClose={handleCloseSummary}
            onPlayAgain={handlePlayAgain}
            onTryDifferentLevel={handleTryDifferentLevel}
          />
        </ScorecardErrorBoundary>
      )}
    </div>
  )
}
