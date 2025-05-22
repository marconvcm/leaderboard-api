import { errorHandler } from './errorHandler';
import logger from './logger';
import { Request, Response, NextFunction } from 'express';

describe('errorHandler', () => {
   let req: Partial<Request>;
   let res: Partial<Response>;
   let next: NextFunction;

   beforeEach(() => {
      req = {};
      res = {
         status: jest.fn().mockReturnThis(),
         json: jest.fn(),
      };
      next = jest.fn();
      // @ts-ignore
      jest.spyOn(logger, 'error').mockImplementation(() => { });
   });

   afterEach(() => {
      jest.restoreAllMocks();
   });

   it('should return 500 and generic message for unknown error', () => {
      const err = { message: 'Something went wrong' };
      (process.env.NODE_ENV as string | undefined) = undefined;
      errorHandler(err, req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
         error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
            message: 'Internal Server Error',
         })
      });
      expect(logger.error).toHaveBeenCalled();
   });

   it('should return custom status and code if provided', () => {
      const err = { status: 404, code: 'NOT_FOUND', message: 'Not found' };
      errorHandler(err, req as Request, res as Response, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
         error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: 'Not found',
         })
      });
   });

   it('should hide details in production', () => {
      process.env.NODE_ENV = 'production';
      const err = { status: 400, code: 'BAD', message: 'bad', details: 'details', stack: 'stack' };
      errorHandler(err, req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalledWith({
         error: expect.objectContaining({
            details: undefined
         })
      });
   });

   it('should show details in non-production', () => {
      process.env.NODE_ENV = 'development';
      const err = { status: 400, code: 'BAD', message: 'bad', details: 'details', stack: 'stack' };
      errorHandler(err, req as Request, res as Response, next);
      expect(res.json).toHaveBeenCalledWith({
         error: expect.objectContaining({
            details: expect.any(String)
         })
      });
   });
});
