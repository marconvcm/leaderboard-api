import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// Challenge with timeout data structure
interface ChallengeData {
  challenge: string;
  timeout: NodeJS.Timeout;
}

// In-memory store for demo (use Redis or DB in production)
const challengeStore = new Map<string, ChallengeData>();

// Example: API key/secret pairs (in production, store securely)
const apiClients: Record<string, string> = {
   'demo-api-key': 'demo-secret',
   'test-api-key': 'test-secret',
};

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const JWT_EXPIRES_IN = '1h';

export function requestChallenge(req: Request, res: Response, next: Function): void {
   try {
      const { apiKey } = req.body;
      if (!apiKey || !apiClients[apiKey]) {
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
      next(err);
   }
}

export function verifyHmac(req: Request, res: Response, next: Function): void {
   try {
      const { apiKey, requestId, challenge, hmac } = req.body;
      
      if (!requestId || !challengeStore.has(requestId)) {
         res.status(401).json({ error: 'Invalid or expired request' });
         return;
      }
      
      const secret = apiClients[apiKey];
      const challengeData = challengeStore.get(requestId)!;
      
      if (!secret || challengeData.challenge !== challenge) {
         res.status(401).json({ error: 'Invalid challenge or API key' });
         return;
      }
      
      const expectedHmac = crypto.createHmac('sha256', secret).update(challenge).digest('hex');
      if (hmac !== expectedHmac) {
         res.status(401).json({ error: 'Invalid HMAC' });
         return;
      }
      
      // Clean up challenge data and timeout
      clearTimeout(challengeData.timeout);
      challengeStore.delete(requestId);
      
      const token = jwt.sign({ apiKey }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      res.json({ token });
   } catch (err) {
      next(err);
   }
}
