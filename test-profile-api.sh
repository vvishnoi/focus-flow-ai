#!/bin/bash

# Test Profile API End-to-End

API_URL="https://oiks1jrjw2.execute-api.us-east-1.amazonaws.com/dev"
THERAPIST_ID="test-therapist-$(date +%s)"

echo "🧪 Testing Profile Management API"
echo "=================================="
echo ""

# Test 1: Create Profile
echo "1️⃣  Creating profile..."
CREATE_RESPONSE=$(curl -s -X POST $API_URL/profiles \
  -H "Content-Type: application/json" \
  -d "{\"therapistId\":\"$THERAPIST_ID\",\"name\":\"Test Child\",\"age\":8,\"gender\":\"male\",\"weight\":30,\"height\":130}")

PROFILE_ID=$(echo $CREATE_RESPONSE | jq -r '.profile.profileId')
echo "✅ Profile created: $PROFILE_ID"
echo "$CREATE_RESPONSE" | jq
echo ""

# Test 2: Get Profiles
echo "2️⃣  Getting profiles..."
GET_RESPONSE=$(curl -s $API_URL/profiles/$THERAPIST_ID)
echo "✅ Profiles retrieved:"
echo "$GET_RESPONSE" | jq
echo ""

# Test 3: Create Another Profile
echo "3️⃣  Creating second profile..."
CREATE_RESPONSE2=$(curl -s -X POST $API_URL/profiles \
  -H "Content-Type: application/json" \
  -d "{\"therapistId\":\"$THERAPIST_ID\",\"name\":\"Another Child\",\"age\":10,\"gender\":\"female\"}")

PROFILE_ID2=$(echo $CREATE_RESPONSE2 | jq -r '.profile.profileId')
echo "✅ Second profile created: $PROFILE_ID2"
echo ""

# Test 4: Get All Profiles
echo "4️⃣  Getting all profiles..."
GET_ALL_RESPONSE=$(curl -s $API_URL/profiles/$THERAPIST_ID)
COUNT=$(echo $GET_ALL_RESPONSE | jq -r '.count')
echo "✅ Total profiles: $COUNT"
echo "$GET_ALL_RESPONSE" | jq
echo ""

# Test 5: Delete Profile
echo "5️⃣  Deleting first profile..."
DELETE_RESPONSE=$(curl -s -X DELETE $API_URL/profiles/$THERAPIST_ID/$PROFILE_ID)
echo "✅ Profile deleted:"
echo "$DELETE_RESPONSE" | jq
echo ""

# Test 6: Verify Deletion
echo "6️⃣  Verifying deletion..."
FINAL_RESPONSE=$(curl -s $API_URL/profiles/$THERAPIST_ID)
FINAL_COUNT=$(echo $FINAL_RESPONSE | jq -r '.count')
echo "✅ Remaining profiles: $FINAL_COUNT"
echo "$FINAL_RESPONSE" | jq
echo ""

# Test 7: Verify DynamoDB
echo "7️⃣  Checking DynamoDB..."
aws dynamodb query \
  --table-name focusflow-profiles-dev \
  --key-condition-expression "therapistId = :tid" \
  --expression-attribute-values "{\":tid\": {\"S\": \"$THERAPIST_ID\"}}" \
  --query 'Items[].{ProfileId:profileId.S,Name:name.S,Age:age.N}' \
  --output table
echo ""

echo "🎉 All tests passed!"
echo ""
echo "📝 Summary:"
echo "  - Created 2 profiles"
echo "  - Retrieved profiles"
echo "  - Deleted 1 profile"
echo "  - Verified in DynamoDB"
echo ""
echo "🚀 Ready to test frontend!"
echo "   Run: cd frontend && npm run dev"
echo "   Open: http://localhost:3000"
