import { Router } from "express";
import { create, getNicknameByHash, getNicknameByUID, update } from "../controllers/nickname.controller";
import { nicknameSchema, updateNicknameSchema } from '../models/validation.schema';
import { validate } from '../utils/validate';
import { validateApiKey } from '../utils/validateApiKey';
import { requireAuth } from "../utils/requireAuth";

const router = Router();

/**
 * @swagger
 * /nickname:
 *   post:
 *     summary: Create a new nickname
 *     tags: [Nickname]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: The nickname (exactly 10 characters, alphanumeric plus _ and -)
 *               UID:
 *                 type: string
 *                 description: The User ID (UUID v4 format)
 *             required:
 *               - nickname
 *               - UID
 *     responses:
 *       201:
 *         description: Nickname created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 UID:
 *                   type: string
 *                 hash:
 *                   type: string
 *                 created:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Nickname already taken or UID already has a nickname
 */
router.post("/", validateApiKey, requireAuth, validate(nicknameSchema), create);

/**
 * @swagger
 * /nickname/{hash}:
 *   get:
 *     summary: Get nickname by hash
 *     tags: [Nickname]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         description: The 6-digit hash of the nickname
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The nickname entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 UID:
 *                   type: string
 *                 hash:
 *                   type: string
 *       404:
 *         description: Nickname not found
 */
router.get("/:hash", requireAuth, getNicknameByHash);

/**
 * @swagger
 * /nickname/uid/{uid}:
 *   get:
 *     summary: Get nickname by UID
 *     tags: [Nickname]
 *     parameters:
 *       - in: path
 *         name: uid
 *         required: true
 *         description: The User ID (UUID v4 format)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The nickname entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 UID:
 *                   type: string
 *                 hash:
 *                   type: string
 *       404:
 *         description: No nickname found for this UID
 */
router.get("/uid/:uid", requireAuth, getNicknameByUID);

/**
 * @swagger
 * /nickname:
 *   put:
 *     summary: Update an existing nickname
 *     tags: [Nickname]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: The new nickname (exactly 10 characters, alphanumeric plus _ and -)
 *               UID:
 *                 type: string
 *                 description: The User ID (UUID v4 format)
 *             required:
 *               - nickname
 *               - UID
 *     responses:
 *       200:
 *         description: Nickname updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 UID:
 *                   type: string
 *                 hash:
 *                   type: string
 *                 updated:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Nickname not found
 */
router.put("/", validateApiKey, requireAuth, validate(updateNicknameSchema), update);

/**
 * @swagger
 * /nickname/{hash}:
 *   put:
 *     summary: Update a nickname
 *     tags: [Nickname]
 *     security:
 *       - ApiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         description: The 6-digit hash of the nickname
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nickname:
 *                 type: string
 *                 description: The new nickname (4 to 10 characters, alphanumeric plus _ and -)
 *             required:
 *               - nickname
 *     responses:
 *       200:
 *         description: Nickname updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nickname:
 *                   type: string
 *                 UID:
 *                   type: string
 *                 hash:
 *                   type: string
 *                 updated:
 *                   type: boolean
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Nickname not found
 *       409:
 *         description: Nickname already taken
 */
router.put("/:hash", validateApiKey, requireAuth, validate(updateNicknameSchema), update);

export default router;
