import { supabaseAdmin } from "../config/supabase";

export type TripRole = "owner" | "editor" | "viewer";

export interface TripMemberRow {
  id: string;
  trip_id: string;
  user_id: string;
  role: TripRole;
  created_at: string;
}

export async function getTripRole(tripId: string, userId: string): Promise<TripRole | null> {
  const { data, error } = await supabaseAdmin
    .from("trip_members")
    .select("role")
    .eq("trip_id", tripId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data?.role as TripRole) ?? null;
}

export async function listMembers(tripId: string): Promise<TripMemberRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_members")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addMember(tripId: string, userId: string, role: TripRole): Promise<TripMemberRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_members")
    .upsert({ trip_id: tripId, user_id: userId, role }, { onConflict: "trip_id,user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function removeMember(tripId: string, memberId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("trip_members")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", memberId)
    .neq("role", "owner");
  if (error) throw error;
}
