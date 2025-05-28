import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
   const ready = mongoose.connection.readyState === 1;
   res.status(200).json({
      live: true,
      ready,
      version: process.env.GIT_COMMIT || process.env.RENDER_GIT_COMMIT || 'development',
   });
});

export default router;
