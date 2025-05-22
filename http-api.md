# HTTP API Definition for leaderboard-api

## POST /v1/leaderboard/score
- Description: Add a score for a user (creates or updates user in leaderboard)
- Headers:
  - x-api-key: string (required)
- Body (JSON):
  - username: string (required)
  - score: number (required)
- Response: { success: true }

## GET /v1/leaderboard/
- Description: Get the top N users in the leaderboard
- Headers:
  - x-api-key: string (required)
- Query Params:
  - limit: number (optional, default 10)
- Response: [ { username: string, score: number } ]

## GET /health
- Description: Health and readiness check
- Response: { live: boolean, ready: boolean }

---

All endpoints return errors in the format:
```
{
  "error": {
    "code": string,
    "message": string,
    "details"?: any
  }
}
```
