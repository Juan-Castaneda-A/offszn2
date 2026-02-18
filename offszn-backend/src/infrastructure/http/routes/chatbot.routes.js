import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../../../shared/config/config.js';

const router = Router();

// Initialize Gemini if key is provided
let genAI = null;
if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

const SYSTEM_PROMPT = `
Eres OFFSZN AI, el asistente virtual oficial de OFFSZN (offszn.com).
Tu objetivo es ayudar a productores musicales y artistas a navegar por la plataforma.
OFFSZN es una plataforma premium para compra y venta de beats, samples y recursos musicales.

Puntos clave:
- El plan Pro permite subir avatars animadas (GIF) y reels.
- Tenemos una ruleta mensual de premios en la sección de Gift Cards.
- Ofrecemos un regalo de bienvenida de $5 USD en créditos.
- Los pagos se procesan de forma segura vía Mercado Pago y PayPal.
- Siempre sé amable, profesional y enfocado en la música.
`;

router.post('/chat', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'No se proporcionó un mensaje.' });
        }

        if (!genAI) {
            return res.status(503).json({
                text: "El servicio de IA no está configurado (falta GEMINI_API_KEY). Sin embargo, puedo decirte que OFFSZN es el mejor lugar para tus beats."
            });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "Entendido. Soy OFFSZN AI y estoy listo para ayudar." }] },
            ],
        });

        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ text });

    } catch (error) {
        console.error('❌ Error in Chatbot:', error);
        res.status(500).json({ text: "Lo siento, tuve un problema procesando tu mensaje. Intenta de nuevo en un momento." });
    }
});

export default router;
