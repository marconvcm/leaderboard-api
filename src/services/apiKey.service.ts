import crypto from 'crypto';
import ApiKey, { IApiKey } from '../models/apiKey.model';
import logger from '../utils/logger';

/**
 * Generate a new API key and secret
 * @param name Descriptive name for the API key
 * @returns Promise with the created API key object
 */
export async function createApiKey(name: string): Promise<IApiKey> {
   try {
      // Generate a random API key and secret
      const key = crypto.randomBytes(16).toString('hex');
      const secret = crypto.randomBytes(32).toString('hex');

      const apiKey = new ApiKey({
         key,
         secret,
         name,
         createdAt: new Date(),
         enabled: true
      });

      await apiKey.save();
      logger.info('API key created', { name, key });

      return apiKey;
   } catch (error) {
      logger.error('Error creating API key', { error, name });
      throw error;
   }
}

/**
 * Get an API key by its key string
 * @param key API key string
 * @returns Promise with the API key object or null if not found
 */
export async function getApiKey(key: string): Promise<IApiKey | null> {
   try {
      return await ApiKey.findOne({ key, enabled: true });
   } catch (error) {
      logger.error('Error fetching API key', { error, key });
      throw error;
   }
}

/**
 * Get all API keys
 * @returns Promise with array of API key objects
 */
export async function getAllApiKeys(): Promise<IApiKey[]> {
   try {
      return await ApiKey.find({}).select('-secret');
   } catch (error) {
      logger.error('Error fetching all API keys', { error });
      throw error;
   }
}

/**
 * Update an API key's last used timestamp
 * @param key API key string
 * @returns Promise with the updated API key or null if not found
 */
export async function updateLastUsed(key: string): Promise<IApiKey | null> {
   try {
      return await ApiKey.findOneAndUpdate(
         { key },
         { lastUsed: new Date() },
         { new: true }
      );
   } catch (error) {
      logger.error('Error updating API key last used time', { error, key });
      throw error;
   }
}

/**
 * Disable an API key
 * @param key API key string
 * @returns Promise with the disabled API key or null if not found
 */
export async function disableApiKey(key: string): Promise<IApiKey | null> {
   try {
      return await ApiKey.findOneAndUpdate(
         { key },
         { enabled: false },
         { new: true }
      );
   } catch (error) {
      logger.error('Error disabling API key', { error, key });
      throw error;
   }
}

/**
 * Delete an API key
 * @param key API key string
 * @returns Promise with the deletion result
 */
export async function deleteApiKey(key: string): Promise<{ acknowledged: boolean; deletedCount: number }> {
   try {
      const result = await ApiKey.deleteOne({ key });
      return {
         acknowledged: result.acknowledged,
         deletedCount: result.deletedCount
      };
   } catch (error) {
      logger.error('Error deleting API key', { error, key });
      throw error;
   }
}

/**
 * Verify if an API key and secret are valid
 * @param key API key string
 * @param secret Secret to verify
 * @returns Promise<boolean> True if valid, false otherwise
 */
export async function verifyApiKey(key: string, secret: string): Promise<boolean> {
   try {
      const apiKey = await getApiKey(key);
      if (!apiKey) return false;

      // Update last used time
      await updateLastUsed(key);

      // Compare secrets
      return apiKey.secret === secret;
   } catch (error) {
      logger.error('Error verifying API key', { error, key });
      throw error;
   }
}


