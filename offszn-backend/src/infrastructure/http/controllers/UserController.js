import { supabase } from '../../database/connection.js';

export const getUserByNickname = async (req, res) => {
    try {
        const { nickname } = req.params;
        const { data, error } = await supabase
            .from('users')
            .select(`
                id, nickname, first_name, last_name, avatar_url, is_verified, role, bio, socials
            `)
            .eq('nickname', nickname)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { first_name, last_name, bio, socials } = req.body;

        const { data, error } = await supabase
            .from('users')
            .update({ first_name, last_name, bio, socials })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.status(200).json({ message: 'Perfil actualizado', profile: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
