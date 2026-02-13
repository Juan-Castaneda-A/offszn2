import express from 'express';
import {
    registerUser,
    loginUser,
    checkNicknameAvailability
} from '../controllers/AuthController.js';
import { completeProfile } from '../controllers/UserController.js';
import { authenticateTokenMiddleware } from '../middlewares/authenticateTokenMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/check-nickname', checkNicknameAvailability);

// Protected: Complete onboarding
router.put('/complete-profile', authenticateTokenMiddleware, completeProfile);

export default router;
