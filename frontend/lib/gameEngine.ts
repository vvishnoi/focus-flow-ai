interface GameObject {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  pattern?: 'square' | 'circle' | 'random'
}

interface GazeData {
  timestamp: number
  gazeX: number
  gazeY: number
}

interface SessionData {
  level: string
  startTime: number
  endTime: number
  gazeData: Array<GazeData & { objectId: string | null; objectX: number; objectY: number }>
  events: Array<{ type: string; timestamp: number; data: any }>
}

export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private level: string
  private objects: GameObject[] = []
  private animationId: number | null = null
  private sessionData: SessionData
  private isRunning = false
  private currentGaze: { x: number; y: number } | null = null
  private isTracking = false
  private trackingScore = 0
  private totalFrames = 0

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, level: string) {
    this.canvas = canvas
    this.ctx = ctx
    this.level = level
    this.sessionData = {
      level,
      startTime: 0,
      endTime: 0,
      gazeData: [],
      events: []
    }

    this.initializeLevel()
  }

  private initializeLevel() {
    switch (this.level) {
      case 'level1':
        this.initLevel1()
        break
      case 'level2':
        this.initLevel2()
        break
      case 'level3':
        this.initLevel3()
        break
    }
  }

  private initLevel1() {
    // Single large object moving slowly
    this.objects = [{
      id: 'obj1',
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
      vx: 2,
      vy: 1.5,
      radius: 60,
      color: '#FF6B6B'
    }]
  }

  private initLevel2() {
    // Multiple objects at different speeds
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D']
    this.objects = colors.map((color, i) => ({
      id: `obj${i + 1}`,
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      radius: 40,
      color
    }))
  }

  private initLevel3() {
    // Multiple objects with patterns
    const objects: GameObject[] = []
    
    // Blue objects with square pattern
    for (let i = 0; i < 2; i++) {
      objects.push({
        id: `blue${i + 1}`,
        x: 100 + i * 200,
        y: 100,
        vx: 3,
        vy: 0,
        radius: 35,
        color: '#4A90E2',
        pattern: 'square'
      })
    }

    // Random distractors
    for (let i = 0; i < 4; i++) {
      objects.push({
        id: `distractor${i + 1}`,
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        radius: 30,
        color: '#95A5A6',
        pattern: 'random'
      })
    }

    this.objects = objects
  }

  start() {
    this.isRunning = true
    this.sessionData.startTime = Date.now()
    this.gameLoop()
  }

  stop() {
    this.isRunning = false
    this.sessionData.endTime = Date.now()
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  private gameLoop = () => {
    if (!this.isRunning) return

    this.update()
    this.render()
    this.animationId = requestAnimationFrame(this.gameLoop)
  }

  private update() {
    this.objects.forEach(obj => {
      // Update position
      obj.x += obj.vx
      obj.y += obj.vy

      // Pattern-based movement for level 3
      if (obj.pattern === 'square') {
        this.updateSquarePattern(obj)
      }

      // Bounce off walls
      if (obj.x - obj.radius < 0 || obj.x + obj.radius > this.canvas.width) {
        obj.vx *= -1
        obj.x = Math.max(obj.radius, Math.min(this.canvas.width - obj.radius, obj.x))
      }
      if (obj.y - obj.radius < 0 || obj.y + obj.radius > this.canvas.height) {
        obj.vy *= -1
        obj.y = Math.max(obj.radius, Math.min(this.canvas.height - obj.radius, obj.y))
      }
    })

    // Check collisions for level 2
    if (this.level === 'level2') {
      this.checkCollisions()
    }
  }

  private updateSquarePattern(obj: GameObject) {
    // Simple square pattern logic
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2
    const size = 200

    if (obj.vx > 0 && obj.x > centerX + size) {
      obj.vx = 0
      obj.vy = 3
    } else if (obj.vy > 0 && obj.y > centerY + size) {
      obj.vx = -3
      obj.vy = 0
    } else if (obj.vx < 0 && obj.x < centerX - size) {
      obj.vx = 0
      obj.vy = -3
    } else if (obj.vy < 0 && obj.y < centerY - size) {
      obj.vx = 3
      obj.vy = 0
    }
  }

  private checkCollisions() {
    for (let i = 0; i < this.objects.length; i++) {
      for (let j = i + 1; j < this.objects.length; j++) {
        const obj1 = this.objects[i]
        const obj2 = this.objects[j]
        const dx = obj2.x - obj1.x
        const dy = obj2.y - obj1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < obj1.radius + obj2.radius) {
          // Collision detected
          this.sessionData.events.push({
            type: 'collision',
            timestamp: Date.now(),
            data: { obj1: obj1.id, obj2: obj2.id }
          })

          // Simple collision response
          const angle = Math.atan2(dy, dx)
          const sin = Math.sin(angle)
          const cos = Math.cos(angle)

          const vx1 = obj1.vx * cos + obj1.vy * sin
          const vy1 = obj1.vy * cos - obj1.vx * sin
          const vx2 = obj2.vx * cos + obj2.vy * sin
          const vy2 = obj2.vy * cos - obj2.vx * sin

          obj1.vx = vx2 * cos - vy1 * sin
          obj1.vy = vy1 * cos + vx2 * sin
          obj2.vx = vx1 * cos - vy2 * sin
          obj2.vy = vy2 * cos + vx1 * sin
        }
      }
    }
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#000'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw objects
    this.objects.forEach(obj => {
      // Highlight object if being tracked
      if (this.isTracking) {
        this.ctx.beginPath()
        this.ctx.arc(obj.x, obj.y, obj.radius + 10, 0, Math.PI * 2)
        this.ctx.strokeStyle = 'rgba(102, 234, 126, 0.6)'
        this.ctx.lineWidth = 4
        this.ctx.stroke()
      }

      this.ctx.beginPath()
      this.ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2)
      this.ctx.fillStyle = obj.color
      this.ctx.fill()
      
      // Add glow effect
      this.ctx.shadowBlur = this.isTracking ? 30 : 20
      this.ctx.shadowColor = this.isTracking ? '#66ea7e' : obj.color
      this.ctx.fill()
      this.ctx.shadowBlur = 0

      // Draw tracking zone (subtle)
      if (this.level === 'level1') {
        this.ctx.beginPath()
        this.ctx.arc(obj.x, obj.y, obj.radius * 3, 0, Math.PI * 2)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        this.ctx.lineWidth = 1
        this.ctx.stroke()
      }
    })

    // Draw gaze indicator (small dot where user is looking)
    if (this.currentGaze) {
      this.ctx.beginPath()
      this.ctx.arc(this.currentGaze.x, this.currentGaze.y, 8, 0, Math.PI * 2)
      this.ctx.fillStyle = this.isTracking ? 'rgba(102, 234, 126, 0.8)' : 'rgba(255, 255, 255, 0.5)'
      this.ctx.fill()
      
      // Add ring around gaze point
      this.ctx.beginPath()
      this.ctx.arc(this.currentGaze.x, this.currentGaze.y, 15, 0, Math.PI * 2)
      this.ctx.strokeStyle = this.isTracking ? 'rgba(102, 234, 126, 0.6)' : 'rgba(255, 255, 255, 0.3)'
      this.ctx.lineWidth = 2
      this.ctx.stroke()
    }
  }

  recordGazeData(gazeData: GazeData) {
    // Update current gaze position for rendering
    this.currentGaze = { x: gazeData.gazeX, y: gazeData.gazeY }

    // Find closest object to gaze
    let closestObj: GameObject | null = null
    let minDistance = Infinity

    this.objects.forEach(obj => {
      const dx = obj.x - gazeData.gazeX
      const dy = obj.y - gazeData.gazeY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < minDistance) {
        minDistance = distance
        closestObj = obj
      }
    })

    // More generous threshold: 3x radius instead of 2x
    // This accounts for eye-tracking inaccuracy
    let isOnTarget = false
    let targetId: string | null = null
    let targetX = 0
    let targetY = 0

    if (closestObj) {
      const obj = closestObj as GameObject
      const threshold = obj.radius * 3
      isOnTarget = minDistance < threshold
      targetId = isOnTarget ? obj.id : null
      targetX = obj.x
      targetY = obj.y
    }

    // Update tracking status
    this.isTracking = isOnTarget
    this.totalFrames++
    if (isOnTarget) {
      this.trackingScore++
    }

    this.sessionData.gazeData.push({
      ...gazeData,
      objectId: targetId,
      objectX: targetX,
      objectY: targetY
    })
  }

  getTrackingAccuracy(): number {
    return this.totalFrames > 0 ? Math.round((this.trackingScore / this.totalFrames) * 100) : 0
  }

  getSessionData(): SessionData {
    return this.sessionData
  }
}
