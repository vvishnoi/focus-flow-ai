# Implementation Plan

This plan focuses on implementing the missing enhancements to the existing profile management system. The core infrastructure (modal UI, backend API, DynamoDB) is already in place.

## Tasks

- [x] 1. Implement Sequential Profile ID Generation (FOC-XXX Format)
  - Update `backend/functions/create-profile/index.js` to query existing profiles count and generate sequential IDs
  - Add QueryCommand import to Lambda function
  - Implement logic to count existing profiles for therapist and increment
  - Format profile ID as `FOC-${number.toString().padStart(3, '0')}`
  - Test profile ID generation with multiple profiles
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Implement Game Access Restriction
  - [x] 2.1 Create game access control component
    - Update `frontend/app/game/[level]/page.tsx` to check for active profile on mount
    - Add useEffect hook to check `getActiveProfileSync()` on component load
    - Add state management for profile check and loading states
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Build "Profile Required" screen UI
    - Create UI component for profile requirement message
    - Add "Select Profile" button that opens ProfileModal
    - Add "Back to Home" button for navigation
    - Style the screen with professional design matching existing UI
    - Create `frontend/app/game/[level]/game.module.css` for styles
    - _Requirements: 3.2, 3.3, 3.4_

  - [x] 2.3 Add game header with profile display
    - Create game header component showing active profile info
    - Display profile name and age in header during gameplay
    - Add "Back to Home" button in header
    - Style header with glassmorphism effect matching navbar
    - _Requirements: 3.5, 3.6, 3.7_

- [x] 3. Enhance Session Data Capture
  - [x] 3.1 Update SessionData interface
    - Modify `frontend/lib/api.ts` to include new session data fields
    - Add profileId, profileWeight, profileHeight fields
    - Add sessionDuration, datePlayed fields
    - Add metrics object with accuracy and level-specific data
    - _Requirements: 4.1, 4.3, 4.4, 4.6_

  - [x] 3.2 Implement session metrics calculation
    - Add `calculateLevelMetrics()` function in `frontend/components/GameCanvas.tsx`
    - Calculate totalGazePoints, accurateGazes, accuracyPercentage
    - Implement Level 1 metrics: objectsFollowed, averageFollowTime
    - Implement Level 2 metrics: collisionsAvoided, totalCollisions
    - Implement Level 3 metrics: patternsIdentified, distractorsIgnored
    - _Requirements: 4.6, 4.7, 4.8, 4.9_

  - [x] 3.3 Integrate profile data into session submission
    - Update `handleEndSession()` in GameCanvas to include profile data
    - Add profile fields (ID, name, age, gender, weight, height) to session payload
    - Calculate and add sessionDuration (endTime - startTime)
    - Add datePlayed in ISO format
    - Include calculated metrics in submission
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.10_

  - [x] 3.4 Update backend data-ingestor Lambda
    - Modify `backend/functions/data-ingestor/index.js` to accept new fields
    - Update request body parsing to include profile and metrics fields
    - Store enhanced session data in S3
    - Update DynamoDB user record with new fields (lastLevel, lastSessionDuration, lastAccuracy)
    - Add conditional logic for optional fields (weight, height)
    - _Requirements: 4.11, 4.12_

- [x] 4. Verify and Test Implementation
  - [x] 4.1 Test sequential profile ID generation
    - Create 3 profiles and verify IDs are FOC-001, FOC-002, FOC-003
    - Test with different therapist IDs to ensure scoping works
    - Verify ID format is consistent
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 4.2 Test game access restriction
    - Clear active profile and navigate to game page
    - Verify "Profile Required" screen appears
    - Test "Select Profile" button opens modal
    - Select profile and verify game loads
    - Verify profile displays in game header
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [x] 4.3 Test enhanced session data
    - Play a game session with active profile
    - End session and verify data submission
    - Check browser network tab for complete payload
    - Verify S3 contains enhanced session data
    - Verify DynamoDB user record updated with metrics
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.10, 4.11, 4.12_

  - [x]* 4.4 Test error scenarios
    - Test game access without profile
    - Test session submission with missing profile data
    - Test backend with invalid profile ID format
    - Verify error messages are user-friendly
    - _Requirements: 3.2, 4.10_

- [x] 5. Update Documentation
  - [x] 5.1 Create implementation summary document
    - Document the FOC-XXX ID format and generation logic
    - Document game access restriction flow
    - Document enhanced session data structure
    - Include examples of session data payloads
    - _Requirements: All_

  - [x] 5.2 Update testing documentation
    - Add test cases for new features
    - Document manual testing steps
    - Include API testing commands for new fields
    - _Requirements: All_

## Notes

- All tasks build on existing infrastructure (modal UI, backend API, DynamoDB tables)
- No new AWS resources needed - only Lambda function updates
- Frontend changes are isolated to game pages and GameCanvas component
- Backend changes are minimal - mainly adding fields to existing data structures
- Testing should verify both new features and existing functionality still works

## Success Criteria

- Profile IDs follow FOC-001, FOC-002, FOC-003 format
- Game cannot be accessed without selecting a profile
- All game sessions include complete profile data
- Session data includes calculated metrics (accuracy, level-specific)
- Enhanced data is stored in S3 and DynamoDB
- All existing features continue to work (profile CRUD, search, navbar)
