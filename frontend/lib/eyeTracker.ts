interface GazeData {
  timestamp: number
  gazeX: number
  gazeY: number
}

type GazeCallback = (data: GazeData) => void

export class EyeTracker {
  private webgazer: any = null
  private isInitialized = false
  private callback: GazeCallback | null = null

  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Dynamically import webgazer
      const webgazerModule = await import('webgazer')
      this.webgazer = webgazerModule.default

      // Configure webgazer before initialization
      this.webgazer.params.showVideoPreview = true
      this.webgazer.params.showFaceOverlay = false
      this.webgazer.params.showFaceFeedbackBox = false

      // Initialize webgazer with gaze listener
      await this.webgazer
        .setGazeListener((data: any, timestamp: number) => {
          if (data && this.callback) {
            this.callback({
              timestamp,
              gazeX: data.x,
              gazeY: data.y
            })
          }
        })
        .begin()

      // Wait for video to be ready
      await this.waitForVideoReady()

      // Show calibration points
      this.webgazer.showPredictionPoints(true)

      // Give time for initial calibration
      await new Promise(resolve => setTimeout(resolve, 2000))

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize eye tracker:', error)
      throw error
    }
  }

  private async waitForVideoReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Video initialization timeout'))
      }, 10000)

      const checkVideo = () => {
        const video = document.querySelector('#webgazerVideoFeed') as HTMLVideoElement
        if (video && video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
          clearTimeout(timeout)
          resolve()
        } else {
          setTimeout(checkVideo, 100)
        }
      }

      checkVideo()
    })
  }

  startTracking(callback: GazeCallback) {
    this.callback = callback
    if (this.webgazer) {
      this.webgazer.resume()
      // Hide prediction points during actual game
      this.webgazer.showPredictionPoints(false)
    }
  }

  stop() {
    if (this.webgazer) {
      this.webgazer.pause()
      this.callback = null
    }
  }

  async cleanup() {
    try {
      this.callback = null
      
      if (this.webgazer) {
        // Stop tracking
        this.webgazer.pause()
        
        // End webgazer session
        await this.webgazer.end()
        
        // Remove video elements
        const videoFeed = document.querySelector('#webgazerVideoFeed')
        const videoCanvas = document.querySelector('#webgazerVideoCanvas')
        const faceOverlay = document.querySelector('#webgazerFaceOverlay')
        const faceFeedback = document.querySelector('#webgazerFaceFeedbackBox')
        
        if (videoFeed) videoFeed.remove()
        if (videoCanvas) videoCanvas.remove()
        if (faceOverlay) faceOverlay.remove()
        if (faceFeedback) faceFeedback.remove()
        
        // Stop all video tracks to turn off camera
        const video = document.querySelector('video') as HTMLVideoElement
        if (video && video.srcObject) {
          const stream = video.srcObject as MediaStream
          stream.getTracks().forEach(track => {
            track.stop()
            console.log('Stopped track:', track.kind)
          })
        }
        
        this.webgazer = null
        this.isInitialized = false
        console.log('Eye tracker cleanup complete')
      }
    } catch (error) {
      console.error('Error during cleanup:', error)
    }
  }
}
