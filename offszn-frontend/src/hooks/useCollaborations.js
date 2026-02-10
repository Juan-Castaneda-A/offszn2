import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../api/client';
import { useAuth } from '../store/authStore';
import toast from 'react-hot-toast';

export const useCollaborations = () => {
    const { user } = useAuth();
    const [invites, setInvites] = useState({ received: [], sent: [], active: [], rejected: [] });
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    const fetchCollaborations = useCallback(async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch all invitations where user is either inviter or collaborator
            const { data, error } = await supabase
                .from('collab_invitations')
                .select(`
                    *,
                    products:product_id (id, name, image_url, cover_url, visibility),
                    inviter:inviter_id (id, email, nickname),
                    collaborator:collaborator_id (id, email, nickname)
                `)
                .or(`inviter_id.eq.${user.id},collaborator_id.eq.${user.id}`);

            if (error) throw error;

            // Filter by visibility (only public/unlisted counts for active collabs usually)
            const filteredData = data.filter(item =>
                item.products && (item.products.visibility === 'public' || item.products.visibility === 'unlisted')
            );

            const organized = {
                received: filteredData.filter(i => i.collaborator_id === user.id && i.status === 'pending'),
                sent: filteredData.filter(i => i.inviter_id === user.id && i.status === 'pending'),
                active: filteredData.filter(i => i.status === 'accepted'),
                rejected: filteredData.filter(i => i.status === 'rejected')
            };

            setInvites(organized);
        } catch (err) {
            console.error("Error fetching collaborations:", err);
            toast.error("Error al cargar colaboraciones");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchMyProducts = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('products')
                .select('id, name')
                .eq('producer_id', user.id)
                .order('name', { ascending: true });

            if (error) throw error;
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products for collation:", err);
        }
    }, [user]);

    useEffect(() => {
        fetchCollaborations();
        fetchMyProducts();
    }, [fetchCollaborations, fetchMyProducts]);

    const respondToInvite = async (inviteId, status) => {
        try {
            const { error } = await supabase
                .from('collab_invitations')
                .update({ status })
                .eq('id', inviteId);

            if (error) throw error;

            toast.success(status === 'accepted' ? "Colaboración aceptada" : "Invitación rechazada");
            fetchCollaborations();
        } catch (err) {
            console.error("Error responding to invite:", err);
            toast.error("Error al actualizar estado");
        }
    };

    const saveSplits = async (productId, splits) => {
        if (!user) return;

        try {
            // 1. Delete existing for this product by THIS owner
            const { error: deleteError } = await supabase
                .from('collab_invitations')
                .delete()
                .eq('product_id', productId)
                .eq('inviter_id', user.id);

            if (deleteError) throw deleteError;

            // 2. Insert new splits (excluding owner/self if splits table only tracks GUESTS)
            // Based on old code check, it filters rows by email and inserts them.
            // Note: split_percentage in DB vs split_percent in some docs. Old code used split_percentage?
            // Let's use 'royalty_split' or 'split_percentage'. 
            // Looking at old code line 1463: 'royalty_split: u.percent'
            // Looking at user docs: 'split_percentage: u.percent'
            // I'll check my view_file output again. Line 1463: royalty_split: u.percent

            const toInsert = splits
                .filter(s => !s.isOwner && s.email)
                .map(s => ({
                    inviter_id: user.id,
                    product_id: productId,
                    collaborator_email: s.email,
                    royalty_split: parseInt(s.percent),
                    status: 'pending'
                }));

            if (toInsert.length > 0) {
                const { error: insertError } = await supabase
                    .from('collab_invitations')
                    .insert(toInsert);

                if (insertError) throw insertError;
            }

            toast.success("Reparto de royalties actualizado");
            fetchCollaborations();
            return true;
        } catch (err) {
            console.error("Error saving splits:", err);
            toast.error("Error al guardar splits");
            return false;
        }
    };

    return {
        invites,
        products,
        loading,
        respondToInvite,
        saveSplits,
        refresh: fetchCollaborations
    };
};
