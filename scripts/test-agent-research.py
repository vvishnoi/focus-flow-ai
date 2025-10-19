#!/usr/bin/env python3
"""
Test Bedrock Agent with Research Integration
"""

import boto3
import json
import sys
from datetime import datetime

# Configuration
AGENT_ID = "QPVURTILVY"
AGENT_ALIAS_ID = "HP2ZFHEEVQ"
REGION = "us-east-1"

# Create client
try:
    client = boto3.client('bedrock-agent-runtime', region_name=REGION)
except Exception as e:
    print(f"Error creating client: {e}")
    print("\nNote: You may need to update boto3:")
    print("  pip install --upgrade boto3")
    sys.exit(1)

# Test query
query = "I need help understanding eye-tracking metrics. What does a fixation duration of 280ms tell us about a child's attention and cognitive processing?"

print("=" * 70)
print("Testing Bedrock Agent with Research Integration")
print("=" * 70)
print(f"\nAgent ID: {AGENT_ID}")
print(f"Alias ID: {AGENT_ALIAS_ID}")
print(f"\nQuery: {query}")
print("\n" + "=" * 70)
print("Agent Response:")
print("=" * 70)
print()

# Invoke agent
try:
    session_id = f"test-{int(datetime.now().timestamp())}"
    
    response = client.invoke_agent(
        agentId=AGENT_ID,
        agentAliasId=AGENT_ALIAS_ID,
        sessionId=session_id,
        inputText=query
    )
    
    # Stream the response
    event_stream = response['completion']
    
    full_response = ""
    for event in event_stream:
        if 'chunk' in event:
            chunk = event['chunk']
            if 'bytes' in chunk:
                text = chunk['bytes'].decode('utf-8')
                print(text, end='', flush=True)
                full_response += text
    
    print("\n")
    print("=" * 70)
    print("Test Complete!")
    print("=" * 70)
    
    # Check if research was used
    if "research" in full_response.lower() or "study" in full_response.lower() or "studies" in full_response.lower():
        print("\n✅ SUCCESS: Agent appears to have used research context!")
    else:
        print("\n⚠️  WARNING: Agent response doesn't mention research.")
        print("   The agent may not have called the ResearchLookup action.")
    
    print(f"\nSession ID: {session_id}")
    print(f"Response length: {len(full_response)} characters")
    
except Exception as e:
    print(f"\n❌ Error invoking agent: {e}")
    print("\nTroubleshooting:")
    print("  1. Check agent is prepared: aws bedrock-agent get-agent --agent-id QPVURTILVY")
    print("  2. Check alias exists: aws bedrock-agent list-agent-aliases --agent-id QPVURTILVY")
    print("  3. Update boto3: pip install --upgrade boto3")
    sys.exit(1)
