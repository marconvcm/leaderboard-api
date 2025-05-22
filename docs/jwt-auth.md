# JWT Authentication Guide

This guide explains how to use JWT authentication with the Leaderboard API.

## Authentication Flow

1. **Request a Challenge**:
   ```
   POST /auth/challenge
   Content-Type: application/json
   
   {
     "apiKey": "your-api-key"
   }
   ```
   
   Response:
   ```json
   {
     "challenge": "7a8b9c...",
     "requestId": "your-api-key-1a2b3c..."
   }
   ```

2. **Generate HMAC and Verify**:
   ```
   POST /auth/verify
   Content-Type: application/json
   
   {
     "apiKey": "your-api-key",
     "requestId": "your-api-key-1a2b3c...",
     "challenge": "7a8b9c...",
     "hmac": "computed-hmac-of-challenge"
   }
   ```
   
   To compute the HMAC, use the shared secret and the challenge:
   ```
   hmac = HMAC-SHA256(challenge, your-shared-secret)
   ```
   
   Response:
   ```json
   {
     "token": "your.jwt.token"
   }
   ```

3. **Use the JWT Token**:
   Include the token in your API requests:
   ```
   GET /v1/leaderboard/v2
   Authorization: Bearer your.jwt.token
   ```

## Notes

- Tokens expire after 1 hour
- Challenges expire after 2 minutes
- Each challenge can only be used once
- API keys are still required for backward compatibility

## Example (JavaScript)

```javascript
const crypto = require('crypto');
const axios = require('axios');

const API_KEY = 'your-api-key';
const SHARED_SECRET = 'your-shared-secret';
const API_BASE = 'https://your-api-host';

async function getAuthToken() {
  // Step 1: Request a challenge
  const challengeRes = await axios.post(`${API_BASE}/auth/challenge`, { apiKey: API_KEY });
  const { challenge, requestId } = challengeRes.data;
  
  // Step 2: Compute HMAC
  const hmac = crypto.createHmac('sha256', SHARED_SECRET)
    .update(challenge)
    .digest('hex');
  
  // Step 3: Verify and get token
  const verifyRes = await axios.post(`${API_BASE}/auth/verify`, {
    apiKey: API_KEY,
    requestId,
    challenge,
    hmac
  });
  
  return verifyRes.data.token;
}

async function getLeaderboard() {
  const token = await getAuthToken();
  
  const response = await axios.get(`${API_BASE}/v1/leaderboard/v2`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.data;
}
```
