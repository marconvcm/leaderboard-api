import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from './requireAuth';

describe('requireAuth middleware', () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  const JWT_SECRET = 'supersecret';
  const validToken = jwt.sign({ apiKey: 'test-api-key' }, JWT_SECRET);

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should call next() when a valid token is provided', () => {
    (req.header as jest.Mock).mockReturnValue(`Bearer ${validToken}`);
    
    requireAuth(req as AuthRequest, res as Response, next);
    
    expect(next).toHaveBeenCalled();
    expect(req.auth).toBeDefined();
    expect(req.auth!.apiKey).toBe('test-api-key');
  });

  it('should return 401 when no Authorization header is provided', () => {
    (req.header as jest.Mock).mockReturnValue(undefined);
    
    requireAuth(req as AuthRequest, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header is not in Bearer format', () => {
    (req.header as jest.Mock).mockReturnValue('Basic abc123');
    
    requireAuth(req as AuthRequest, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is invalid', () => {
    (req.header as jest.Mock).mockReturnValue('Bearer invalid.token.here');
    
    requireAuth(req as AuthRequest, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when token is expired', () => {
    // Create an expired token
    const expiredToken = jwt.sign(
      { apiKey: 'test-api-key' },
      JWT_SECRET,
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );
    
    (req.header as jest.Mock).mockReturnValue(`Bearer ${expiredToken}`);
    
    requireAuth(req as AuthRequest, res as Response, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token expired' });
    expect(next).not.toHaveBeenCalled();
  });
});
