import { Router } from 'express';
import { getAllProducts, incrementPlayCount } from '../controllers/ProductController.js';
import { getUserByNickname } from '../controllers/UserController.js';

const router = Router();

router.get('/products', getAllProducts);
router.post('/products/:id/play', incrementPlayCount);

// User/Profile routes
router.get('/users/:nickname', getUserByNickname);
router.get('/users/:nickname/products', getAllProducts); // Reusing getAllProducts with filters if implemented, or I should make a specific one.
// Add other public routes like /producers, /leaderboard later

export default router;
