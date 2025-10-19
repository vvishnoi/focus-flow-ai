# Implementation Plan

- [x] 1. Create session history management system
  - Implement SessionHistoryManager class with localStorage persistence
  - Add methods to save, retrieve, and manage session history (max 50 entries)
  - Implement personal best tracking per level
  - Add data migration support for future schema changes
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Build performance analysis engine
  - Create PerformanceAnalyzer class to evaluate session data
  - Implement performance level determination based on accuracy thresholds (excellent >80%, good 60-80%, moderate 40-60%, needs improvement <40%)
  - Add comparison logic to calculate changes from previous sessions
  - Implement feedback message generation based on performance level
  - Add strength identification and improvement suggestion logic
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2_

- [x] 3. Create reusable metric card components
  - [x] 3.1 Build base MetricCard component with props for value, label, description, and performance level
    - Add color-coded visual indicators (green, yellow, orange, red)
    - Implement icon support for different metric types
    - Add hover effects and transitions
    - _Requirements: 1.1, 4.1, 4.2, 4.3_

  - [x] 3.2 Create ComparisonIndicator component
    - Display percentage change from previous session
    - Show trend arrows (up/down/stable)
    - Add color coding for improvement/decline
    - _Requirements: 3.1, 3.2_

  - [x] 3.3 Build PerformanceBadge component
    - Display performance level with appropriate styling
    - Add "Personal Best" badge variant with trophy icon
    - Implement "First Session" badge variant
    - _Requirements: 3.3, 3.4_

- [x] 4. Implement level-specific metrics display
  - [x] 4.1 Create LevelMetricsCard component for Level 1 (Follow the Leader)
    - Display objects followed count with target (e.g., "15/20")
    - Show average follow time in seconds
    - Add explanatory text for each metric
    - _Requirements: 6.1, 6.4, 6.5_

  - [x] 4.2 Create LevelMetricsCard component for Level 2 (Collision Course)
    - Display collisions avoided count
    - Show total collisions with visual indicator
    - Calculate and display avoidance rate percentage
    - _Requirements: 6.2, 6.4, 6.5_

  - [x] 4.3 Create LevelMetricsCard component for Level 3 (Find the Pattern)
    - Display patterns identified count with target
    - Show distractors ignored count
    - Add pattern recognition accuracy metric
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 5. Build insights and feedback section
  - Create InsightsSection component to display personalized feedback
  - Implement dynamic feedback messages based on performance level
  - Add strengths list with bullet points
  - Add improvement suggestions with actionable tips
  - Include contextual messages for early session completion
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6. Implement progress tracking display
  - Create ProgressSection component (conditionally rendered)
  - Display comparison with previous session (percentage change)
  - Show personal best indicator when achieved
  - Add "First Session" message for new users
  - Implement graceful handling when no history exists
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Enhance primary metrics display
  - [x] 7.1 Update tracking accuracy display with visual indicators
    - Add color-coded gradient based on performance level
    - Include comparison with previous session if available
    - Add descriptive text explaining what tracking accuracy means
    - _Requirements: 1.1, 1.5_

  - [x] 7.2 Enhance duration display
    - Show session duration with comparison to target (5 minutes)
    - Add progress bar or visual indicator
    - Include context about target duration
    - _Requirements: 1.3, 1.5_

  - [x] 7.3 Improve data quality display
    - Show total gaze points collected
    - Add quality indicator based on data density
    - Include explanatory text about data collection
    - _Requirements: 1.4, 1.5_

- [x] 8. Build action buttons section
  - [x] 8.1 Create ActionsSection component with multiple action buttons
    - Implement "Play Again" button (primary action)
    - Add "Try Different Level" button
    - Add "Back to Home" button
    - Style primary action prominently
    - _Requirements: 5.1_

  - [x] 8.2 Implement dynamic action recommendations
    - Suggest harder level when performance is excellent (>80%)
    - Suggest retry or easier level when performance is low (<60%)
    - Add level selection logic based on current level
    - _Requirements: 5.2, 5.3_

  - [x] 8.3 Add AI analysis status indicator
    - Display message about pending AI analysis
    - Show estimated time for analysis completion (~30 seconds)
    - Add visual indicator (spinner or progress)
    - _Requirements: 5.4_

- [x] 9. Implement animations and transitions
  - Add staggered slide-in animations for metric cards
  - Implement number counter animation for metrics
  - Add pulse animation for badges and achievements
  - Implement smooth fade-in for the entire scorecard
  - Add hover effects and micro-interactions
  - Respect prefers-reduced-motion for accessibility
  - _Requirements: 4.4_

- [x] 10. Update SessionSummary component integration
  - Integrate SessionHistoryManager to load previous session data
  - Integrate PerformanceAnalyzer to generate insights
  - Update component to use new metric card components
  - Add level-specific metrics section
  - Add insights and progress sections
  - Update actions section with new buttons and recommendations
  - Implement error boundary for graceful error handling
  - Save current session to history after display
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Implement responsive design
  - Add responsive grid layouts for different screen sizes
  - Implement mobile-optimized metric cards (single column)
  - Add tablet layout (2 columns)
  - Ensure desktop layout (3 columns) works well
  - Test touch interactions on mobile devices
  - Adjust font sizes and spacing for different viewports
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 12. Add accessibility features
  - Add proper ARIA labels to all interactive elements
  - Ensure semantic HTML structure throughout
  - Implement keyboard navigation support
  - Add focus indicators for keyboard users
  - Ensure color contrast meets WCAG AA standards
  - Add screen reader announcements for dynamic content
  - Test with screen readers (VoiceOver, NVDA)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 13. Update GameCanvas component integration
  - Update GameCanvas to pass additional props to SessionSummary
  - Implement onPlayAgain callback to restart same level
  - Implement onTryDifferentLevel callback to navigate to level selection
  - Ensure proper cleanup and state reset between sessions
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 14. Create utility functions and constants
  - Create constants file for performance thresholds
  - Create constants file for level targets
  - Add utility functions for metric calculations
  - Add utility functions for formatting (time, percentages)
  - Create helper functions for color determination based on performance
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 6.1, 6.2, 6.3, 6.4_

- [x] 15. Implement error handling and edge cases
  - Add error boundary component for scorecard
  - Handle missing or incomplete session data gracefully
  - Handle localStorage unavailability (private browsing)
  - Add fallback UI for when history is unavailable
  - Handle invalid metric values (NaN, Infinity)
  - Add logging for debugging without breaking UI
  - _Requirements: 3.5_

- [ ]* 16. Write component tests
  - Write unit tests for SessionHistoryManager
  - Write unit tests for PerformanceAnalyzer
  - Write unit tests for metric calculation utilities
  - Write component tests for MetricCard
  - Write component tests for LevelMetricsCard variants
  - Write component tests for InsightsSection
  - Write component tests for ProgressSection
  - Write integration test for complete SessionSummary flow
  - Test edge cases (first session, perfect score, zero score)
  - _Requirements: All_

- [ ]* 17. Perform visual testing and refinement
  - Test scorecard with various performance levels
  - Test with first session (no history)
  - Test with improved performance scenario
  - Test with declined performance scenario
  - Test personal best achievement scenario
  - Test on different screen sizes (mobile, tablet, desktop)
  - Verify animations work smoothly
  - Check color contrast and readability
  - Test with reduced motion preference
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
