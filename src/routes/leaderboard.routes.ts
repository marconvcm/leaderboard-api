import { Router } from "express";
import { addScore, getLeaderboard } from "../controllers/leaderboard.controller";
import { scoreSchema } from '../models/validation.schema';
import { validate } from '../utils/validate';
import { validateApiKey } from '../utils/validateApiKey';
import { requireAuth } from '../utils/requireAuth';

const router = Router();

router.post("/score", validateApiKey, requireAuth, validate(scoreSchema), addScore);
router.get("/", validateApiKey, requireAuth, getLeaderboard);

export default router;