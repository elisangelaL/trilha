import { supabaseAdmin } from "../config/supabase";

export type EntryItemType = "photo" | "text" | "link" | "video";

export interface TripEntryItemRow {
  id: string;
  entry_id: string;
  trip_id: string;
  author_id: string;
  type: EntryItemType;
  title: string | null;
  body: string | null;
  caption: string | null;
  url: string | null;
  platform: string | null;
  media_url: string | null;
  created_at: string;
}

export interface NewTripEntryItem {
  entryId: string;
  tripId: string;
  authorId: string;
  type: EntryItemType;
  title?: string | null;
  body?: string | null;
  caption?: string | null;
  url?: string | null;
  platform?: string | null;
  mediaUrl?: string | null;
}

export interface EntryItemPatch {
  title?: string | null;
  body?: string | null;
  caption?: string | null;
  url?: string | null;
  platform?: string | null;
}

export async function listItems(entryId: string): Promise<TripEntryItemRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_entry_items")
    .select("*")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listItemsForEntries(entryIds: string[]): Promise<TripEntryItemRow[]> {
  if (entryIds.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("trip_entry_items")
    .select("*")
    .in("entry_id", entryIds)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function findItemById(entryId: string, itemId: string): Promise<TripEntryItemRow | null> {
  const { data, error } = await supabaseAdmin
    .from("trip_entry_items")
    .select("*")
    .eq("entry_id", entryId)
    .eq("id", itemId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createItem(input: NewTripEntryItem): Promise<TripEntryItemRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_entry_items")
    .insert({
      entry_id: input.entryId,
      trip_id: input.tripId,
      author_id: input.authorId,
      type: input.type,
      title: input.title ?? null,
      body: input.body ?? null,
      caption: input.caption ?? null,
      url: input.url ?? null,
      platform: input.platform ?? null,
      media_url: input.mediaUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(entryId: string, itemId: string, patch: EntryItemPatch): Promise<TripEntryItemRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_entry_items")
    .update(patch)
    .eq("entry_id", entryId)
    .eq("id", itemId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
