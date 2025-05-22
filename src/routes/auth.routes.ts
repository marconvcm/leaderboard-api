import express from 'express';
import { requestChallenge, verifyHmac } from '../controllers/auth.controller';

const router = express.Router();

router.post('/challenge', (req, res, next) => requestChallenge(req, res, next));
router.post('/verify', (req, res, next) => verifyHmac(req, res, next));

export default router;
