import { Request, Response, NextFunction } from 'express';
import { apiKeyValidation } from './apiKeyValidation';
import logger from './logger';

export async function validateApiKey(req: Request, res: Response, next: NextFunction) {
   const apiKey = req.header('x-api-key');
   
   if (!apiKey) {
      logger.warn('Missing API key', { path: req.path });
      const err: any = new Error('Missing API key in header (x-api-key)');
      err.status = 401;
      err.code = 'MISSING_API_KEY';
      return next(err);
   }
   
   const isValid = await apiKeyValidation(apiKey);
   if (!isValid) {
      logger.warn('Invalid API key', { apiKey: apiKey.substring(0, 4) + '***', path: req.path });
      const err: any = new Error('Invalid API key');
      err.status = 401;
      err.code = 'INVALID_API_KEY';
      return next(err);
   }
   
   // Add the API key to the request for potential later use
   (req as any).apiKey = apiKey;
   next();
}
