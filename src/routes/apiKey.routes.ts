import { Router } from 'express';
import { createApiKey, getAllApiKeys, getApiKey, disableApiKey, deleteApiKey } from '../controllers/apiKey.controller';
import { requireAuth } from '../utils/requireAuth';
import validateApiKey from '../utils/validateApiKeyParam';

const router = Router();

// Protect all API key management routes with JWT authentication
// Only authenticated administrators should be able to manage API keys
router.use(validateApiKey(process.env.ADMIN_API_KEY || 'admin-api'));
router.use(requireAuth);

router.post('/', createApiKey);
router.get('/', getAllApiKeys);
router.get('/:key', getApiKey);
router.patch('/:key/disable', disableApiKey);
router.delete('/:key', deleteApiKey);

export default router;
