import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.porkbun.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('⚠️ Email not sent: SMTP_USER or SMTP_PASS not configured.');
            return null;
        }

        const info = await transporter.sendMail({
            from: `"OFFSZN Marketplace" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('📧 Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

/**
 * Templates for Negotiations
 */
export const sendNegotiationOfferEmail = async (producerEmail, product, offerAmount) => {
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #6366f1;">🚀 ¡Nueva oferta recibida!</h2>
            <p>Hola,</p>
            <p>Has recibido una nueva oferta para tu producto: <strong>${product.name}</strong>.</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Monto Ofrecido:</p>
                <p style="margin: 0; font-size: 24px; font-weight: bold; color: #111827;">$${offerAmount}</p>
            </div>
            <p>Puedes aceptar, rechazar o hacer una contraoferta desde tu dashboard.</p>
            <a href="${process.env.FRONTEND_URL}/dashboard/negotiations" 
               style="display: inline-block; background: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
               Ver Negociación
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                Este es un correo automático de OFFSZN Marketplace.
            </p>
        </div>
    `;
    return sendEmail({ to: producerEmail, subject: `Nueva oferta para "${product.name}"`, html });
};

export const sendNegotiationResponseEmail = async (buyerEmail, product, status, responseMessage) => {
    const statusText = status === 'accepted' ? 'ACEPTADA' : status === 'rejected' ? 'RECHAZADA' : 'CONTESTADA';
    const statusColor = status === 'accepted' ? '#10b981' : status === 'rejected' ? '#ef4444' : '#3b82f6';

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: ${statusColor};">📢 Tu oferta ha sido ${statusText}</h2>
            <p>Hola,</p>
            <p>El productor ha respondido a tu oferta para: <strong>${product.name}</strong>.</p>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">Mensaje del productor:</p>
                <p style="margin: 0; font-style: italic; color: #374151;">"${responseMessage || 'Sin mensaje adicional'}"</p>
            </div>

            ${status === 'accepted' ? `
                <p>¡Felicidades! Ahora puedes proceder a la compra con el precio acordado (Próximamente).</p>
            ` : ''}

            <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                Gracias por usar OFFSZN.
            </p>
        </div>
    `;
    return sendEmail({ to: buyerEmail, subject: `Actualización de tu oferta para "${product.name}"`, html });
};
