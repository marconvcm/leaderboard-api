import { Request, Response, NextFunction } from "express";
import logger from './logger';

/**
 * Basic authentication middleware for Swagger UI
 */
export function basicAuth(req: Request, res: Response, next: NextFunction): void {
   // Skip auth for the favicon or CSS/JS resources
   if (req.path.includes('favicon') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.png')) {
      return next();
   }

   // Get auth header
   const authHeader = req.headers.authorization;

   if (!authHeader || !authHeader.startsWith('Basic ')) {
      // No auth header or not basic auth
      logger.info('Unauthorized access attempt to Swagger UI');
      res.set('WWW-Authenticate', 'Basic realm="Leaderboard API Documentation"');
      res.status(401).send('Authentication required for API documentation');
      return;
   }

   // Basic auth header format: "Basic base64(username:password)"
   const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
   const [username, password] = credentials.split(':');

   // Check against environment variables or use defaults for development
   const expectedUsername = process.env.SWAGGER_USERNAME || 'admin';
   const expectedPassword = process.env.SWAGGER_PASSWORD || 'apidocs';

   if (username === expectedUsername && password === expectedPassword) {
      logger.info('Successful Swagger UI authentication');
      next();
   } else {
      logger.warn('Failed Swagger UI authentication attempt', { username });
      res.set('WWW-Authenticate', 'Basic realm="Leaderboard API Documentation"');
      res.status(401).send('Invalid credentials');
   }
}
