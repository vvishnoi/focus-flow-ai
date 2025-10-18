# Design Document

## Overview

This enhancement integrates clinical research on eye-gazing and attention training into FocusFlow AI, creating an evidence-based system with AWS Bedrock Knowledge Base for AI-powered insights grounded in peer-reviewed research.

## Research-Based Insights

### Key Clinical Metrics from Research

**From PMC3925117 (Autism & Eye Gaze):**
1. **Fixation Duration**: Time spent looking at specific targets
2. **Saccade Patterns**: Eye movement speed and accuracy between targets
3. **Attention Distribution**: Percentage of time on faces vs objects vs background
4. **Social Attention**: Preference for social vs non-social stimuli
5. **Gaze Following**: Ability to follow moving targets

**From PMC10123036 (Eye-Tracking in Healthcare):**
1. **Cognitive Load**: Pupil dilation and blink rate during tasks
2. **Visual Search Efficiency**: Time to locate targets
3. **Attention Span**: Duration of sustained focus
4. **Distractor Resistance**: Ability to ignore irrelevant stimuli

**From Healthline (Therapeutic Benefits):**
1. **Emotional Regulation**: Improved through sustained eye contact
2. **Social Connection**: Enhanced by face-to-face gaze exercises
3. **Focus Training**: Progressive attention span building
4. **Anxiety Reduction**: Through controlled gaze exercises

## Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Next.js)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Enhanced Game Levels                                   │ │
│  │  - Research-based exercises                             │ │
│  │  - Clinical metrics tracking                            │ │
│  │  - Real-time feedback                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Clinical Metrics Dashboard                             │ │
│  │  - Fixation duration charts                             │ │
│  │  - Saccade pattern visualization                        │ │
│  │  - Attention distribution graphs                        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────────┐
│                    AWS Backend                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  S3 Bucket: Research Documents                          │ │
│  │  - PDF research papers                                  │ │
│  │  - Extracted text files                                 │ │
│  │  - Document metadata                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Bedrock Knowledge Base                                 │ │
│  │  - Vector embeddings of research                        │ │
│  │  - Semantic search capability                           │ │
│  │  - Citation tracking                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Bedrock Agent                                          │ │
│  │  - Query knowledge base                                 │ │
│  │  - Generate evidence-based insights                     │ │
│  │  - Provide citations                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↓                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Lambda: Enhanced Analysis                              │ │
│  │  - Calculate clinical metrics                           │ │
│  │  - Compare to research benchmarks                       │ │
│  │  - Generate reports with citations                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Research Document Storage (S3)

**Purpose**: Store research papers and documents for knowledge base

**Structure**:
```
s3://focusflow-research-dev/
├── papers/
│   ├── PMC3925117.pdf
│   ├── PMC10123036.pdf
│   └── healthline-eye-gazing.pdf
├── extracted/
│   ├── PMC3925117.txt
│   ├── PMC10123036.txt
│   └── healthline-eye-gazing.txt
└── metadata/
    └── documents.json
```

**Metadata Structure**:
```json
{
  "documents": [
    {
      "id": "PMC3925117",
      "title": "Eye Gaze in Autism Spectrum Disorder",
      "authors": ["Author1", "Author2"],
      "publication": "Journal Name",
      "year": 2014,
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3925117/",
      "s3Key": "papers/PMC3925117.pdf",
      "extractedKey": "extracted/PMC3925117.txt",
      "topics": ["autism", "eye-tracking", "social attention"],
      "keyFindings": [
        "Reduced eye contact is early indicator",
        "Fixation duration differs in ASD",
        "Attention distribution patterns"
      ]
    }
  ]
}
```

### 2. Bedrock Knowledge Base

**Purpose**: Enable semantic search over research documents

**Configuration**:
```typescript
interface KnowledgeBaseConfig {
  name: string                    // "focusflow-research-kb"
  description: string             // "Eye-gazing and attention research"
  roleArn: string                 // IAM role for Bedrock
  dataSourceConfig: {
    type: "S3"
    s3Configuration: {
      bucketArn: string
      inclusionPrefixes: string[] // ["papers/", "extracted/"]
    }
  }
  storageConfiguration: {
    type: "OPENSEARCH_SERVERLESS"
    opensearchServerlessConfiguration: {
      collectionArn: string
      vectorIndexName: string
      fieldMapping: {
        vectorField: string
        textField: string
        metadataField: string
      }
    }
  }
  embeddingModelArn: string       // "amazon.titan-embed-text-v1"
}
```

**Query Interface**:
```typescript
interface KnowledgeBaseQuery {
  query: string
  maxResults: number
  filter?: {
    topics?: string[]
    yearRange?: { min: number, max: number }
  }
}

interface KnowledgeBaseResult {
  content: string
  score: number
  metadata: {
    documentId: string
    title: string
    authors: string[]
    citation: string
  }
  location: {
    s3Key: string
    page?: number
  }
}
```

### 3. Bedrock Agent with Knowledge Base

**Purpose**: AI agent that queries research to provide evidence-based insights

**Agent Configuration**:
```typescript
interface AgentConfig {
  agentName: string               // "focusflow-research-agent"
  foundationModel: string         // "anthropic.claude-3-sonnet-20240229-v1:0"
  instruction: string             // System prompt with research focus
  knowledgeBases: [{
    knowledgeBaseId: string
    description: string
    knowledgeBaseState: "ENABLED"
  }]
  actionGroups: [{
    actionGroupName: string
    description: string
    actionGroupExecutor: {
      lambda: string              // Lambda ARN for custom actions
    }
    apiSchema: object             // OpenAPI schema for actions
  }]
}
```

**Agent Instructions**:
```
You are a clinical research assistant for FocusFlow AI, an eye-tracking and attention training application. Your role is to:

1. Analyze eye-tracking session data using evidence-based metrics
2. Query the knowledge base for relevant research findings
3. Provide insights grounded in peer-reviewed studies
4. Cite specific papers and findings in your responses
5. Recommend interventions based on clinical research
6. Compare patient progress to research-based benchmarks

When analyzing sessions:
- Reference fixation duration, saccade patterns, and attention distribution
- Compare metrics to typical development patterns from research
- Identify areas of concern based on clinical indicators
- Suggest evidence-based exercises and interventions
- Always cite the source research for your recommendations

Format citations as: [Author et al., Year, Journal/Source]
```

### 4. Enhanced Clinical Metrics

**New Metrics to Track**:

```typescript
interface ClinicalMetrics {
  // Basic Metrics (existing)
  totalGazePoints: number
  accurateGazes: number
  accuracyPercentage: number
  
  // Research-Based Metrics (new)
  fixationMetrics: {
    averageDuration: number       // milliseconds
    totalFixations: number
    longestFixation: number
    shortestFixation: number
    fixationRate: number          // fixations per second
  }
  
  saccadeMetrics: {
    totalSaccades: number
    averageVelocity: number       // degrees per second
    averageAmplitude: number      // degrees
    saccadeAccuracy: number       // percentage
    latency: number               // milliseconds
  }
  
  attentionDistribution: {
    targetTime: number            // percentage
    distractorTime: number        // percentage
    backgroundTime: number        // percentage
    socialStimuliTime?: number    // percentage (for face-tracking levels)
  }
  
  cognitiveLoad: {
    averagePupilSize: number      // millimeters
    pupilVariability: number      // standard deviation
    blinkRate: number             // blinks per minute
  }
  
  performanceMetrics: {
    reactionTime: number          // milliseconds
    errorRate: number             // percentage
    completionTime: number        // seconds
    taskEfficiency: number        // score 0-100
  }
  
  // Research Benchmarks
  benchmarkComparison: {
    ageGroup: string              // "6-8", "9-11", etc.
    percentile: number            // 0-100
    typicalRange: { min: number, max: number }
    concernThreshold: number
    status: "typical" | "borderline" | "concern"
  }
}
```

### 5. Enhanced Game Levels

**Level 1: Sustained Attention Training** (Research-based)
```typescript
interface Level1Enhancement {
  // Based on PMC3925117 findings
  exercises: [
    {
      name: "Single Object Tracking"
      duration: 60                // seconds
      targetSpeed: "slow"         // gradual progression
      metrics: ["fixationDuration", "saccadeAccuracy"]
      researchBasis: "PMC3925117 - Object tracking in ASD"
    },
    {
      name: "Predictive Tracking"
      duration: 60
      targetSpeed: "medium"
      metrics: ["anticipatoryGaze", "smoothPursuit"]
      researchBasis: "PMC10123036 - Predictive eye movements"
    }
  ]
  
  adaptiveDifficulty: {
    increaseSpeed: boolean        // based on performance
    addDistractors: boolean       // progressive challenge
    changeTargetSize: boolean     // visual acuity adjustment
  }
}
```

**Level 4: Social Attention Training** (New - Research-based)
```typescript
interface Level4SocialAttention {
  name: "Face Tracking & Social Gaze"
  description: "Train social attention and face processing"
  researchBasis: "PMC3925117 - Social attention in ASD"
  
  exercises: [
    {
      name: "Face Detection"
      task: "Look at faces among objects"
      duration: 60
      metrics: ["facePreference", "faceFixationDuration"]
    },
    {
      name: "Eye Contact Practice"
      task: "Maintain gaze on eyes"
      duration: 45
      metrics: ["eyeRegionFixation", "sustainedContact"]
    },
    {
      name: "Emotion Recognition"
      task: "Identify facial expressions"
      duration: 60
      metrics: ["emotionAccuracy", "scanPattern"]
    },
    {
      name: "Gaze Following"
      task: "Follow where person is looking"
      duration: 60
      metrics: ["gazeFollowing", "jointAttention"]
    }
  ]
}
```

### 6. Clinical Metrics Dashboard

**Purpose**: Display research-validated metrics for therapists

**Components**:

```typescript
interface MetricsDashboard {
  profileId: string
  dateRange: { start: Date, end: Date }
  
  sections: [
    {
      title: "Fixation Analysis"
      charts: [
        {
          type: "line"
          data: "fixationDuration over time"
          benchmark: "age-appropriate range"
          citation: "PMC3925117"
        },
        {
          type: "bar"
          data: "fixation distribution by target type"
          interpretation: "social vs non-social preference"
        }
      ]
    },
    {
      title: "Saccade Performance"
      charts: [
        {
          type: "scatter"
          data: "saccade velocity vs accuracy"
          benchmark: "typical development"
          citation: "PMC10123036"
        }
      ]
    },
    {
      title: "Attention Distribution"
      charts: [
        {
          type: "pie"
          data: "time on targets vs distractors"
          interpretation: "selective attention ability"
        },
        {
          type: "heatmap"
          data: "gaze distribution across screen"
          visualization: "attention patterns"
        }
      ]
    },
    {
      title: "Progress Tracking"
      charts: [
        {
          type: "line"
          data: "accuracy over sessions"
          trend: "improving/stable/declining"
          recommendations: "evidence-based next steps"
        }
      ]
    }
  ]
  
  aiInsights: {
    summary: string
    keyFindings: string[]
    recommendations: string[]
    citations: string[]
  }
}
```

### 7. Enhanced AI Analysis Lambda

**Purpose**: Calculate clinical metrics and generate research-backed insights

**Function Flow**:
```
1. Receive session data
2. Calculate enhanced clinical metrics
3. Query Bedrock Knowledge Base for relevant research
4. Invoke Bedrock Agent for analysis
5. Generate report with citations
6. Store in DynamoDB and S3
7. Return insights to frontend
```

**Implementation**:
```javascript
exports.handler = async (event) => {
  const sessionData = JSON.parse(event.body);
  
  // 1. Calculate clinical metrics
  const clinicalMetrics = calculateClinicalMetrics(sessionData);
  
  // 2. Query knowledge base for relevant research
  const researchContext = await queryKnowledgeBase({
    query: `eye tracking metrics for ${sessionData.profileAge} year old, 
            attention training, fixation duration, saccade patterns`,
    maxResults: 5
  });
  
  // 3. Invoke Bedrock Agent with context
  const agentResponse = await invokeBedrockAgent({
    agentId: process.env.AGENT_ID,
    sessionId: sessionData.sessionId,
    inputText: `Analyze this eye-tracking session:
      Profile: ${sessionData.profileName}, Age ${sessionData.profileAge}
      Level: ${sessionData.level}
      Metrics: ${JSON.stringify(clinicalMetrics)}
      
      Provide evidence-based insights with citations.`,
    knowledgeBaseContext: researchContext
  });
  
  // 4. Generate comprehensive report
  const report = {
    sessionId: sessionData.sessionId,
    profileId: sessionData.profileId,
    clinicalMetrics,
    aiInsights: agentResponse.insights,
    researchCitations: agentResponse.citations,
    recommendations: agentResponse.recommendations,
    benchmarkComparison: compareToBenchmarks(clinicalMetrics, sessionData.profileAge),
    generatedAt: Date.now()
  };
  
  // 5. Store report
  await storeReport(report);
  
  return report;
};
```

## Data Models

### Research Document Model
```typescript
interface ResearchDocument {
  id: string
  title: string
  authors: string[]
  publication: string
  year: number
  doi?: string
  url: string
  s3Key: string
  extractedTextKey: string
  topics: string[]
  keyFindings: string[]
  relevantMetrics: string[]
  uploadedAt: number
  processedAt: number
  embeddingStatus: "pending" | "completed" | "failed"
}
```

### Enhanced Session Report Model
```typescript
interface EnhancedSessionReport {
  sessionId: string
  profileId: string
  profileAge: number
  level: string
  datePlayed: string
  
  // Clinical metrics
  clinicalMetrics: ClinicalMetrics
  
  // AI analysis
  aiInsights: {
    summary: string
    keyFindings: string[]
    strengths: string[]
    areasForImprovement: string[]
    recommendations: string[]
  }
  
  // Research citations
  citations: [{
    documentId: string
    title: string
    authors: string[]
    relevantPassage: string
    confidence: number
  }]
  
  // Benchmark comparison
  benchmarkComparison: {
    ageGroup: string
    percentile: number
    status: "typical" | "borderline" | "concern"
    interpretation: string
  }
  
  // Progress tracking
  progressIndicators: {
    sessionNumber: number
    improvementRate: number
    consistencyScore: number
    trend: "improving" | "stable" | "declining"
  }
  
  generatedAt: number
}
```

## Implementation Phases

### Phase 1: Knowledge Base Setup (Week 1-2)
1. Create S3 bucket for research documents
2. Upload initial research papers
3. Extract text from PDFs
4. Create Bedrock Knowledge Base
5. Configure vector embeddings
6. Test semantic search

### Phase 2: Bedrock Agent Integration (Week 2-3)
1. Create Bedrock Agent
2. Connect to Knowledge Base
3. Configure agent instructions
4. Create Lambda for agent invocation
5. Test agent responses
6. Implement citation tracking

### Phase 3: Enhanced Metrics (Week 3-4)
1. Implement clinical metrics calculation
2. Add fixation analysis
3. Add saccade tracking
4. Add attention distribution
5. Add benchmark comparisons
6. Test metric accuracy

### Phase 4: Dashboard & Visualization (Week 4-5)
1. Design metrics dashboard UI
2. Implement charts and graphs
3. Add research citations display
4. Create progress tracking views
5. Add export functionality
6. Test responsiveness

### Phase 5: Enhanced Game Levels (Week 5-6)
1. Design Level 4 (Social Attention)
2. Implement face-tracking exercises
3. Add adaptive difficulty
4. Integrate clinical metrics
5. Test with real users
6. Refine based on feedback

## Testing Strategy

### Knowledge Base Testing
- Verify document upload and processing
- Test semantic search accuracy
- Validate citation retrieval
- Check embedding quality

### Agent Testing
- Test query understanding
- Verify research grounding
- Validate citation accuracy
- Check response quality

### Metrics Testing
- Validate calculation accuracy
- Compare to research benchmarks
- Test edge cases
- Verify performance

### Integration Testing
- End-to-end session analysis
- Dashboard data flow
- Report generation
- Citation tracking

## Success Criteria

- ✅ Knowledge base contains 10+ research papers
- ✅ Agent provides cited, evidence-based insights
- ✅ Clinical metrics match research definitions
- ✅ Dashboard displays research-validated measures
- ✅ Reports include specific citations
- ✅ Benchmarks based on peer-reviewed norms
- ✅ Therapists can trace recommendations to source research

---

**Design complete! Ready for implementation planning.** 🎯
