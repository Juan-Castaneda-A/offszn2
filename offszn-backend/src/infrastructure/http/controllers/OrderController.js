import { supabase } from '../../database/connection.js';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { MERCADOPAGO_ACCESS_TOKEN } from '../../../shared/config/config.js';

const client = MERCADOPAGO_ACCESS_TOKEN ? new MercadoPagoConfig({ accessToken: MERCADOPAGO_ACCESS_TOKEN }) : null;
const TASA_CAMBIO_USD_COP = 4200;

export const createMercadoPagoPreference = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { cartItems } = req.body;

        if (!cartItems?.length) return res.status(400).json({ error: 'Carrito vacío' });

        const productIds = cartItems.map(item => item.id);
        const { data: dbProducts, error } = await supabase
            .from('products')
            .select('id, name, price_basic, image_url, currency')
            .in('id', productIds)
            .eq('status', 'approved');

        if (error) throw error;

        const line_items = dbProducts.map(product => {
            let unitPrice = parseFloat(product.price_basic) || 10;
            if (product.currency === 'USD' || !product.currency) {
                unitPrice *= TASA_CAMBIO_USD_COP;
            }
            if (unitPrice < 500) unitPrice = 500;

            return {
                id: product.id.toString(),
                title: product.name,
                picture_url: product.image_url,
                quantity: 1,
                currency_id: 'COP',
                unit_price: Number(unitPrice.toFixed(2))
            };
        });

        const preferenceBody = {
            items: line_items,
            back_urls: {
                success: `${req.headers.origin}/success`,
                failure: `${req.headers.origin}/carrito`,
                pending: `${req.headers.origin}/carrito`
            },
            auto_return: "approved",
            external_reference: JSON.stringify({ u_id: userId, ts: Date.now() }),
            binary_mode: true
        };

        const preference = new Preference(client);
        const result = await preference.create({ body: preferenceBody });

        res.status(200).json({ url: result.init_point });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const handleMercadoPagoWebhook = async (req, res) => {
    const id = req.query.id || req.query['data.id'];
    const topic = req.query.topic || req.query.type;

    if (topic === 'payment') {
        res.status(200).send('OK');
        // Logic for auditing and saving to DB should follow (omitted for brevity in this initial setup)
    } else {
        res.status(200).send('OK');
    }
};

export const createFreeOrder = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { productId } = req.body;

        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('id, is_free, price_basic')
            .eq('id', productId)
            .single();

        if (fetchError || !product) return res.status(404).json({ error: 'Producto no encontrado' });
        if (product.is_free !== true && parseFloat(product.price_basic) > 0) {
            return res.status(403).json({ error: 'Este producto no es gratuito' });
        }

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                user_id: userId,
                transaction_id: `FREE-${Date.now()}-${userId.substring(0, 5)}`,
                status: 'completed',
                total_price: 0
            })
            .select().single();

        if (orderError) throw orderError;

        await supabase.from('order_items').insert({
            order_id: order.id,
            product_id: product.id,
            quantity: 1,
            price_at_purchase: 0
        });

        res.status(201).json({ message: 'Descarga gratuita registrada', orderId: order.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
