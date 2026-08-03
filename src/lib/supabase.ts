import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nyczbcawtcnfqblqhrse.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_a4NuHVoFSTtjGqp9g73pvA_MNE-AiFD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
