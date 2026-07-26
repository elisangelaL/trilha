import { supabaseAdmin } from "../config/supabase";

export interface TripRow {
  id: string;
  title: string;
  location: string;
  start_date: string | null;
  end_date: string | null;
  cover_url: string | null;
  owner_id: string;
  created_at: string;
}

export interface NewTrip {
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  coverUrl?: string | null;
}

export async function listTripIdsForUser(userId: string): Promise<string[]> {
  const { data, error } = await supabaseAdmin.from("trip_members").select("trip_id").eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.trip_id as string);
}

export async function findTripsByIds(ids: string[]): Promise<TripRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await supabaseAdmin
    .from("trips")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function findTripById(id: string): Promise<TripRow | null> {
  const { data, error } = await supabaseAdmin.from("trips").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createTrip(input: NewTrip): Promise<TripRow> {
  const { data, error } = await supabaseAdmin
    .from("trips")
    .insert({
      title: input.title,
      location: input.location,
      start_date: input.startDate,
      end_date: input.endDate,
      owner_id: input.ownerId,
      cover_url: input.coverUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateTripCover(id: string, coverUrl: string): Promise<void> {
  const { error } = await supabaseAdmin.from("trips").update({ cover_url: coverUrl }).eq("id", id);
  if (error) throw error;
}
