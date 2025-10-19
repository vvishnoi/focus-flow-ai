#!/bin/bash

# Test Bedrock Agent with Research Lookup

AGENT_ID="QPVURTILVY"
AGENT_ALIAS_ID="TSTALIASID"  # Test alias
REGION="us-east-1"

echo "Testing Bedrock Agent with Research Lookup Integration"
echo "======================================================="
echo ""

# Create a test session
SESSION_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

echo "Session ID: $SESSION_ID"
echo ""

# Test query that should trigger research lookup
QUERY="Analyze this eye-tracking session: The child had an average fixation duration of 280ms and made 45 saccades per minute. What does this indicate about their attention and cognitive processing?"

echo "Query:"
echo "$QUERY"
echo ""
echo "Invoking agent..."
echo ""

# Invoke the agent
aws bedrock-agent-runtime invoke-agent \
  --agent-id "$AGENT_ID" \
  --agent-alias-id "$AGENT_ALIAS_ID" \
  --session-id "$SESSION_ID" \
  --input-text "$QUERY" \
  --region "$REGION" \
  response.txt

echo ""
echo "=== Agent Response ==="
cat response.txt | jq -r '.completion[]?.chunk?.bytes' | base64 -d 2>/dev/null || cat response.txt

echo ""
echo ""
echo "✅ Test complete!"
echo ""
echo "The agent should have:"
echo "  1. Analyzed the metrics"
echo "  2. Searched research papers for context"
echo "  3. Provided insights backed by research"
