import { Request, Response } from "express";
import ScoreSegment from "../models/score.model";
import logger from '../utils/logger';

export async function addScore(req: Request, res: Response, next: Function): Promise<void> {
   const { username, score } = req.body;
   logger.info('addScore called', { username, score });
   try {
      let segment = await ScoreSegment.findOne({ apiKey: req.header('x-api-key') });
      const entry = { score, timestamp: new Date() };
      if (!segment) {
         logger.info('Creating new segment', { apiKey: req.header('x-api-key'), username, score });
         segment = await ScoreSegment.create({
            apiKey: req.header('x-api-key'),
            users: { [username]: { topScore: score, entries: [entry] } }
         });
      } else {
         logger.info('Updating user score', { apiKey: req.header('x-api-key'), username, score });
         const user = segment.users.get(username) || { topScore: score, entries: [] };
         (user.entries as any[]).push(entry);
         user.topScore = Math.max(user.topScore, score);
         segment.users.set(username, user);
         await segment.save();
      }
      logger.info('Score added/updated', { apiKey: req.header('x-api-key'), username, score });
      res.status(201).json({ success: true });
   } catch (err) {
      logger.error('Error in addScore', { error: err });
      (err as any).status = 500;
      (err as any).code = 'INTERNAL_ERROR';
      next(err);
   }
}

export async function getLeaderboard(req: Request, res: Response, next: Function): Promise<void> {
   const limit = Number(req.query.limit) || 10;
   logger.info('getLeaderboard called', { apiKey: req.header('x-api-key'), limit });
   try {
      const segment = await ScoreSegment.findOne({ apiKey: req.header('x-api-key') });
      if (!segment) {
         logger.info('No segment found for API key', { apiKey: req.header('x-api-key') });
         res.json([]);
         return;
      }

      // Sort users by topScore descending
      const leaderboard = Array.from(segment.users.entries())
         .map(([username, data]: any) => ({ username, score: data.topScore }))
         .sort((a, b) => b.score - a.score)
         .slice(0, limit);

      logger.info('Leaderboard returned', { apiKey: req.header('x-api-key'), count: leaderboard.length });
      res.json(leaderboard);
   } catch (err) {
      logger.error('Error in getLeaderboard', { error: err });
      (err as any).status = 500;
      (err as any).code = 'INTERNAL_ERROR';
      next(err);
   }
}
