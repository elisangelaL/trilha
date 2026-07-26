import { supabaseAdmin } from "../config/supabase";
import type { TripRole } from "./tripMember.model";

export interface TripInviteRow {
  id: string;
  trip_id: string;
  email: string;
  role: Exclude<TripRole, "owner">;
  status: "pending" | "accepted";
  invited_by: string;
  created_at: string;
}

export async function createInvite(
  tripId: string,
  email: string,
  role: Exclude<TripRole, "owner">,
  invitedBy: string,
): Promise<TripInviteRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_invites")
    .insert({ trip_id: tripId, email, role, invited_by: invitedBy })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
