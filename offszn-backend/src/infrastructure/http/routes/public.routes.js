import { Router } from 'express';
import { getAllProducts, getProductById, incrementPlayCount } from '../controllers/ProductController.js';
import { getUserByNickname, getUserProfile, checkNickname, completeProfile } from '../controllers/UserController.js';
import { getLeaderboard } from '../controllers/LeaderboardController.js';

const router = Router();

router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products/:id/play', incrementPlayCount);

// User/Profile routes
router.get('/users/:nickname', getUserProfile);
router.get('/users/:nickname/raw', getUserByNickname);
router.get('/users/:nickname/products', getAllProducts);

// Onboarding
router.post('/users/check-nickname', checkNickname);

// Search & Discovery
router.get('/leaderboard', getLeaderboard);

export default router;
