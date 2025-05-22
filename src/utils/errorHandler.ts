import { Request, Response, NextFunction } from 'express';
import logger from './logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
   logger.error('Unhandled error', { error: err });
   const status = err.status || 500;
   const errorResponse = {
      error: {
         code: err.code || 'INTERNAL_ERROR',
         message: status === 500 ? 'Internal Server Error' : err.message,
         details: process.env.NODE_ENV === 'production' ? undefined : err.details || err.stack,
      }
   };
   res.status(status).json(errorResponse);
}
