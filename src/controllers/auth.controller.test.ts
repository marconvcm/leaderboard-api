import request from 'supertest';
import express from 'express';
import * as AuthController from './auth.controller';
import * as apiKeyService from '../services/apiKey.service';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import ApiKey from '../models/apiKey.model';

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

const app = express();
app.use(express.json());
app.post('/challenge', AuthController.requestChallenge);
app.post('/verify', AuthController.verifyHmac);

describe('AuthController', () => {
  let mongoServer: MongoMemoryServer;
  const apiKey = 'demo-api-key';
  const secret = 'demo-secret';

  beforeAll(async () => {
    // Set up in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Create a test API key in the database
    const testApiKey = new ApiKey({
      key: apiKey,
      secret: secret,
      name: 'Demo API Key',
      enabled: true
    });
    await testApiKey.save();
  });

  afterAll(async () => {
    await ApiKey.deleteMany({});
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('requestChallenge', () => {
    it('should return a challenge and requestId for a valid API key', async () => {
      const res = await request(app)
        .post('/challenge')
        .send({ apiKey });
      expect(res.status).toBe(200);
      expect(res.body.challenge).toBeDefined();
      expect(res.body.requestId).toBeDefined();
      expect(typeof res.body.challenge).toBe('string');
      expect(typeof res.body.requestId).toBe('string');
    });

    it('should return 401 for an invalid API key', async () => {
      const res = await request(app)
        .post('/challenge')
        .send({ apiKey: 'invalid-key' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid API key');
    });
  });

  describe('verifyHmac', () => {
    it('should return a JWT for valid challenge and HMAC and clear timeout', async () => {
      // Get challenge
      const challengeRes = await request(app)
        .post('/challenge')
        .send({ apiKey });
      const challenge = challengeRes.body.challenge;
      const requestId = challengeRes.body.requestId;
      
      // Compute HMAC
      const crypto = require('crypto');
      const hmac = crypto.createHmac('sha256', secret).update(challenge).digest('hex');
      
      // Spy on clearTimeout
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      // Mock updateLastUsed to track calls
      const updateLastUsedSpy = jest.spyOn(apiKeyService, 'updateLastUsed');
      
      // Verify
      const verifyRes = await request(app)
        .post('/verify')
        .send({ apiKey, requestId, challenge, hmac });
      
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.token).toBeDefined();
      expect(typeof verifyRes.body.token).toBe('string');
      
      // Timeout should be cleared
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      // Last used should be updated
      expect(updateLastUsedSpy).toHaveBeenCalledWith(apiKey);
      
      clearTimeoutSpy.mockRestore();
      updateLastUsedSpy.mockRestore();
    });

    it('should return 401 for invalid or missing requestId', async () => {
      const res = await request(app)
        .post('/verify')
        .send({ apiKey, challenge: 'test', hmac: 'test' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid or expired request');
    });

    it('should return 401 for invalid challenge', async () => {
      // Get challenge and requestId
      const challengeRes = await request(app)
        .post('/challenge')
        .send({ apiKey });
      const requestId = challengeRes.body.requestId;
      
      // Send with wrong challenge
      const verifyRes = await request(app)
        .post('/verify')
        .send({ apiKey, requestId, challenge: 'wrong', hmac: 'wrong' });
      
      expect(verifyRes.status).toBe(401);
      expect(verifyRes.body.error).toBe('Invalid challenge');
    });

    it('should return 401 for invalid HMAC', async () => {
      // Get challenge
      const challengeRes = await request(app)
        .post('/challenge')
        .send({ apiKey });
      const challenge = challengeRes.body.challenge;
      const requestId = challengeRes.body.requestId;
      
      // Use wrong HMAC
      const verifyRes = await request(app)
        .post('/verify')
        .send({ apiKey, requestId, challenge, hmac: 'wrong' });
      
      expect(verifyRes.status).toBe(401);
      expect(verifyRes.body.error).toBe('Invalid HMAC');
    });
  });
});
