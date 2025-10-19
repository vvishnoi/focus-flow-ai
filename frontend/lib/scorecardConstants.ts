// Constants for scorecard enhancements

export const PERFORMANCE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  moderate: 40,
  needsImprovement: 0
} as const

export const TARGET_DURATION = 300 // 5 minutes in seconds

export const LEVEL_TARGETS = {
  level1: {
    objectsFollowed: 20,
    minFollowTime: 2000, // ms
    description: 'Follow the Leader'
  },
  level2: {
    avoidanceRate: 80, // percentage
    maxCollisions: 5,
    description: 'Collision Course'
  },
  level3: {
    patternsIdentified: 15,
    minAccuracy: 75,
    description: 'Find the Pattern'
  }
} as const

export const PERFORMANCE_COLORS = {
  excellent: '#10b981',
  good: '#f59e0b',
  moderate: '#f97316',
  needsImprovement: '#ef4444'
} as const

export const PERFORMANCE_MESSAGES = {
  excellent: {
    full: "Excellent tracking! Your focus was strong throughout the entire session.",
    partial: "Excellent tracking! Try completing the full 5-minute session to maximize your training."
  },
  good: {
    full: "Good effort! You maintained solid focus. Keep practicing to reach excellence.",
    partial: "Good effort! Try to maintain focus on the targets for longer periods."
  },
  moderate: {
    default: "You're making progress! Focus on keeping your eyes on the targets for longer stretches."
  },
  needsImprovement: {
    default: "Keep practicing! Make sure you're in a well-lit area and positioned comfortably in front of the camera."
  }
} as const

export const DATA_QUALITY_THRESHOLDS = {
  high: 1000,
  medium: 500,
  low: 0
} as const
