import { Router } from 'express';
// import { authenticateTokenMiddleware } from '../../middlewares/authenticateTokenMiddleware.js';
import { createMercadoPagoPreference, handleMercadoPagoWebhook, createFreeOrder } from '../controllers/OrderController.js';

const router = Router();

router.post('/orders/mercadopago-webhook', handleMercadoPagoWebhook);

// router.use(authenticateTokenMiddleware);
router.post('/orders/create-mercadopago-preference', createMercadoPagoPreference);
router.post('/orders/free', createFreeOrder);

export default router;
