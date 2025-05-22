import dotenv from 'dotenv';
import * as apiKeyService from '../services/apiKey.service';
import logger from './logger';
dotenv.config();

export async function apiKeyValidation(apiKey: string): Promise<boolean> {
   try {
      // Get the API key from the database
      const apiKeyRecord = await apiKeyService.getApiKey(apiKey);
      
      // If no API key found or it's disabled, return false
      if (!apiKeyRecord || !apiKeyRecord.enabled) {
         return false;
      }
      
      // Update the last used timestamp
      await apiKeyService.updateLastUsed(apiKey);
      
      return true;
   } catch (error) {
      logger.error('Error validating API key', { error, apiKey: apiKey.substring(0, 4) + '***' });
      return false;
   }
}
