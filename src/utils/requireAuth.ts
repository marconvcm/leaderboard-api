import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from './logger';

// JWT secret should match the one used in auth controller
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export interface AuthRequest extends Request {
  auth?: {
    apiKey: string;
    // Can be extended with more properties as needed
  };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    // Check if Authorization header is present and in correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.substring(7);
    
    // Verify the token
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        logger.error('JWT verification failed', { error: err.message });
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(401).json({ error: 'Invalid token' });
      }
      
      // Token is valid, set auth information on the request
      req.auth = decoded as { apiKey: string };
      next();
    });
  } catch (err) {
    logger.error('Auth middleware error', { error: err });
    res.status(500).json({ error: 'Authentication error' });
  }
}
