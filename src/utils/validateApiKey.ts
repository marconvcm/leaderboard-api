import { Request, Response, NextFunction } from 'express';
import { apiKeyValidation } from './apiKeyValidation';
import logger from './logger';

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
   const apiKey = req.header('x-api-key');
   const isValid = await apiKeyValidation(apiKey || '');
   if (!apiKey || !isValid) {
      logger.warn('Invalid or missing API key', { apiKey });
      const err: any = new Error('Missing or invalid API key in header (x-api-key)');
      err.status = 400;
      err.code = 'INVALID_API_KEY';
      return next(err);
   }
   next();
}
