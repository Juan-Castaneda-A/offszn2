import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
export const JWT_SECRET = process.env.JWT_SECRET;
export const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
