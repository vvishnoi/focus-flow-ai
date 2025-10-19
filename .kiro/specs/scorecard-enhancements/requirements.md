# Requirements Document

## Introduction

The current session summary (scorecard) displayed after completing an eye-tracking game session provides only basic metrics (duration, tracking accuracy, data points) without meaningful context or actionable insights. Users need a more informative and engaging scorecard that helps them understand their performance, track progress over time, and receive personalized feedback. This enhancement will transform the scorecard from a simple data display into an insightful performance dashboard that motivates users and provides clear value from their training sessions.

## Requirements

### Requirement 1: Enhanced Performance Metrics Display

**User Story:** As a user completing a training session, I want to see detailed performance metrics with context and visual indicators, so that I can understand how well I performed and what the metrics mean.

#### Acceptance Criteria

1. WHEN the session ends THEN the system SHALL display tracking accuracy with a visual indicator (color-coded: green for >80%, yellow for 60-80%, red for <60%)
2. WHEN the session ends THEN the system SHALL display level-specific metrics relevant to the game type (e.g., objects followed for Level 1, collisions avoided for Level 2, patterns identified for Level 3)
3. WHEN the session ends THEN the system SHALL display session duration with a comparison to the target duration (5 minutes)
4. WHEN the session ends THEN the system SHALL show total gaze data points collected with a quality indicator
5. WHEN metrics are displayed THEN the system SHALL include brief explanatory text for each metric to provide context

### Requirement 2: Performance Feedback and Insights

**User Story:** As a user reviewing my session results, I want to receive personalized feedback and insights about my performance, so that I understand what I did well and where I can improve.

#### Acceptance Criteria

1. WHEN tracking accuracy is above 80% THEN the system SHALL display encouraging feedback (e.g., "Excellent tracking! Your focus was strong throughout the session.")
2. WHEN tracking accuracy is between 60-80% THEN the system SHALL display constructive feedback (e.g., "Good effort! Try to maintain focus on the targets for longer periods.")
3. WHEN tracking accuracy is below 60% THEN the system SHALL display supportive feedback with tips (e.g., "Keep practicing! Make sure you're in a well-lit area and positioned comfortably.")
4. WHEN level-specific metrics are available THEN the system SHALL provide insights based on those metrics (e.g., "You successfully followed 15 objects - that's great sustained attention!")
5. WHEN the session duration is less than the target THEN the system SHALL acknowledge early completion and suggest trying for the full duration

### Requirement 3: Progress Tracking and Comparison

**User Story:** As a user who has completed multiple sessions, I want to see how my current performance compares to my previous sessions, so that I can track my improvement over time.

#### Acceptance Criteria

1. WHEN a user has completed previous sessions THEN the system SHALL display a comparison indicator showing if performance improved, stayed the same, or decreased
2. WHEN displaying comparison data THEN the system SHALL show the percentage change from the previous session (e.g., "+5% from last session")
3. WHEN a user achieves a personal best THEN the system SHALL display a special indicator or badge (e.g., "🏆 New Personal Best!")
4. WHEN a user completes their first session THEN the system SHALL display a welcome message establishing a baseline (e.g., "First session complete! This is your baseline for future comparisons.")
5. IF comparison data is unavailable THEN the system SHALL gracefully handle the absence without errors

### Requirement 4: Visual Enhancements and User Experience

**User Story:** As a user viewing my session results, I want an engaging and visually appealing scorecard with clear information hierarchy, so that I can quickly understand my performance at a glance.

#### Acceptance Criteria

1. WHEN the scorecard is displayed THEN the system SHALL use a card-based layout with clear visual hierarchy
2. WHEN displaying metrics THEN the system SHALL use icons and visual indicators to make information scannable
3. WHEN showing performance levels THEN the system SHALL use color coding consistently (green for good, yellow for moderate, red for needs improvement)
4. WHEN the scorecard appears THEN the system SHALL use smooth animations to reveal metrics progressively
5. WHEN displaying multiple metrics THEN the system SHALL organize them into logical sections (Performance, Level Details, Progress)

### Requirement 5: Actionable Next Steps

**User Story:** As a user completing a session, I want clear guidance on what to do next, so that I can continue my training journey effectively.

#### Acceptance Criteria

1. WHEN the scorecard is displayed THEN the system SHALL provide action buttons for "Play Again", "Try Different Level", and "Back to Home"
2. WHEN a user performs well (>80% accuracy) THEN the system SHALL suggest trying a more challenging level
3. WHEN a user struggles (<60% accuracy) THEN the system SHALL suggest retrying the same level or trying an easier one
4. WHEN AI analysis is pending THEN the system SHALL display a message indicating analysis will be available soon with an estimated time
5. WHEN action buttons are displayed THEN the system SHALL make the primary action (Play Again) visually prominent

### Requirement 6: Level-Specific Performance Details

**User Story:** As a user who completed a specific game level, I want to see performance details relevant to that level's objectives, so that I understand how well I achieved the level's goals.

#### Acceptance Criteria

1. WHEN completing Level 1 (Follow the Leader) THEN the system SHALL display objects followed count and average follow duration
2. WHEN completing Level 2 (Collision Course) THEN the system SHALL display collisions avoided count and total collisions
3. WHEN completing Level 3 (Find the Pattern) THEN the system SHALL display patterns identified count and distractors ignored
4. WHEN level-specific metrics are displayed THEN the system SHALL include target goals for context (e.g., "15/20 objects followed")
5. WHEN displaying level details THEN the system SHALL provide brief explanations of what each metric represents
