import { supabaseAdmin } from "../config/supabase";

export type EntryCategory = "visitar" | "comer" | "hospedagem" | "transporte";

export interface TripEntryRow {
  id: string;
  trip_id: string;
  author_id: string;
  category: EntryCategory;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface NewTripEntry {
  tripId: string;
  authorId: string;
  category: EntryCategory;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export async function listEntries(tripId: string): Promise<TripEntryRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_entries")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function findEntryById(tripId: string, entryId: string): Promise<TripEntryRow | null> {
  const { data, error } = await supabaseAdmin
    .from("trip_entries")
    .select("*")
    .eq("trip_id", tripId)
    .eq("id", entryId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createEntry(input: NewTripEntry): Promise<TripEntryRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_entries")
    .insert({
      trip_id: input.tripId,
      author_id: input.authorId,
      category: input.category,
      address: input.address ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(tripId: string, entryId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("trip_entries").delete().eq("trip_id", tripId).eq("id", entryId);
  if (error) throw error;
}
