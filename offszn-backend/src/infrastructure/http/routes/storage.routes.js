import express from 'express';
import { getSignedUrl } from '../controllers/StorageController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route: Guest users need to sign URLs for covers/avatars
router.post('/sign-url', getSignedUrl);

export default router;
