import { Router } from 'express';
import { createNegotiation, getNegotiations, getNegotiationById, updateNegotiationStatus } from '../controllers/NegotiationController.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', createNegotiation);
router.get('/', authMiddleware, getNegotiations);
router.get('/:id', authMiddleware, getNegotiationById);
router.put('/:id', authMiddleware, updateNegotiationStatus);

export default router;
