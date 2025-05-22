import mongoose from 'mongoose';
import * as apiKeyService from './apiKey.service';
import ApiKey from '../models/apiKey.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('ApiKeyService', () => {
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
    it('should create an API key with a generated key and secret', async () => {
      const name = 'Test API Key';
      const apiKey = await apiKeyService.createApiKey(name);

      expect(apiKey).toBeDefined();
      expect(apiKey.name).toBe(name);
      expect(apiKey.key).toBeDefined();
      expect(apiKey.secret).toBeDefined();
      expect(apiKey.enabled).toBe(true);
      expect(apiKey.createdAt).toBeInstanceOf(Date);

      // Check that it was saved to the database
      const savedKey = await ApiKey.findById(apiKey._id);
      expect(savedKey).toBeDefined();
      expect(savedKey?.name).toBe(name);
    });
  });

  describe('getApiKey', () => {
    it('should retrieve an API key by its key string', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Retrieve it
      const retrievedKey = await apiKeyService.getApiKey(createdKey.key);
      
      expect(retrievedKey).toBeDefined();
      expect(retrievedKey?.key).toBe(createdKey.key);
      expect(retrievedKey?.name).toBe('Test Key');
    });

    it('should return null for non-existent keys', async () => {
      const result = await apiKeyService.getApiKey('non-existent-key');
      expect(result).toBeNull();
    });

    it('should not return disabled keys', async () => {
      // Create and then disable a key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      await apiKeyService.disableApiKey(createdKey.key);
      
      // Try to retrieve it
      const retrievedKey = await apiKeyService.getApiKey(createdKey.key);
      
      expect(retrievedKey).toBeNull();
    });
  });

  describe('getAllApiKeys', () => {
    it('should retrieve all API keys without secrets', async () => {
      // Create multiple test keys
      await apiKeyService.createApiKey('Key 1');
      await apiKeyService.createApiKey('Key 2');
      
      const keys = await apiKeyService.getAllApiKeys();
      
      expect(keys.length).toBe(2);
      expect(keys[0].name).toBeDefined();
      expect(keys[0].secret).toBeUndefined(); // Secret should be excluded
      expect(keys[1].name).toBeDefined();
      expect(keys[1].secret).toBeUndefined(); // Secret should be excluded
    });
  });

  describe('updateLastUsed', () => {
    it('should update the lastUsed timestamp', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Update last used time
      const updatedKey = await apiKeyService.updateLastUsed(createdKey.key);
      
      expect(updatedKey).toBeDefined();
      expect(updatedKey?.lastUsed).toBeInstanceOf(Date);
    });
  });

  describe('disableApiKey', () => {
    it('should disable an API key', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Disable it
      const disabledKey = await apiKeyService.disableApiKey(createdKey.key);
      
      expect(disabledKey).toBeDefined();
      expect(disabledKey?.enabled).toBe(false);
      
      // Verify it's disabled in the database
      const storedKey = await ApiKey.findOne({ key: createdKey.key });
      expect(storedKey?.enabled).toBe(false);
    });
  });

  describe('deleteApiKey', () => {
    it('should delete an API key', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Delete it
      const result = await apiKeyService.deleteApiKey(createdKey.key);
      
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(1);
      
      // Verify it's gone from the database
      const storedKey = await ApiKey.findOne({ key: createdKey.key });
      expect(storedKey).toBeNull();
    });
  });

  describe('verifyApiKey', () => {
    it('should return true for valid key/secret pair', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Verify it
      const isValid = await apiKeyService.verifyApiKey(createdKey.key, createdKey.secret);
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid secret', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Try to verify with wrong secret
      const isValid = await apiKeyService.verifyApiKey(createdKey.key, 'wrong-secret');
      
      expect(isValid).toBe(false);
    });

    it('should return false for non-existent key', async () => {
      const isValid = await apiKeyService.verifyApiKey('non-existent-key', 'any-secret');
      expect(isValid).toBe(false);
    });

    it('should update lastUsed when verifying', async () => {
      // Create a test key
      const createdKey = await apiKeyService.createApiKey('Test Key');
      
      // Initially, lastUsed should be undefined
      expect(createdKey.lastUsed).toBeUndefined();
      
      // Verify the key
      await apiKeyService.verifyApiKey(createdKey.key, createdKey.secret);
      
      // Check that lastUsed was updated
      const updatedKey = await ApiKey.findOne({ key: createdKey.key });
      expect(updatedKey?.lastUsed).toBeDefined();
    });
  });
});
