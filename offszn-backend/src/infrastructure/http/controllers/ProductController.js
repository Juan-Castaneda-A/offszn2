import { supabase } from '../../database/connection.js';

export const getAllProducts = async (req, res) => {
    try {
        const { nickname, type, sort } = req.query;
        let query = supabase
            .from('products')
            .select(`
                *,
                users!producer_id (
                    id, nickname, avatar_url, is_verified
                )
            `);

        // Filtrado por Nickname de Productor
        if (nickname) {
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('nickname', nickname)
                .single();

            if (userError || !user) {
                return res.status(404).json({ error: 'Productor no encontrado' });
            }
            query = query.eq('producer_id', user.id);
        }

        if (type) {
            query = query.eq('product_type', type);
        }

        // En producción, solo mostrar publicados/aprobados
        query = query.eq('status', 'approved');

        // Ordenamiento
        if (sort === 'newest') {
            query = query.order('created_at', { ascending: false });
        } else if (sort === 'plays') {
            query = query.order('plays_count', { ascending: false });
        } else {
            query = query.order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const userId = req.user.userId;
        const {
            title, description, key, bpm, tags, genres, moods,
            isFree, licenses, artwork_url, mp3_url, wav_url, stems_url, product_type
        } = req.body;

        if (!title || !genres || !artwork_url) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        const productData = {
            producer_id: userId,
            name: title,
            description: description || null,
            image_url: artwork_url,
            product_type: product_type || 'beat',
            status: 'approved',
            bpm: bpm ? parseInt(bpm) : null,
            key: key || null,
            tags: tags || null,
            genres: genres || null,
            moods: moods || null,
            download_url_mp3: mp3_url,
            download_url_wav: wav_url || null,
            download_url_stems: stems_url || null,
            is_free: isFree,
            price_basic: licenses?.basic || null,
            price_premium: licenses?.premium || null,
            price_stems: licenses?.stems || null,
            price_exclusive: licenses?.exclusive || null
        };

        const { data: newProduct, error: insertError } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (insertError) throw insertError;

        res.status(201).json({ message: 'Producto publicado!', product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const incrementPlayCount = async (req, res) => {
    try {
        const productId = req.params.id;
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('views')
            .eq('id', productId)
            .single();

        if (fetchError) throw fetchError;

        const { error: updateError } = await supabase
            .from('products')
            .update({ views: (product.views || 0) + 1 })
            .eq('id', productId);

        if (updateError) throw updateError;

        res.status(200).json({ message: 'Play counted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
