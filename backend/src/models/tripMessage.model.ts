import { supabaseAdmin } from "../config/supabase";

export type MessageType = "text" | "image" | "audio" | "entry";

export interface TripMessageRow {
  id: string;
  trip_id: string;
  author_id: string;
  type: MessageType;
  text: string | null;
  media_url: string | null;
  duration_seconds: number | null;
  shared_entry_id: string | null;
  created_at: string;
  edited_at: string | null;
}

export interface NewTripMessage {
  tripId: string;
  authorId: string;
  type: MessageType;
  text?: string | null;
  mediaUrl?: string | null;
  durationSeconds?: number | null;
  sharedEntryId?: string | null;
}

export async function listMessages(tripId: string): Promise<TripMessageRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_messages")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createMessage(input: NewTripMessage): Promise<TripMessageRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_messages")
    .insert({
      trip_id: input.tripId,
      author_id: input.authorId,
      type: input.type,
      text: input.text ?? null,
      media_url: input.mediaUrl ?? null,
      duration_seconds: input.durationSeconds ?? null,
      shared_entry_id: input.sharedEntryId ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function findMessageById(tripId: string, messageId: string): Promise<TripMessageRow | null> {
  const { data, error } = await supabaseAdmin
    .from("trip_messages")
    .select("*")
    .eq("trip_id", tripId)
    .eq("id", messageId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function deleteMessage(tripId: string, messageId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("trip_messages").delete().eq("trip_id", tripId).eq("id", messageId);
  if (error) throw error;
}

export async function updateMessageText(tripId: string, messageId: string, text: string): Promise<TripMessageRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_messages")
    .update({ text, edited_at: new Date().toISOString() })
    .eq("trip_id", tripId)
    .eq("id", messageId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
