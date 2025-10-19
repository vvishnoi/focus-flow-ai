# Implementation Plan

This plan implements evidence-based eye-gazing enhancements and AWS Bedrock Knowledge Base integration for FocusFlow AI.

## Tasks

- [x] 1. Set Up AWS Bedrock Knowledge Base Infrastructure
  - [x] 1.1 Create S3 bucket for research documents
    - Create S3 bucket `focusflow-research-{env}` with versioning enabled
    - Configure bucket policies for Bedrock access
    - Create folder structure: `papers/`, `extracted/`, `metadata/`
    - _Requirements: 2.1, 6.1_

  - [x] 1.2 Create OpenSearch Serverless collection
    - Create OpenSearch Serverless collection for vector storage
    - Configure network and encryption settings
    - Set up index for document embeddings
    - _Requirements: 2.2_

  - [x] 1.3 Create Bedrock Knowledge Base
    - Create Knowledge Base in AWS Bedrock
    - Connect to S3 data source
    - Configure OpenSearch Serverless as vector store
    - Set embedding model (amazon.titan-embed-text-v1)
    - Create IAM roles and policies
    - _Requirements: 2.2, 2.3_

  - [x] 1.4 Upload and process initial research documents
    - Download research papers from provided URLs
    - Extract text from PDFs using textract or similar
    - Upload PDFs to S3 `papers/` folder
    - Upload extracted text to S3 `extracted/` folder
    - Create metadata JSON file
    - Trigger Knowledge Base sync
    - _Requirements: 2.1, 6.1, 6.2_

- [ ] 2. Create Bedrock Agent with Knowledge Base
  - [ ] 2.1 Create Bedrock Agent
    - Create agent in AWS Bedrock console
    - Select foundation model (Claude 3 Sonnet)
    - Configure agent instructions with research focus
    - Set up agent IAM role
    - _Requirements: 2.3, 5.1, 7.1_

  - [ ] 2.2 Connect Knowledge Base to Agent
    - Associate Knowledge Base with Agent
    - Configure retrieval settings (max results, confidence threshold)
    - Test knowledge base queries from agent
    - _Requirements: 2.3, 5.1, 7.2_

  - [ ] 2.3 Create Lambda for agent invocation
    - Create `invoke-bedrock-agent` Lambda function
    - Implement agent invocation logic
    - Handle streaming responses
    - Parse citations from agent responses
    - Add error handling and retries
    - _Requirements: 5.1, 5.2, 7.3_

  - [ ] 2.4 Test agent with sample queries
    - Test agent with eye-tracking analysis queries
    - Verify citations are returned
    - Check response quality and relevance
    - Validate knowledge base retrieval
    - _Requirements: 5.1, 5.2, 5.3, 7.4_

- [ ] 3. Implement Enhanced Clinical Metrics Calculation
  - [ ] 3.1 Create clinical metrics calculation module
    - Create `frontend/lib/clinicalMetrics.ts` module
    - Implement fixation metrics calculation (duration, rate, count)
    - Implement saccade metrics calculation (velocity, amplitude, accuracy)
    - Implement attention distribution calculation (target vs distractor time)
    - Add cognitive load metrics (pupil size, blink rate) if available
    - _Requirements: 1.1, 1.2, 3.1, 3.2_

  - [ ] 3.2 Add benchmark comparison logic
    - Create age-based benchmark data from research
    - Implement percentile calculation
    - Add status determination (typical/borderline/concern)
    - Create interpretation logic
    - _Requirements: 1.3, 3.3, 5.4_

  - [ ] 3.3 Update GameCanvas to capture enhanced metrics
    - Modify `GameCanvas.tsx` to track fixations
    - Add saccade detection and measurement
    - Calculate attention distribution in real-time
    - Store enhanced metrics in session data
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3_

  - [ ] 3.4 Update session data interface
    - Extend SessionData interface with clinical metrics
    - Add fixationMetrics, saccadeMetrics, attentionDistribution
    - Add benchmarkComparison fields
    - Update TypeScript types
    - _Requirements: 1.1, 1.5_

- [ ] 4. Create Enhanced AI Analysis Lambda
  - [ ] 4.1 Create enhanced-analysis Lambda function
    - Create new Lambda `enhanced-analysis` function
    - Implement clinical metrics calculation on backend
    - Add Knowledge Base query logic
    - Integrate Bedrock Agent invocation
    - Parse and structure agent responses
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ] 4.2 Implement research context retrieval
    - Query Knowledge Base for relevant research
    - Filter by age group, metrics, and topics
    - Extract relevant passages
    - Format citations properly
    - _Requirements: 2.3, 5.2, 5.6_

  - [ ] 4.3 Generate comprehensive reports with citations
    - Structure report with clinical metrics
    - Include AI insights from agent
    - Add research citations
    - Include benchmark comparisons
    - Add recommendations with evidence basis
    - _Requirements: 2.4, 5.2, 5.3, 5.5_

  - [ ] 4.4 Store enhanced reports
    - Store reports in DynamoDB with citations
    - Store full report JSON in S3
    - Update user record with latest metrics
    - Add citation tracking
    - _Requirements: 2.4, 5.2_

- [ ] 5. Build Clinical Metrics Dashboard
  - [ ] 5.1 Create dashboard page component
    - Create `frontend/app/metrics/[profileId]/page.tsx`
    - Add date range selector
    - Implement data fetching from API
    - Add loading and error states
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 5.2 Implement fixation analysis charts
    - Create fixation duration over time line chart
    - Add fixation distribution bar chart
    - Show benchmark comparison overlay
    - Add research citation tooltips
    - _Requirements: 3.1, 3.5_

  - [ ] 5.3 Implement saccade performance visualization
    - Create saccade velocity vs accuracy scatter plot
    - Add saccade metrics trend chart
    - Show typical development range
    - _Requirements: 3.2, 3.5_

  - [ ] 5.4 Implement attention distribution visualization
    - Create attention distribution pie chart
    - Add gaze heatmap visualization
    - Show target vs distractor time
    - Add social vs non-social preference (if applicable)
    - _Requirements: 3.3, 3.5_

  - [ ] 5.5 Add AI insights panel
    - Display AI-generated summary
    - Show key findings with citations
    - List recommendations with research basis
    - Add "View Research" links
    - _Requirements: 3.5, 5.2, 5.3_

  - [ ] 5.6 Implement progress tracking view
    - Create progress over time charts
    - Show trend analysis (improving/stable/declining)
    - Add milestone markers
    - Display evidence-based goals
    - _Requirements: 3.4, 3.6_

- [ ] 6. Enhance Existing Game Levels with Research-Based Metrics
  - [ ] 6.1 Update Level 1 (Follow the Leader)
    - Add sustained attention measurement
    - Track predictive gaze movements
    - Measure smooth pursuit quality
    - Add adaptive difficulty based on performance
    - _Requirements: 1.1, 4.1_

  - [ ] 6.2 Update Level 2 (Collision Course)
    - Add divided attention metrics
    - Track inhibitory control
    - Measure distractor resistance
    - Add cognitive load indicators
    - _Requirements: 1.1, 4.2_

  - [ ] 6.3 Update Level 3 (Pattern Recognition)
    - Add cognitive flexibility metrics
    - Track visual search efficiency
    - Measure pattern detection speed
    - Add working memory indicators
    - _Requirements: 1.1, 4.3_

- [ ] 7. Implement New Level 4: Social Attention Training
  - [ ] 7.1 Design Level 4 game mechanics
    - Design face detection exercise
    - Design eye contact practice exercise
    - Design emotion recognition exercise
    - Design gaze following exercise
    - Create visual assets (faces, expressions)
    - _Requirements: 4.4, 4.5_

  - [ ] 7.2 Implement face tracking functionality
    - Add face detection to eye tracker
    - Track fixations on face regions (eyes, mouth, etc.)
    - Measure face preference vs objects
    - Calculate social attention metrics
    - _Requirements: 4.4_

  - [ ] 7.3 Build Level 4 game component
    - Create `Level4SocialAttention` component
    - Implement exercise progression
    - Add real-time feedback
    - Track social attention metrics
    - _Requirements: 4.4, 4.5_

  - [ ] 7.4 Integrate Level 4 into game flow
    - Add Level 4 to home page
    - Update routing
    - Add Level 4 to session analysis
    - Update metrics calculation for social attention
    - _Requirements: 4.4, 4.6_

- [ ] 8. Create Research Document Management Interface
  - [ ] 8.1 Create admin page for document management
    - Create `frontend/app/admin/research/page.tsx`
    - Add authentication check (admin only)
    - List all research documents
    - Show document metadata
    - _Requirements: 6.1, 6.6_

  - [ ] 8.2 Implement document upload functionality
    - Add file upload component
    - Support PDF, TXT, MD formats
    - Extract metadata (title, authors, year)
    - Upload to S3
    - Trigger Knowledge Base sync
    - _Requirements: 6.1, 6.2_

  - [ ] 8.3 Add document search and filtering
    - Implement search by title, author, topic
    - Add filters by year, topic, relevance
    - Show document preview
    - Display embedding status
    - _Requirements: 6.4_

  - [ ] 8.4 Implement document deletion
    - Add delete functionality
    - Remove from S3
    - Update Knowledge Base
    - Update metadata file
    - _Requirements: 6.5_

- [ ] 9. Update API and Backend Integration
  - [ ] 9.1 Create API endpoint for enhanced analysis
    - Add POST `/api/analyze-session-enhanced` endpoint
    - Invoke enhanced-analysis Lambda
    - Return report with citations
    - Handle errors gracefully
    - _Requirements: 5.1, 5.2_

  - [ ] 9.2 Create API endpoint for metrics dashboard
    - Add GET `/api/metrics/:profileId` endpoint
    - Fetch session history with clinical metrics
    - Calculate aggregate statistics
    - Return formatted data for charts
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 9.3 Create API endpoint for research documents
    - Add GET `/api/research/documents` endpoint
    - List all documents with metadata
    - Support search and filtering
    - Return document URLs
    - _Requirements: 6.4, 6.6_

  - [ ] 9.4 Update session submission to use enhanced analysis
    - Modify session submission flow
    - Call enhanced-analysis Lambda
    - Store reports with citations
    - Update UI to show enhanced insights
    - _Requirements: 5.1, 5.2, 5.3_

- [ ] 10. Testing and Validation
  - [ ] 10.1 Test Knowledge Base functionality
    - Upload test documents
    - Verify embedding creation
    - Test semantic search
    - Validate citation retrieval
    - _Requirements: 2.1, 2.2, 2.3_

  - [ ] 10.2 Test Bedrock Agent responses
    - Test with various session data
    - Verify research grounding
    - Check citation accuracy
    - Validate recommendation quality
    - _Requirements: 5.1, 5.2, 5.3, 7.4_

  - [ ] 10.3 Validate clinical metrics accuracy
    - Compare calculated metrics to manual calculations
    - Verify benchmark comparisons
    - Test edge cases
    - Validate against research definitions
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 10.4 Test dashboard visualizations
    - Verify chart data accuracy
    - Test responsive design
    - Check citation links
    - Validate export functionality
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ] 10.5 Test Level 4 social attention exercises
    - Play through all exercises
    - Verify face tracking works
    - Check metrics calculation
    - Test adaptive difficulty
    - _Requirements: 4.4, 4.5, 4.6_

  - [ ] 10.6 End-to-end integration testing
    - Complete full user journey
    - Play game → Enhanced analysis → Dashboard view
    - Verify citations appear throughout
    - Check data consistency
    - _Requirements: All_

- [ ] 11. Documentation and Deployment
  - [ ] 11.1 Create Bedrock setup documentation
    - Document Knowledge Base creation steps
    - Document Agent configuration
    - Include IAM policies and permissions
    - Add troubleshooting guide
    - _Requirements: All_

  - [ ] 11.2 Create research document guidelines
    - Document how to add new research
    - Provide metadata format
    - Explain embedding process
    - Include best practices
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 11.3 Update user documentation
    - Document new metrics dashboard
    - Explain clinical metrics
    - Describe Level 4 exercises
    - Add research citations explanation
    - _Requirements: All_

  - [ ] 11.4 Deploy infrastructure changes
    - Deploy Terraform changes for Bedrock resources
    - Deploy new Lambda functions
    - Update API Gateway routes
    - Deploy frontend changes
    - _Requirements: All_

## Notes

- Knowledge Base setup requires AWS Bedrock access in your region
- OpenSearch Serverless has additional costs (~$700/month minimum)
- Consider using Bedrock Knowledge Base with S3 only (no OpenSearch) for lower cost
- Face tracking for Level 4 may require additional libraries (face-api.js or similar)
- Clinical metrics calculations should be validated by domain experts
- Research documents should be reviewed for copyright before uploading

## Success Criteria

- ✅ Knowledge Base contains 10+ research papers with embeddings
- ✅ Bedrock Agent provides cited, evidence-based insights
- ✅ Clinical metrics match research definitions
- ✅ Dashboard displays research-validated measures
- ✅ Reports include specific citations with links
- ✅ Level 4 social attention exercises work correctly
- ✅ Benchmarks based on peer-reviewed norms
- ✅ Therapists can trace recommendations to source research
- ✅ All tests pass
- ✅ Documentation complete
