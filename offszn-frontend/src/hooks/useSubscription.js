import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../api/client';
import { useAuth } from '../store/authStore';
import toast from 'react-hot-toast';

export const useSubscription = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [currency, setCurrency] = useState(() => localStorage.getItem('offszn_currency') || 'USD');
    const [currentPlan, setCurrentPlan] = useState('basic');

    const fetchCurrentPlan = useCallback(async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('plan')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setCurrentPlan(data.plan || 'basic');
        } catch (err) {
            console.error("Error fetching plan:", err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchCurrentPlan();
    }, [fetchCurrentPlan]);

    const changeCurrency = (newCurr) => {
        setCurrency(newCurr);
        localStorage.setItem('offszn_currency', newCurr);
    };

    const provisionPro = async (providerId, provider = 'paypal_onetime') => {
        if (!user) return false;

        try {
            // 1. Insert subscription record
            const nextMonth = new Date();
            nextMonth.setDate(nextMonth.getDate() + 30);

            const { error: subError } = await supabase
                .from('subscriptions')
                .insert([{
                    user_id: user.id,
                    plan_id: 'pro_monthly_manual',
                    status: 'active',
                    provider: provider,
                    provider_subscription_id: providerId,
                    current_period_end: nextMonth.toISOString()
                }]);

            if (subError) throw subError;

            // 2. Update profile
            const { error: profError } = await supabase
                .from('profiles')
                .update({ plan: 'pro' })
                .eq('id', user.id);

            if (profError) throw profError;

            toast.success("¡Bienvenido a OFFSZN PRO! Tu cuenta ha sido actualizada.");
            setCurrentPlan('pro');
            return true;
        } catch (err) {
            console.error("Error provisioning Pro:", err);
            toast.error("Error al actualizar tu cuenta. Por favor contacta a soporte.");
            return false;
        }
    };

    return {
        loading,
        currency,
        currentPlan,
        changeCurrency,
        provisionPro,
        refresh: fetchCurrentPlan
    };
};
