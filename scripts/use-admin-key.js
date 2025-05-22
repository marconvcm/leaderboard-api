#!/usr/bin/env node

/**
 * Script to test using an admin API key with the authentication system
 * This demonstrates the flow from API key to JWT token
 * 
 * Usage: node ./scripts/use-admin-key.js <api-key> <secret>
 */

require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

// Get API key and secret from command line arguments
const apiKey = process.argv[2];
const secret = process.argv[3];

if (!apiKey || !secret) {
  console.error('Usage: node ./scripts/use-admin-key.js <api-key> <secret>');
  process.exit(1);
}

// Base URL for the API
const baseUrl = process.env.API_URL || 'http://localhost:3000';

async function getJwtToken() {
  try {
    console.log('1. Requesting challenge from auth service...');
    // Step 1: Request a challenge
    const challengeResponse = await axios.post(`${baseUrl}/auth/challenge`, { apiKey });
    const { challenge, requestId } = challengeResponse.data;
    
    console.log(`   Challenge received: ${challenge.substring(0, 8)}...`);
    console.log(`   Request ID: ${requestId}`);

    // Step 2: Create HMAC of the challenge using the secret
    console.log('\n2. Creating HMAC signature with secret...');
    const hmac = crypto.createHmac('sha256', secret).update(challenge).digest('hex');
    console.log(`   HMAC: ${hmac.substring(0, 8)}...`);

    // Step 3: Verify HMAC and get JWT token
    console.log('\n3. Verifying HMAC and requesting JWT token...');
    const verifyResponse = await axios.post(`${baseUrl}/auth/verify`, {
      apiKey,
      requestId,
      challenge,
      hmac
    });

    const { token } = verifyResponse.data;
    console.log('\n=== JWT TOKEN RECEIVED SUCCESSFULLY ===');
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Step 4: Show how to use the token for authenticated requests
    console.log('\n4. Example of using the JWT token in an authenticated request:');
    console.log(`
    const response = await axios.get('${baseUrl}/admin/api-keys', {
      headers: {
        'Authorization': 'Bearer ${token}'
      }
    });
    `);

    // Actually try the authenticated request
    console.log('\n5. Making actual authenticated request to list API keys...');
    try {
      const authResponse = await axios.get(`${baseUrl}/admin/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('   API keys retrieved successfully:');
      console.log('   ', JSON.stringify(authResponse.data, null, 2));
    } catch (error) {
      console.error('   Error making authenticated request:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getJwtToken();
