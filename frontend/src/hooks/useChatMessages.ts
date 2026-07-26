"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload, ApiRequestError } from "../lib/apiClient";
import { supabase } from "../lib/supabaseClient";
import type { Message, MessageType } from "../types";

export function useChatMessages(tripId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const data = await apiFetch<{ messages: Message[] }>(`/trips/${tripId}/messages`);
      setMessages(data.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar o chat");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();

    // Novas mensagens e exclusões chegam via Supabase Realtime; refazemos o fetch
    // para já vir com nome/iniciais do autor resolvidos pelo backend.
    const channel = supabase
      .channel(`trip-messages-${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` },
        () => {
          void refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [tripId, refresh]);

  async function sendText(text: string) {
    await apiFetch(`/trips/${tripId}/messages`, { method: "POST", body: { type: "text", text } });
    await refresh();
  }

  async function sendMedia(type: Extract<MessageType, "image" | "audio">, file: File, durationSeconds?: number) {
    const form = new FormData();
    form.set("type", type);
    form.set("media", file);
    if (durationSeconds) form.set("durationSeconds", String(durationSeconds));

    await apiUpload(`/trips/${tripId}/messages`, form);
    await refresh();
  }

  async function sendSharedEntry(entryId: string, text?: string) {
    await apiFetch(`/trips/${tripId}/messages`, { method: "POST", body: { type: "entry", sharedEntryId: entryId, text } });
    await refresh();
  }

  async function deleteMessage(messageId: string) {
    // Remove otimisticamente — evita clique duplo na mesma bolha e deixa a UI instantânea.
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    try {
      await apiFetch(`/trips/${tripId}/messages/${messageId}`, { method: "DELETE" });
    } catch (err) {
      // 404 = já tinha sido apagada (clique duplo, ou o evento Realtime chegou primeiro) — ok, é o estado desejado.
      if (!(err instanceof ApiRequestError && err.status === 404)) throw err;
    } finally {
      await refresh();
    }
  }

  async function editMessage(messageId: string, text: string) {
    await apiFetch(`/trips/${tripId}/messages/${messageId}`, { method: "PATCH", body: { text } });
    await refresh();
  }

  return { messages, loading, error, refresh, sendText, sendMedia, sendSharedEntry, deleteMessage, editMessage };
}
