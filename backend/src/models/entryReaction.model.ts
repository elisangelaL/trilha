import { supabaseAdmin } from "../config/supabase";

export type ReactionType = "like" | "dislike";

export interface ReactionRow {
  entry_id: string;
  user_id: string;
  type: ReactionType;
}

export async function listReactionsForEntries(entryIds: string[]): Promise<ReactionRow[]> {
  if (entryIds.length === 0) return [];
  const { data, error } = await supabaseAdmin.from("trip_entry_reactions").select("entry_id, user_id, type").in("entry_id", entryIds);
  if (error) throw error;
  return data ?? [];
}

export async function upsertReaction(entryId: string, userId: string, type: ReactionType): Promise<void> {
  const { error } = await supabaseAdmin
    .from("trip_entry_reactions")
    .upsert({ entry_id: entryId, user_id: userId, type }, { onConflict: "entry_id,user_id" });
  if (error) throw error;
}

export async function deleteReaction(entryId: string, userId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("trip_entry_reactions").delete().eq("entry_id", entryId).eq("user_id", userId);
  if (error) throw error;
}
