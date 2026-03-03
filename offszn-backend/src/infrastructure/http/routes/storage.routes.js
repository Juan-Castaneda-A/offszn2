import express from 'express';
import { getSignedUrl, uploadToR2 } from '../controllers/StorageController.js';
import multer from 'multer';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public route: Guest users need to sign URLs for covers/avatars
const upload = multer({ storage: multer.memoryStorage() });

// Public route: Guest users need to sign URLs for covers/avatars
router.post('/sign-url', getSignedUrl);

// Private route: Authenticated users can upload to R2
router.post('/upload', authMiddleware, upload.single('file'), uploadToR2);

export default router;
