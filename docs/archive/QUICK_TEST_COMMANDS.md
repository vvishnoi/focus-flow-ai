# Quick Test Commands

## Test Lambda RAG Directly

```bash
aws lambda invoke \
  --function-name focusflow-research-rag-dev \
  --cli-binary-format raw-in-base64-out \
  --payload '{"inputText":"fixation duration cognitive load"}' \
  response.json && cat response.json | python3 -m json.tool
```

## Test Bedrock Agent with Research

```bash
# Get agent alias
ALIAS_ID=$(aws bedrock-agent list-agent-aliases --agent-id QPVURTILVY --query 'agentAliasSummaries[0].agentAliasId' --output text)

# Test query
aws bedrock-agent-runtime invoke-agent \
  --agent-id QPVURTILVY \
  --agent-alias-id "$ALIAS_ID" \
  --session-id "test-$(date +%s)" \
  --input-text "What does a fixation duration of 280ms indicate about attention?" \
  response.txt

# View response
cat response.txt | jq -r '.completion[]?.chunk?.bytes' | base64 -d
```

## Monitor Lambda Logs

```bash
aws logs tail /aws/lambda/focusflow-research-rag-dev --follow
```

## Check S3 Embeddings

```bash
aws s3 ls s3://focusflow-bedrock-kb-dev/ --human-readable
```

## Add More Research Papers

```bash
# 1. Add PDFs
cp your-papers/*.pdf backend/bedrock/knowledge-base/research/papers/

# 2. Process
python3 scripts/process-research-papers.py backend/bedrock/knowledge-base/research/papers

# 3. Test
aws lambda invoke \
  --function-name focusflow-research-rag-dev \
  --cli-binary-format raw-in-base64-out \
  --payload '{"inputText":"your new topic"}' \
  response.json
```

## Check Costs

```bash
# Lambda costs
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://<(echo '{"Dimensions":{"Key":"SERVICE","Values":["AWS Lambda"]}}')

# S3 costs
aws ce get-cost-and-usage \
  --time-period Start=2025-10-01,End=2025-10-31 \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://<(echo '{"Dimensions":{"Key":"SERVICE","Values":["Amazon Simple Storage Service"]}}')
```
