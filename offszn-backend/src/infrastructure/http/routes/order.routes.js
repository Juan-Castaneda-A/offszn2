import { Router } from 'express';
import { authenticateTokenMiddleware } from '../middlewares/authenticateTokenMiddleware.js';
import {
    createMercadoPagoPreference,
    handleMercadoPagoWebhook,
    createFreeOrder,
    checkPaymentStatus,
    forceCheckPayment,
    getSecureDownloadLink
} from '../controllers/OrderController.js';

const router = Router();

// Webhook is public (sent by Mercado Pago)
router.post('/mercadopago-webhook', handleMercadoPagoWebhook);

// Protected routes
router.use(authenticateTokenMiddleware);
router.post('/create-mercadopago-preference', createMercadoPagoPreference);
router.post('/free', createFreeOrder);
router.get('/status/latest', checkPaymentStatus);

// Secure Download
router.get('/:orderId/download/:productId/:type', getSecureDownloadLink);

// Debug endpoint (Unprotected or restricted to admin in production)
router.get('/debug/force/:paymentId', forceCheckPayment);

export default router;
