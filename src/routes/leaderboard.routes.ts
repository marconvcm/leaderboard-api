import { Router } from "express";
import { addScore, getLeaderboard } from "../controllers/leaderboard.controller";
import { scoreSchema } from '../models/validation.schema';
import { validate } from '../utils/validate';
import { validateApiKey } from '../utils/validateApiKey';
import { requireAuth } from '../utils/requireAuth';

const router = Router();

// Routes that use API key validation (legacy method)
router.post("/score", validateApiKey, validate(scoreSchema), addScore);
router.get("/", validateApiKey, getLeaderboard);

// Routes that use JWT authentication (new method)
// These routes have the same functionality but require a JWT token
router.post("/v2/score", requireAuth, validate(scoreSchema), addScore);
router.get("/v2", requireAuth, getLeaderboard);

export default router;