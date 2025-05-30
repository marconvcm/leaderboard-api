#!/usr/bin/env node
// filepath: /Users/marconvcm/Development/leaderboard-api/scripts/auth-flow.js

const axios = require('axios');
const crypto = require('crypto');

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const DEFAULT_SECRET = 'demo-secret'; // This would normally be securely stored

// Parse command line arguments
const args = process.argv.slice(2);
const apiKey = args[0];

if (!apiKey) {
  console.error('Error: API key is required');
  console.log('Usage: node auth-flow.js <apiKey> [secret]');
  console.log('Example: node auth-flow.js demo-api-key');
  process.exit(1);
}

// The secret can be passed as second argument or we use mapping
const secret = args[1]

// Main function
async function main() {
  try {
    console.log(`\n🔑 Using API Key: ${apiKey}`);
    
    // Step 1: Request a challenge
    console.log('\n📤 Requesting challenge...');
    const challengeResponse = await axios.post(`${API_BASE}//auth/challenge`, { apiKey });
    const { challenge, requestId } = challengeResponse.data;
    console.log(`📥 Received:`);
    console.log(`  - Challenge: ${challenge}`);
    console.log(`  - Request ID: ${requestId}`);
    
    // Step 2: Generate HMAC
    console.log(`\n🔐 Generating HMAC with secret: ${maskSecret(secret)}`);
    const hmac = crypto.createHmac('sha256', secret)
      .update(challenge)
      .digest('base64');
    console.log(`  - HMAC: ${hmac}`);
    
    // Step 3: Verify and get token
    console.log('\n📤 Submitting verification...');
    const verifyResponse = await axios.post(`${API_BASE}/auth/verify`, {
      apiKey,
      requestId,
      challenge,
      hmac
    });
    
    const { token } = verifyResponse.data;
    console.log(`📥 Received token: ${token.substring(0, 20)}...`);
    
    // Print usage example
    console.log('\n✅ Authentication successful!');
    console.log('\nTo use this token in API requests:');
    console.log(`\ncurl -H "x-api-key: ${apiKey}" -H "Authorization: Bearer ${token}" ${API_BASE}/v1/leaderboard`);
    
    // Test a protected endpoint if user wants
    // askToTestProtectedEndpoint(token);
    
  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Helper to mask the secret when displaying
function maskSecret(secret) {
  if (secret.length <= 4) return '****';
  return secret.substring(0, 2) + '*'.repeat(secret.length - 4) + secret.substring(secret.length - 2);
}

// Run the main function
main();
