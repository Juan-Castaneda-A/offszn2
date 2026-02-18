import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } from '../../../shared/config/config.js';

const router = Router();

// Cloudinary Config
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const MAX_AVATAR_SIZE = 30 * 1024 * 1024;

router.post('/avatar', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { image, isGif, fileSize, crop } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'No se proporcionó imagen' });
        }

        if (fileSize && fileSize > MAX_AVATAR_SIZE) {
            return res.status(413).json({ error: 'El archivo excede el límite de 30MB' });
        }

        if (isGif) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', userId)
                .maybeSingle();

            if (!profile || profile.plan !== 'pro') {
                return res.status(403).json({
                    error: 'Los avatars GIF son exclusivos del plan Pro',
                    upgrade: true
                });
            }
        }

        const { data: currentUser } = await supabase
            .from('users')
            .select('avatar_url')
            .eq('id', userId)
            .single();

        const oldUrl = currentUser?.avatar_url;
        const publicId = userId;

        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: 'avatars',
            public_id: publicId,
            overwrite: true,
            invalidate: true,
            resource_type: 'auto',
        });

        let displayUrl;
        const version = uploadResult ? uploadResult.version : Date.now();

        if (crop && crop.width && crop.height) {
            const transforms = [
                {
                    x: Math.round(crop.x),
                    y: Math.round(crop.y),
                    width: Math.round(crop.width),
                    height: Math.round(crop.height),
                    crop: 'crop'
                },
                { width: 500, height: 500, crop: 'fill' }
            ];

            const options = {
                transformation: transforms,
                secure: true,
                version: version
            };

            if (isGif) {
                options.flags = 'animated';
                displayUrl = cloudinary.url(`avatars/${publicId}.gif`, options);
            } else {
                displayUrl = cloudinary.url(`avatars/${publicId}`, {
                    ...options,
                    quality: 'auto',
                    fetch_format: 'auto'
                });
            }
        } else if (isGif) {
            displayUrl = uploadResult ? uploadResult.secure_url : oldUrl;
        } else {
            displayUrl = cloudinary.url(`avatars/${publicId}`, {
                width: 500,
                height: 500,
                crop: 'fill',
                gravity: 'face',
                quality: 'auto',
                fetch_format: 'auto',
                secure: true,
                version: version
            });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ avatar_url: displayUrl })
            .eq('id', userId);

        if (updateError) throw updateError;

        if (oldUrl && oldUrl.includes('supabase')) {
            try {
                const oldFileName = oldUrl.split('/').pop();
                if (oldFileName) {
                    await supabase.storage
                        .from('avatars')
                        .remove([oldFileName]);
                }
            } catch (cleanupErr) {
                console.warn('⚠️ Supabase cleanup error (non-fatal):', cleanupErr.message);
            }
        }

        res.json({
            success: true,
            url: displayUrl,
            message: 'Avatar actualizado correctamente'
        });

    } catch (error) {
        console.error('❌ Error uploading avatar to Cloudinary:', error);
        res.status(500).json({ error: 'Error al subir el avatar' });
    }
});

export default router;
