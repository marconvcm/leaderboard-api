#!/usr/bin/env node

/**
 * Script to create an admin API key for the Leaderboard API
 * This key can be used to manage other API keys
 * 
 * Usage: node ./scripts/create-admin-key.js [name]
 * Where [name] is an optional descriptive name for the API key (defaults to "Admin API Key")
 */

const mongoose = require('mongoose');
const { createApiKey } = require('../dist/services/apiKey.service');
const logger = require('../dist/utils/logger');

// Get the name from command line arguments or use default
const adminKeyName = process.argv[2] || 'Admin API Key';
const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/leaderboard';

async function createAdminKey() {
  try {
    // Connect to MongoDB
    await mongoose.connect(mongoUrl, { timeoutMS: 10000 });
    console.log('Connected to MongoDB');

    // Create the admin API key
    console.log(`Creating admin key with name: "${adminKeyName}"...`);
    const apiKey = await createApiKey(adminKeyName);

    // Display the created key information
    console.log('\n=== ADMIN API KEY CREATED SUCCESSFULLY ===');
    console.log('⚠️  IMPORTANT: Save this information securely. The secret will not be displayed again! ⚠️\n');
    console.log(`Name: ${apiKey.name}`);
    console.log(`API Key: ${apiKey.key}`);
    console.log(`Secret: ${apiKey.secret}`);
    console.log(`Created: ${apiKey.createdAt}`);
    console.log('\nUse this key for managing other API keys and administrative tasks.');
    console.log('You can use it with the auth system to get a JWT token by creating an HMAC.');
  } catch (error) {
    console.error('Failed to create admin API key:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createAdminKey();
