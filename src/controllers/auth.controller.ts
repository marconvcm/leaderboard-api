import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import * as apiKeyService from '../services/apiKey.service';
import logger from '../utils/logger';

// Challenge with timeout data structure
interface ChallengeData {
   challenge: string;
   timeout: NodeJS.Timeout;
}

// In-memory store for demo (use Redis or DB in production)
const challengeStore = new Map<string, ChallengeData>();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export async function requestChallenge(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { apiKey } = req.body;

      // Check if API key exists
      const apiKeyRecord = await apiKeyService.getApiKey(apiKey);
      if (!apiKey || !apiKeyRecord) {
         res.status(401).json({ error: 'Invalid API key' });
         return;
      }

      // Generate a unique request ID to avoid collisions between requests from same client
      const requestId = `${apiKey}-${crypto.randomBytes(8).toString('hex')}`;
      const challenge = crypto.randomBytes(32).toString('hex');

      // Clean up any existing challenge with this ID (shouldn't happen, but just in case)
      if (challengeStore.has(requestId)) {
         const existingData = challengeStore.get(requestId)!;
         clearTimeout(existingData.timeout);
      }

      // Set up timeout to auto-expire challenge
      const timeout = setTimeout(() => {
         challengeStore.delete(requestId);
      }, 5 * 60 * 1000); // expire in 5 min

      // Store challenge data with its timeout
      challengeStore.set(requestId, { challenge, timeout });

      res.json({
         challenge,
         requestId // Include requestId in response for client to use in verification
      });
   } catch (err) {
      logger.error('Error in requestChallenge', { error: err });
      next(err);
   }
}

export async function verifyHmac(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { apiKey, requestId, challenge, hmac } = req.body;

      if (!requestId || !challengeStore.has(requestId)) {
         res.status(401).json({ error: 'Invalid or expired request' });
         return;
      }

      // Get API key from database
      const apiKeyRecord = await apiKeyService.getApiKey(apiKey);
      if (!apiKeyRecord) {
         res.status(401).json({ error: 'Invalid API key' });
         return;
      }

      const secret = apiKeyRecord.secret;
      const challengeData = challengeStore.get(requestId)!;

      if (challengeData.challenge !== challenge) {
         res.status(401).json({ error: 'Invalid challenge' });
         return;
      }

      const expectedHmac = crypto.createHmac('sha256', secret).update(challenge).digest('base64');
      if (hmac !== expectedHmac) {
         res.status(401).json({ error: 'Invalid HMAC' });
         return;
      }

      // Clean up challenge data and timeout
      clearTimeout(challengeData.timeout);
      challengeStore.delete(requestId);

      // Update last used timestamp
      await apiKeyService.updateLastUsed(apiKey);

      const token = jwt.sign({ apiKey }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.json({ token });
   } catch (err) {
      logger.error('Error in verifyHmac', { error: err });
      next(err);
   }
}
