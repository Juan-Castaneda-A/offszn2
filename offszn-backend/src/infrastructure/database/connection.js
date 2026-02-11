import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_SERVICE_KEY } from '../../shared/config/config.js';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY is missing');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export const checkConnection = async () => {
    try {
        const { data, error } = await supabase.from('products').select('id').limit(1);
        if (error) throw error;
        console.log('✅ Supabase connected successfully');
    } catch (err) {
        console.error('❌ Supabase connection error:', err.message);
    }
};
