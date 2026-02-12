
import express from 'express';
import { getSignedUrl } from '../controllers/StorageController.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Protected route: Only authenticated users can request signed URLs
router.post('/sign-url', authenticateUser, getSignedUrl);

export default router;
