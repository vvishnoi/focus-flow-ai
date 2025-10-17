# FocusFlow AI - Bedrock Agent Configuration

## Overview

The Bedrock Agent analyzes eye-tracking session data and generates therapeutic insights using Claude Sonnet 4.5.

## Architecture

```
S3 Event (new session) 
    ↓
Lambda: Analysis Trigger
    ↓
Bedrock Agent (Claude Sonnet 4.5)
    ├── Tool: Metrics Calculator (Lambda)
    ├── Knowledge Base: Benchmarks (S3)
    └── Prompt: Analysis Instructions
    ↓
DynamoDB: Reports Table
    ↓
API Gateway: Get Reports
    ↓
Frontend: Dashboard
```

## Components

### 1. Bedrock Agent
- **Model**: Claude Sonnet 4.5 (`anthropic.claude-sonnet-4-5-20250929-v1:0`)
- **Purpose**: Analyze metrics and generate natural language reports
- **Instruction**: Therapeutic analysis prompt for child development

### 2. Action Group: Metrics Calculator
- **Tool**: Lambda function
- **Purpose**: Calculate performance metrics from raw session data
- **API**: OpenAPI 3.0 schema
- **Metrics**:
  - Tracking Accuracy (%)
  - Time on Target (seconds)
  - Focus Score (0-100)
  - Average Distance from Target (pixels)
  - Target Acquisition Speed (ms) - Level 2
  - Pattern Recognition (%) - Level 3

### 3. Knowledge Base
- **Storage**: S3 bucket
- **Content**: Age-appropriate benchmarks
- **Format**: JSON
- **Age Groups**: 5-7, 8-10, 11-13 years
- **Levels**: Level 1, 2, 3

### 4. Analysis Trigger
- **Trigger**: S3 ObjectCreated event
- **Purpose**: Invoke Bedrock Agent when new session uploaded
- **Output**: Store report in DynamoDB

## Benchmarks

### Level 1: Follow the Leader
**Age 5-7:**
- Tracking Accuracy: 70% (excellent), 55% (good), 40% (fair)
- Time on Target: 60s (excellent), 45s (good), 30s (fair)
- Focus Score: 75 (excellent), 60 (good), 45 (fair)

**Age 8-10:**
- Tracking Accuracy: 80% (excellent), 65% (good), 50% (fair)
- Time on Target: 70s (excellent), 55s (good), 40s (fair)
- Focus Score: 85 (excellent), 70 (good), 55 (fair)

**Age 11-13:**
- Tracking Accuracy: 85% (excellent), 75% (good), 60% (fair)
- Time on Target: 80s (excellent), 65s (good), 50s (fair)
- Focus Score: 90 (excellent), 80 (good), 65 (fair)

### Level 2: Collision Course
Similar structure with adjusted benchmarks for multi-object tracking.

### Level 3: Find the Pattern
Similar structure with pattern recognition metrics.

## Agent Prompt

The agent is instructed to:
1. Analyze performance metrics
2. Compare against age-appropriate benchmarks
3. Generate warm, encouraging reports
4. Highlight strengths and areas for improvement
5. Provide 2-3 actionable recommendations
6. Maintain a supportive, professional tone

## Report Structure

1. **Session Summary**
   - Level played
   - Duration
   - Date

2. **Performance Highlights**
   - What went well
   - Strengths observed

3. **Key Metrics**
   - Tracking accuracy with context
   - Focus score interpretation
   - Comparison to benchmarks

4. **Areas for Development**
   - Framed positively
   - Specific observations

5. **Recommendations**
   - 2-3 actionable steps
   - Practical suggestions
   - Next session goals

6. **Progress Comparison**
   - Improvement from previous sessions
   - Trends over time

## Example Report

```
Session Summary
===============
Alex completed a Level 1 (Follow the Leader) session on January 15, 2025.
Duration: 5 minutes 12 seconds

Performance Highlights
=====================
Great job, Alex! Your ability to follow the moving object has improved 
significantly. You maintained focus for most of the session, showing 
excellent sustained attention.

Key Metrics
===========
- Tracking Accuracy: 78% (Above baseline for age 8)
- Focus Score: 82/100 (Excellent)
- Time on Target: 4 minutes 3 seconds

Your tracking accuracy of 78% is above the baseline for your age group 
(65% is considered good). This shows strong visual tracking skills!

Areas for Development
====================
We noticed your gaze occasionally drifted to the edges of the screen. 
This is completely normal and something we can work on together.

Recommendations
===============
1. Practice sessions: Try 2-3 short sessions per week rather than one 
   long session
2. Environment: Ensure good lighting and minimal distractions
3. Next goal: Aim for 80% tracking accuracy in the next session

Progress
========
Compared to your last session:
- Tracking Accuracy: ↑ 5% (Great improvement!)
- Focus Score: ↑ 7 points (Excellent progress!)

Keep up the wonderful work! 🌟
```

## Testing the Agent

### 1. Test Metrics Calculator

```bash
aws lambda invoke \
  --function-name focusflow-metrics-calculator-dev \
  --payload '{"s3Key":"sessions/test-user/session-123.json","bucketName":"focusflow-sessions-dev"}' \
  response.json

cat response.json
```

### 2. Test Bedrock Agent

```bash
aws bedrock-agent-runtime invoke-agent \
  --agent-id <agent-id> \
  --agent-alias-id <alias-id> \
  --session-id test-session \
  --input-text "Analyze the session at s3://bucket/sessions/user/session.json" \
  output.txt

cat output.txt
```

### 3. Test Full Flow

1. Upload test session to S3
2. Check CloudWatch logs for analysis-trigger
3. Verify report in DynamoDB
4. Fetch report via API

## Monitoring

### CloudWatch Logs

```bash
# Analysis Trigger
aws logs tail /aws/lambda/focusflow-analysis-trigger-dev --follow

# Metrics Calculator
aws logs tail /aws/lambda/focusflow-metrics-calculator-dev --follow
```

### Bedrock Agent Metrics

Check AWS Console → Bedrock → Agents → Metrics:
- Invocations
- Latency
- Errors
- Token usage

## Cost Optimization

### Claude Sonnet 4.5 Pricing (us-east-1)
- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

### Estimated Costs
**Per session analysis:**
- Input tokens: ~2,000 (prompt + metrics + benchmarks)
- Output tokens: ~500 (report)
- Cost per session: ~$0.01

**Monthly (1000 users, 10 sessions each):**
- 10,000 sessions × $0.01 = ~$100/month

### Tips to Reduce Costs
1. Use Claude Haiku for simpler analyses ($0.25/$1.25 per 1M tokens)
2. Cache knowledge base in prompt
3. Batch multiple sessions
4. Use shorter prompts

## Troubleshooting

### Agent not invoking
- Check IAM permissions
- Verify agent is prepared (not DRAFT)
- Check CloudWatch logs

### Metrics Calculator errors
- Verify S3 permissions
- Check session data format
- Review Lambda logs

### Knowledge Base not accessible
- Verify S3 bucket permissions
- Check knowledge base sync status
- Ensure files are uploaded

### High costs
- Monitor token usage in CloudWatch
- Consider using Claude Haiku
- Optimize prompt length
- Review session frequency

## Security

- ✅ IAM roles with least privilege
- ✅ S3 encryption at rest
- ✅ DynamoDB encryption
- ✅ CloudWatch logging enabled
- ✅ No hardcoded credentials

## Next Steps

1. ✅ Deploy Bedrock Agent with Terraform
2. ⏳ Test with sample session data
3. ⏳ Refine prompts based on output quality
4. ⏳ Add more benchmarks for different conditions
5. ⏳ Implement progress tracking over time
6. ⏳ Add parent/therapist feedback loop

## Resources

- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Bedrock Agents Guide](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [Claude Sonnet 4.5 Model Card](https://docs.anthropic.com/claude/docs/models-overview)
- [OpenAPI Specification](https://swagger.io/specification/)
