import { Router } from "express";
import { addScore, getLeaderboard, getTopScore } from "../controllers/leaderboard.controller";
import { scoreSchema, userSchema } from '../models/validation.schema';
import { validate } from '../utils/validate';
import { validateApiKey } from '../utils/validateApiKey';
import { requireAuth } from '../utils/requireAuth';

const router = Router();

router.post("/top-score", validateApiKey, requireAuth, validate(userSchema), getTopScore);
router.post("/score", validateApiKey, requireAuth, validate(scoreSchema), addScore);
router.get("/", validateApiKey, requireAuth, getLeaderboard);

export default router;