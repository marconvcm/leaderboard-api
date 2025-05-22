#!/bin/bash
# Usage: bash fake_data.sh <API_KEY> <API_URL>
# Example: bash fake_data.sh mykey123 http://localhost:3000/score

API_KEY=${1:-test-api-key}
API_URL=${2:-http://localhost:3000/leaderboard/score}

USERS=(alice bob carol dave eve frank)

for i in {1..100}
  do
    USER=${USERS[$((RANDOM % 6))]}
    SCORE=$((RANDOM % 1000 + 1))
    curl -s -X POST "$API_URL" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d '{"username": "'$USER'", "score": '$SCORE'}'
    echo
  done
