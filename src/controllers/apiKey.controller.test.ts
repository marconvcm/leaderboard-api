import request from 'supertest';
import express from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import ApiKey from '../models/apiKey.model';
import * as ApiKeyController from './apiKey.controller';

// Mock the logger to avoid console output during tests
jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
}));

const app = express();
app.use(express.json());
app.post('/admin/api-keys', ApiKeyController.createApiKey);
app.get('/admin/api-keys', ApiKeyController.getAllApiKeys);
app.get('/admin/api-keys/:key', ApiKeyController.getApiKey);
app.patch('/admin/api-keys/:key/disable', ApiKeyController.disableApiKey);
app.delete('/admin/api-keys/:key', ApiKeyController.deleteApiKey);

describe('ApiKeyController', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Set up in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the database before each test
    await ApiKey.deleteMany({});
  });

  describe('createApiKey', () => {
    it('should create a new API key with the provided name', async () => {
      const res = await request(app)
        .post('/admin/api-keys')
        .send({ name: 'Test API Key' });
      
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Test API Key');
      expect(res.body.key).toBeDefined();
      expect(res.body.secret).toBeDefined(); // Secret should be returned only on creation
      expect(res.body.enabled).toBe(true);
      
      // Verify it was saved in the database
      const apiKeysInDb = await ApiKey.find({});
      expect(apiKeysInDb).toHaveLength(1);
      expect(apiKeysInDb[0].name).toBe('Test API Key');
    });

    it('should return 400 if name is not provided', async () => {
      const res = await request(app)
        .post('/admin/api-keys')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('API key name is required');
      
      // Verify nothing was saved in the database
      const apiKeysInDb = await ApiKey.find({});
      expect(apiKeysInDb).toHaveLength(0);
    });
  });

  describe('getAllApiKeys', () => {
    it('should return all API keys without secrets', async () => {
      // Create two API keys in the database
      const key1 = new ApiKey({
        name: 'Key 1',
        key: 'test-key-1',
        secret: 'test-secret-1',
        enabled: true
      });
      
      const key2 = new ApiKey({
        name: 'Key 2',
        key: 'test-key-2',
        secret: 'test-secret-2',
        enabled: true
      });
      
      await key1.save();
      await key2.save();
      
      const res = await request(app).get('/admin/api-keys');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].key).toBeDefined();
      expect(res.body[0].secret).toBeUndefined(); // Secret should not be returned
      expect(res.body[1].name).toBeDefined();
      expect(res.body[1].key).toBeDefined();
      expect(res.body[1].secret).toBeUndefined(); // Secret should not be returned
    });

    it('should return an empty array when no API keys exist', async () => {
      const res = await request(app).get('/admin/api-keys');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('getApiKey', () => {
    it('should return a specific API key without the secret', async () => {
      // Create an API key in the database
      const key = new ApiKey({
        name: 'Test Key',
        key: 'test-key',
        secret: 'test-secret',
        enabled: true
      });
      
      await key.save();
      
      const res = await request(app).get('/admin/api-keys/test-key');
      
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Test Key');
      expect(res.body.key).toBe('test-key');
      expect(res.body.secret).toBeUndefined(); // Secret should not be returned
    });

    it('should return 404 for non-existent API key', async () => {
      const res = await request(app).get('/admin/api-keys/non-existent-key');
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('API key not found');
    });
  });

  describe('disableApiKey', () => {
    it('should disable an API key', async () => {
      // Create an API key in the database
      const key = new ApiKey({
        name: 'Test Key',
        key: 'test-key',
        secret: 'test-secret',
        enabled: true
      });
      
      await key.save();
      
      const res = await request(app).patch('/admin/api-keys/test-key/disable');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('API key disabled successfully');
      
      // Verify it was updated in the database
      const updatedKey = await ApiKey.findOne({ key: 'test-key' });
      expect(updatedKey?.enabled).toBe(false);
    });

    it('should return 404 for non-existent API key', async () => {
      const res = await request(app).patch('/admin/api-keys/non-existent-key/disable');
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('API key not found');
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key', async () => {
      // Create an API key in the database
      const key = new ApiKey({
        name: 'Test Key',
        key: 'test-key',
        secret: 'test-secret',
        enabled: true
      });
      
      await key.save();
      
      const res = await request(app).delete('/admin/api-keys/test-key');
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('API key deleted successfully');
      
      // Verify it was deleted from the database
      const deletedKey = await ApiKey.findOne({ key: 'test-key' });
      expect(deletedKey).toBeNull();
    });

    it('should return 404 for non-existent API key', async () => {
      const res = await request(app).delete('/admin/api-keys/non-existent-key');
      
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('API key not found');
    });
  });
});
