const SUPABASE_URL = 'https://ccijqkznsekbkifenlif.supabase.co'; //project Id

const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_0JwSIcgy7dOjD_Q9jLun_A_PhHNzzTe';

window.kotoSupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);