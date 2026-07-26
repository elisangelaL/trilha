import { supabaseAdmin } from "../config/supabase";

export interface ProfileRow {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatar_url: string | null;
  created_at: string;
}

export async function findProfileById(id: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findProfileByEmail(email: string): Promise<ProfileRow | null> {
  const { data, error } = await supabaseAdmin.from("profiles").select("*").eq("email", email).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findProfilesByIds(ids: string[]): Promise<ProfileRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseAdmin.from("profiles").select("*").in("id", ids);
  if (error) throw error;
  return data ?? [];
}

/** Resolve convites pendentes para este e-mail em memberships reais (chamado no login). */
export async function acceptPendingInvites(userId: string, email: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("accept_pending_invites", { p_user_id: userId, p_email: email });
  if (error) throw error;
}
