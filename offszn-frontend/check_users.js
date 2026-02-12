import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser(nickname) {
    console.log(`Checking user: ${nickname}...`);
    const { data, error } = await supabase
        .from('users')
        .select(`
            id, nickname, first_name, last_name, avatar_url, is_verified, role, bio, socials,
            followers:followers!user_id(count),
            products:products!producer_id(count)
        `)
        .ilike('nickname', nickname)
        .single();

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('User found:', data);
    }
}

// Check for the user reported by the user
checkUser('1patboy_');
