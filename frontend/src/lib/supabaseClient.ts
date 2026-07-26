import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY precisam estar definidos (veja .env.local.example)",
  );
}

/** Client Supabase para uso no browser: autenticação (Auth) e assinatura Realtime. */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
