import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Client com service-role key: acesso total ao banco/storage, ignora RLS.
 * Usado por models/services — o backend é quem decide as regras de acesso
 * (middlewares/authorize) antes de chegar aqui.
 */
export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Client com anon key: usado apenas para validar o access_token enviado
 * pelo frontend (auth.getUser), sem privilégios elevados.
 */
export const supabaseAuth = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
