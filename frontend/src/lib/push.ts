import { apiFetch } from "./apiClient";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function subscribeToPush(): Promise<void> {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!isPushSupported() || !publicKey) {
    throw new Error("Este navegador não suporta notificações push");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permissão de notificação negada");
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
  });

  await apiFetch("/push/subscribe", { method: "POST", body: subscription.toJSON() });
}

export async function unsubscribeFromPush(): Promise<void> {
  const subscription = await getExistingPushSubscription();
  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await apiFetch("/push/unsubscribe", { method: "POST", body: { endpoint } });
}
