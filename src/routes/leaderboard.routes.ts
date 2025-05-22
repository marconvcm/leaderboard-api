import { Router } from "express";
import { addScore, getLeaderboard } from "../controllers/leaderboard.controller";
import { scoreSchema } from '../models/validation.schema';
import { Request, Response, NextFunction } from 'express';
import { validate } from '../utils/validate';
import { validateApiKey } from '../utils/validateApiKey';

const router = Router();

router.post("/score", validateApiKey, validate(scoreSchema), addScore);
router.get("/", validateApiKey, getLeaderboard);

export default router;