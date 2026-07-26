import { supabaseAdmin } from "../config/supabase";

export interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}

export async function upsertSubscription(userId: string, endpoint: string, p256dh: string, auth: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("push_subscriptions")
    .upsert({ user_id: userId, endpoint, p256dh, auth }, { onConflict: "endpoint" });
  if (error) throw error;
}

export async function deleteSubscriptionByEndpoint(endpoint: string): Promise<void> {
  const { error } = await supabaseAdmin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  if (error) throw error;
}

export async function listSubscriptionsForUsers(userIds: string[]): Promise<PushSubscriptionRow[]> {
  if (userIds.length === 0) return [];
  const { data, error } = await supabaseAdmin.from("push_subscriptions").select("*").in("user_id", userIds);
  if (error) throw error;
  return data ?? [];
}
