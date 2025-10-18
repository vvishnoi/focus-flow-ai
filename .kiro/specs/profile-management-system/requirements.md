# Requirements Document

## Introduction

The Profile Management & Session Tracking System enables therapists to create and manage patient profiles with sequential IDs (FOC-001, FOC-002, etc.), enforce profile selection before gameplay, and capture comprehensive session data for AI-powered analysis. This system ensures every game session is tied to a specific patient profile, providing rich longitudinal data for tracking progress and generating personalized insights.

## Requirements

### Requirement 1: Sequential Profile ID Generation

**User Story:** As a therapist, I want each patient profile to have a unique sequential ID (FOC-001, FOC-002, etc.), so that I can easily reference and organize patient records professionally.

#### Acceptance Criteria

1. WHEN a therapist creates a new profile THEN the system SHALL generate a profile ID in the format "FOC-XXX" where XXX is a zero-padded 3-digit sequential number
2. WHEN determining the next profile number THEN the system SHALL query existing profiles for that therapist AND increment the count by 1
3. WHEN the first profile is created for a therapist THEN the system SHALL assign profile ID "FOC-001"
4. WHEN multiple profiles exist THEN the system SHALL maintain sequential numbering (FOC-001, FOC-002, FOC-003, etc.)
5. WHEN a profile is created THEN the profile ID SHALL be stored in DynamoDB and associated with the therapist ID

### Requirement 2: Profile Management Interface

**User Story:** As a therapist, I want a professional modal-based interface to create, view, search, and manage patient profiles, so that I can efficiently handle multiple patients.

#### Acceptance Criteria

1. WHEN a therapist clicks "Select Profile" THEN the system SHALL display a modal with all existing profiles
2. WHEN viewing profiles THEN the system SHALL display profile ID, name, age, and gender for each profile
3. WHEN a therapist types in the search box THEN the system SHALL filter profiles by name or profile ID in real-time
4. WHEN a therapist clicks "Create New Profile" THEN the system SHALL show a form with fields for name, age, gender, weight, and height
5. WHEN creating a profile THEN the system SHALL validate that name and age are required fields
6. WHEN a profile is successfully created THEN the system SHALL add it to the backend via API call
7. WHEN a therapist selects a profile THEN the system SHALL set it as the active profile and close the modal
8. WHEN a therapist clicks the profile avatar in the navbar THEN the system SHALL open the profile selection modal

### Requirement 3: Game Access Restriction

**User Story:** As a therapist, I want the system to require profile selection before allowing gameplay, so that every game session is properly tracked and associated with a patient.

#### Acceptance Criteria

1. WHEN a user navigates to a game level page THEN the system SHALL check for an active profile
2. WHEN no active profile exists THEN the system SHALL display a "Profile Required" screen with options to select a profile or return home
3. WHEN the "Profile Required" screen is displayed THEN the system SHALL prevent access to the game canvas
4. WHEN a user clicks "Select Profile" on the required screen THEN the system SHALL open the profile selection modal
5. WHEN a profile is selected THEN the system SHALL load the game and display the profile information in the game header
6. WHEN a game is active THEN the system SHALL display the active profile name and age in the game header
7. WHEN a user clicks "Back to Home" from the game THEN the system SHALL navigate to the home page

### Requirement 4: Enhanced Session Data Capture

**User Story:** As a therapist, I want comprehensive session data captured during gameplay including profile details, timing, accuracy metrics, and level-specific performance, so that I can track patient progress and receive AI-powered insights.

#### Acceptance Criteria

1. WHEN a game session starts THEN the system SHALL capture the profile ID, name, age, gender, weight, and height
2. WHEN a game session starts THEN the system SHALL record the start timestamp
3. WHEN a game session ends THEN the system SHALL record the end timestamp AND calculate session duration
4. WHEN a game session ends THEN the system SHALL capture the date played in ISO format
5. WHEN gaze data is collected THEN the system SHALL record timestamp, gaze coordinates (x, y), object ID, and object coordinates for each data point
6. WHEN calculating metrics THEN the system SHALL compute total gaze points, accurate gazes, and accuracy percentage
7. WHEN a session is for Level 1 (Follow the Leader) THEN the system SHALL capture objects followed count and average follow time
8. WHEN a session is for Level 2 (Collision Course) THEN the system SHALL capture collisions avoided and total collisions
9. WHEN a session is for Level 3 (Pattern Recognition) THEN the system SHALL capture patterns identified and distractors ignored
10. WHEN a session ends THEN the system SHALL submit all captured data to the backend API
11. WHEN session data is submitted THEN the system SHALL store it in S3 with the complete data structure
12. WHEN session data is submitted THEN the system SHALL update the user record in DynamoDB with last session details and metrics

### Requirement 5: Profile Persistence and Synchronization

**User Story:** As a therapist, I want profiles stored in a backend database accessible across devices, so that I can access patient information from any location.

#### Acceptance Criteria

1. WHEN a profile is created THEN the system SHALL store it in DynamoDB with therapist ID as partition key
2. WHEN the profile modal opens THEN the system SHALL fetch all profiles from the backend API
3. WHEN profiles are fetched THEN the system SHALL display them in the modal interface
4. WHEN a profile is selected THEN the system SHALL store the active profile ID in localStorage for session persistence
5. WHEN the page loads THEN the system SHALL retrieve the active profile from localStorage if available
6. WHEN a profile is deleted THEN the system SHALL remove it from DynamoDB via API call
7. WHEN a profile is deleted THEN the system SHALL update the UI to reflect the deletion

### Requirement 6: Clear Profile Functionality

**User Story:** As a therapist, I want to clear the active profile with a confirmation dialog, so that I can safely switch between patients or end a session.

#### Acceptance Criteria

1. WHEN a therapist clicks "Clear Profile" in the navbar THEN the system SHALL display a confirmation dialog
2. WHEN the confirmation dialog is shown THEN the system SHALL display the current profile name and ask for confirmation
3. WHEN a therapist confirms clearing THEN the system SHALL remove the active profile from localStorage
4. WHEN a therapist confirms clearing THEN the system SHALL update the navbar to show "No Profile Selected"
5. WHEN a therapist cancels clearing THEN the system SHALL close the dialog and maintain the active profile
6. WHEN no profile is active THEN the "Clear Profile" option SHALL be disabled or hidden

### Requirement 7: Professional UI/UX Design

**User Story:** As a therapist, I want a modern, professional interface with smooth animations and clear visual hierarchy, so that the application feels polished and easy to use.

#### Acceptance Criteria

1. WHEN viewing the navbar THEN the system SHALL display a gradient background with glassmorphism effect
2. WHEN viewing the profile modal THEN the system SHALL display it with a backdrop blur and smooth fade-in animation
3. WHEN hovering over interactive elements THEN the system SHALL provide visual feedback with transitions
4. WHEN viewing profile cards THEN the system SHALL display them with consistent spacing, borders, and hover effects
5. WHEN viewing forms THEN the system SHALL use consistent input styling with focus states
6. WHEN viewing buttons THEN the system SHALL use gradient backgrounds for primary actions and neutral colors for secondary actions
7. WHEN viewing on mobile devices THEN the system SHALL adapt the layout with responsive design
8. WHEN the profile avatar is displayed THEN the system SHALL show initials in a circular gradient background

## Success Metrics

- All profiles have sequential FOC-XXX IDs
- 100% of game sessions are associated with a profile
- Session data includes comprehensive metrics for AI analysis
- Profile management operations complete within 2 seconds
- UI is responsive across desktop and mobile devices
- Zero anonymous or untracked game sessions
