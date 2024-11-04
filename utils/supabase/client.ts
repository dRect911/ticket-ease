import { createBrowserClient } from '@supabase/ssr'
// import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => {
    return createBrowserClient(supabaseUrl, supabaseKey)
}

export const supabase = createClient();
// export const supabase = createBrowserClient(supabaseUrl, supabaseKey);
