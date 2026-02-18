import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { v2 as cloudinary } from 'cloudinary';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '../../../shared/config/config.js';

const router = express.Router();

// Initialize Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET / - Fetch user's reels
router.get('/', async (req, res) => {
    try {
        const userId = req.user.userId;

        const { data, error } = await supabase
            .from('reels')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({ reels: data || [] });
    } catch (error) {
        console.error('Error fetching reels:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST / - Create new reel
router.post('/', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, url, trim_start, trim_end, scheduled_at } = req.body;

        if (trim_end - trim_start < 10) {
            return res.status(400).json({
                error: 'El video debe tener al menos 10 segundos de duración'
            });
        }

        const { data, error } = await supabase
            .from('reels')
            .insert([{
                user_id: userId,
                title: title || '',
                url,
                trim_start: parseFloat(trim_start) || 0,
                trim_end: parseFloat(trim_end) || 0,
                scheduled_at: scheduled_at || null
            }])
            .select()
            .single();

        if (error) throw error;

        res.json({ reel: data });
    } catch (error) {
        console.error('Error creating reel:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT /:id - Update reel
router.put('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const { title, trim_start, trim_end } = req.body;

        if (trim_end - trim_start < 10) {
            return res.status(400).json({
                error: 'El video debe tener al menos 10 segundos de duración'
            });
        }

        const { data, error } = await supabase
            .from('reels')
            .update({
                title,
                trim_start: parseFloat(trim_start),
                trim_end: parseFloat(trim_end),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ reel: data });
    } catch (error) {
        console.error('Error updating reel:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE /:id - Delete reel
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        // Fetch reel to check ownership and get URL
        const { data: reel, error: fetchError } = await supabase
            .from('reels')
            .select('url, user_id')
            .eq('id', id)
            .single();

        if (fetchError || !reel) {
            return res.status(404).json({ error: "Reel not found" });
        }

        if (reel.user_id !== userId) {
            return res.status(403).json({ error: "Forbidden: You don't own this reel" });
        }

        // Delete from Cloudinary if applicable
        if (reel.url && reel.url.includes('cloudinary.com')) {
            try {
                const regex = /\/v\d+\/(reels\/.+)\.[^.]+$/;
                const match = reel.url.match(regex);

                if (match && match[1]) {
                    const publicId = match[1];
                    await cloudinary.uploader.destroy(publicId, {
                        resource_type: 'video',
                        invalidate: true
                    });
                }
            } catch (cloudErr) {
                console.error("❌ Cloudinary Error:", cloudErr);
            }
        }

        // Delete from Supabase
        const { error } = await supabase
            .from('reels')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting reel:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
