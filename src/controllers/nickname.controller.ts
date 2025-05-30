import { Request, Response } from "express";
import NicknameEntry from "../models/nickname.model";
import logger from '../utils/logger';

/**
 * Generate a unique 6-digit hash
 * @returns Promise with a unique 6-digit hash
 */
async function uniqueHash(): Promise<string> {
   let isUnique = false;
   let hash = '';

   while (!isUnique) {
      // Generate a random 6-digit number
      hash = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if it already exists in the database
      const existing = await NicknameEntry.findOne({ hash });
      if (!existing) {
         isUnique = true;
      }
   }

   return hash;
}

/**
 * Create a new nickname entry
 * @route POST /nickname
 */
export async function create(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { nickname, UID } = req.body;
      logger.info('createNickname called', { nickname, UID });

      // Check if UID already exists
      const existingUID = await NicknameEntry.findOne({ UID });
      if (existingUID) {
         res.status(409).json({ error: 'UID already has a nickname assigned' });
         return;
      }

      // Generate a unique hash
      const hash = await uniqueHash();

      // Create a new nickname entry
      const nicknameEntry = new NicknameEntry({
         UID,
         hash,
         nickname
      });

      await nicknameEntry.save();
      logger.info('Nickname created', { nickname, UID, hash });

      res.status(201).json({
         nickname,
         UID,
         hash,
         created: true
      });
   } catch (err: any) {
      logger.error('Error in createNickname', { error: err });

      // Handle validation errors specifically
      if (err.name === 'ValidationError') {
         res.status(400).json({
            error: 'Validation error',
            details: Object.values(err.errors).map((e: any) => e.message)
         });
         return;
      }

      next(err);
   }
}

/**
 * Get a nickname entry by hash
 * @route GET /nickname/:hash
 */
export async function getNicknameByHash(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { hash } = req.params;
      logger.info('getNicknameByHash called', { hash });

      const nicknameEntry = await NicknameEntry.findOne({ hash });
      if (!nicknameEntry) {
         res.status(404).json({ error: 'Nickname not found' });
         return;
      }

      res.status(200).json({
         nickname: nicknameEntry.nickname,
         UID: nicknameEntry.UID,
         hash: nicknameEntry.hash
      });
   } catch (err) {
      logger.error('Error in getNicknameByHash', { error: err });
      next(err);
   }
}

/**
 * Get a nickname entry by UID
 * @route GET /nickname/uid/:uid
 */
export async function getNicknameByUID(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { uid } = req.params;
      logger.info('getNicknameByUID called', { uid });

      const nicknameEntry = await NicknameEntry.findOne({ UID: uid });
      if (!nicknameEntry) {
         res.status(404).json({ error: 'No nickname found for this UID' });
         return;
      }

      res.status(200).json({
         nickname: nicknameEntry.nickname,
         UID: nicknameEntry.UID,
         hash: nicknameEntry.hash
      });
   } catch (err) {
      logger.error('Error in getNicknameByUID', { error: err });
      next(err);
   }
}

/**
 * Update a nickname entry
 * @route PUT /nickname/:hash
 */
export async function update(req: Request, res: Response, next: Function): Promise<void> {
   try {
      const { hash } = req.params;
      const { nickname } = req.body;
      
      logger.info('updateNickname called', { hash, nickname });

      // Check if the hash exists
      const nicknameEntry = await NicknameEntry.findOne({ hash });
      if (!nicknameEntry) {
         res.status(404).json({ error: 'Nickname not found' });
         return;
      }

      // Update the nickname
      nicknameEntry.nickname = nickname;
      
      // Validate before saving
      try {
         await nicknameEntry.validate();
      } catch (validationError: any) {
         res.status(400).json({
            error: 'Validation error',
            details: Object.values(validationError.errors).map((e: any) => e.message)
         });
         return;
      }
      
      // Save the updated entry
      await nicknameEntry.save();
      
      logger.info('Nickname updated', { hash, nickname });

      res.status(200).json({
         nickname: nicknameEntry.nickname,
         UID: nicknameEntry.UID,
         hash: nicknameEntry.hash,
         updated: true
      });
   } catch (err) {
      logger.error('Error in updateNickname', { error: err });
      next(err);
   }
}
