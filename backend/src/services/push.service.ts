import webpush from "web-push";
import * as pushModel from "../models/pushSubscription.model";
import * as memberModel from "../models/tripMember.model";
import { env } from "../config/env";

webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function subscribe(userId: string, subscription: PushSubscriptionInput): Promise<void> {
  await pushModel.upsertSubscription(userId, subscription.endpoint, subscription.keys.p256dh, subscription.keys.auth);
}

export async function unsubscribe(endpoint: string): Promise<void> {
  await pushModel.deleteSubscriptionByEndpoint(endpoint);
}

export interface NotifyPayload {
  title: string;
  body: string;
  url: string;
}

/** Notifica os outros membros da viagem por push. Best-effort: nunca deve derrubar quem chamou. */
export async function notifyTripMembers(tripId: string, excludeUserId: string, payload: NotifyPayload): Promise<void> {
  const members = await memberModel.listMembers(tripId);
  const targetUserIds = members.map((m) => m.user_id).filter((id) => id !== excludeUserId);
  if (targetUserIds.length === 0) return;

  const subscriptions = await pushModel.listSubscriptionsForUsers(targetUserIds);
  if (subscriptions.length === 0) return;

  const json = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, json);
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Inscrição expirada/revogada no navegador — não vale mais a pena manter.
          await pushModel.deleteSubscriptionByEndpoint(sub.endpoint).catch(() => undefined);
        } else {
          console.error("Falha ao enviar push notification:", err);
        }
      }
    }),
  );
}
