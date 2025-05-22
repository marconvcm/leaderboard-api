import { Request, Response, NextFunction } from 'express';

export function validate(schema: any, property: 'body' | 'query' | 'params' = 'body') {
   return (req: Request, res: Response, next: NextFunction): void => {
      const { error } = schema.validate(req[property]);
      if (error) {
         res.status(400).json({ error: 'Invalid request', details: error.details });
         return;
      }
      next();
   };
}
