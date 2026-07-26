import { supabaseAdmin } from "../config/supabase";

export type EntryCategory = "visitar" | "comer" | "hospedagem" | "transporte";

export interface TripEntryRow {
  id: string;
  trip_id: string;
  author_id: string;
  category: EntryCategory;
  created_at: string;
}

export interface NewTripEntry {
  tripId: string;
  authorId: string;
  category: EntryCategory;
}

export async function listEntries(tripId: string): Promise<TripEntryRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_entries")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
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
    .insert({ trip_id: input.tripId, author_id: input.authorId, category: input.category })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
