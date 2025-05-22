import { Request, Response } from 'express';
import { basicAuth } from './swaggerAuth';

describe('swaggerAuth middleware', () => {
   let req: Partial<Request>;
   let res: Partial<Response>;
   let next: jest.Mock;

   const originalEnv = process.env;

   beforeEach(() => {
      req = {
         headers: {},
         path: '/docs'
      };
      res = {
         status: jest.fn().mockReturnThis(),
         send: jest.fn(),
         set: jest.fn()
      };
      next = jest.fn();

      // Set default test credentials
      process.env.SWAGGER_USERNAME = 'testuser';
      process.env.SWAGGER_PASSWORD = 'testpass';
   });

   afterEach(() => {
      process.env = originalEnv;
   });

   it('should call next() for static resources', () => {
      // @ts-ignore
      req.path = '/docs/swagger-ui.css';
      basicAuth(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
   });

   it('should return 401 when no authorization header is provided', () => {
      basicAuth(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.any(String));
      expect(next).not.toHaveBeenCalled();
   });

   it('should return 401 when invalid credentials are provided', () => {
      const invalidCreds = Buffer.from('wronguser:wrongpass').toString('base64');
      req.headers = { authorization: `Basic ${invalidCreds}` };
      basicAuth(req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
   });

   it('should call next() when valid credentials are provided', () => {
      const validCreds = Buffer.from('testuser:testpass').toString('base64');
      req.headers = { authorization: `Basic ${validCreds}` };
      basicAuth(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
   });

   it('should use default credentials when environment variables are not set', () => {
      delete process.env.SWAGGER_USERNAME;
      delete process.env.SWAGGER_PASSWORD;

      const defaultCreds = Buffer.from('admin:apidocs').toString('base64');
      req.headers = { authorization: `Basic ${defaultCreds}` };
      basicAuth(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
   });
});
