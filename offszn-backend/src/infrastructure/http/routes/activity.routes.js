import express from 'express';
import { recordActivity, getActivityHistory } from '../controllers/ActivityController.js';
import { authenticateTokenMiddleware } from '../middlewares/authenticateTokenMiddleware.js';

const router = express.Router();

router.post('/record', authenticateTokenMiddleware, recordActivity);
router.get('/history', authenticateTokenMiddleware, getActivityHistory);

export default router;
