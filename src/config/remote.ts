// Supabase project that serves the adhkar library (Dashboard → Project
// Settings → API). Use the *anon* / *publishable* key — never the service_role
// or secret key. It is designed to ship inside apps: Row Level Security on
// public.daily_adhkar allows read-only access to active rows.
//
// Leave the URL empty to use only the adhkar bundled with the app.
export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

export const ADHKAR_TABLE = 'daily_adhkar';
