import { Request, Response, NextFunction } from 'express';
import * as apiKeyService from '../services/apiKey.service';
import logger from '../utils/logger';

/**
 * Create a new API key
 * @route POST /admin/api-keys
 */
export async function createApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({ error: 'API key name is required' });
      return;
    }
    
    const apiKey = await apiKeyService.createApiKey(name);

    // Return the full object including secret only when first created
    res.status(201).json(apiKey);
  } catch (error) {
    logger.error('Error creating API key', { error });
    next(error);
  }
}

/**
 * Get all API keys
 * @route GET /admin/api-keys
 */
export async function getAllApiKeys(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const apiKeys = await apiKeyService.getAllApiKeys();
    res.json(apiKeys);
  } catch (error) {
    logger.error('Error getting API keys', { error });
    next(error);
  }
}

/**
 * Get a specific API key
 * @route GET /admin/api-keys/:key
 */
export async function getApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const apiKey = await apiKeyService.getApiKey(key);
    
    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }
    
    // Don't return the secret for security reasons
    const { secret, ...safeApiKey } = apiKey.toObject();
    res.json(safeApiKey);
  } catch (error) {
    logger.error('Error getting API key', { error });
    next(error);
  }
}

/**
 * Disable an API key
 * @route PATCH /admin/api-keys/:key/disable
 */
export async function disableApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const apiKey = await apiKeyService.disableApiKey(key);
    
    if (!apiKey) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }
    
    res.json({ message: 'API key disabled successfully' });
  } catch (error) {
    logger.error('Error disabling API key', { error });
    next(error);
  }
}

/**
 * Delete an API key
 * @route DELETE /admin/api-keys/:key
 */
export async function deleteApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { key } = req.params;
    const result = await apiKeyService.deleteApiKey(key);
    
    if (result.deletedCount === 0) {
      res.status(404).json({ error: 'API key not found' });
      return;
    }
    
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    logger.error('Error deleting API key', { error });
    next(error);
  }
}
