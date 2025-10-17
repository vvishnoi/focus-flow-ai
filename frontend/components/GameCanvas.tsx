'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './GameCanvas.module.css'
import { GameEngine } from '@/lib/gameEngine'
import { EyeTracker } from '@/lib/eyeTracker'
import SessionSummary from './SessionSummary'

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
        const userId = getUserId()
        const sessionId = generateSessionId()

        console.log('Submitting session to backend...')
        
        const response = await submitSession({
          userId,
          sessionId,
          level: data.level,
          startTime: data.startTime,
          endTime: data.endTime,
          gazeData: data.gazeData,
          events: data.events
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
        <SessionSummary sessionData={sessionData} onClose={handleCloseSummary} />
      )}
    </div>
  )
}
