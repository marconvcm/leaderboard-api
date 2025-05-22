import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKey.service';
import logger from './logger';

/**
 * Middleware that validates a provided API key against the database
 * This differs from other auth methods as it accepts the API key as a parameter
 * rather than extracting it from the request
 * 
 * @param apiKey The API key to validate
 * @returns Express middleware function
 */
export function validateApiKey(apiKey: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Skip validation if no API key was provided to the middleware
      if (!apiKey) {
        logger.error('No API key provided to validateApiKey middleware');
        res.status(401).json({ error: 'API key required' });
        return;
      }

      // Check if the API key exists and is enabled
      const apiKeyRecord = await apiKeyService.getApiKey(apiKey);
      
      if (!apiKeyRecord) {
        logger.warn('Invalid API key used', { apiKey });
        res.status(401).json({ error: 'Invalid API key' });
        return; 
      }

      // Update last used timestamp
      await apiKeyService.updateLastUsed(apiKey);
      
      // Add the API key to the request for use in subsequent middleware or route handlers
      // This is using type assertion to add the apiKey property
      (req as any).apiKey = apiKey;
      
      // Continue to the next middleware or route handler
      next();
    } catch (error) {
      logger.error('Error validating API key', { error, apiKey });
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

export default validateApiKey;