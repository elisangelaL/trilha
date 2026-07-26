"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload, ApiRequestError } from "../lib/apiClient";
import { applyReactionOptimistically } from "../lib/reactions";
import type { EntryCategory, EntryDetail, EntrySummary, EntryType, ReactionType } from "../types";

export interface NewEntryInput {
  type: EntryType;
  category: EntryCategory;
  title?: string;
  body?: string;
  caption?: string;
  url?: string;
  platform?: string;
  media?: File;
}

export function useEntries(tripId: string) {
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ entries: EntrySummary[] }>(`/trips/${tripId}/entries`);
      setEntries(data.entries);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar descobertas");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  async function addEntry(input: NewEntryInput): Promise<EntryDetail> {
    const form = new FormData();
    form.set("type", input.type);
    form.set("category", input.category);
    if (input.title) form.set("title", input.title);
    if (input.body) form.set("body", input.body);
    if (input.caption) form.set("caption", input.caption);
    if (input.url) form.set("url", input.url);
    if (input.platform) form.set("platform", input.platform);
    if (input.media) form.set("media", input.media);

    const data = await apiUpload<{ entry: EntryDetail }>(`/trips/${tripId}/entries`, form);
    await refresh();
    return data.entry;
  }

  async function react(entryId: string, type: ReactionType) {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? applyReactionOptimistically(e, type) : e)));
    try {
      const data = await apiFetch<{ reactions: { likeCount: number; dislikeCount: number; myReaction: ReactionType | null } }>(
        `/trips/${tripId}/entries/${entryId}/reactions`,
        { method: "POST", body: { type } },
      );
      setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, ...data.reactions } : e)));
    } catch (err) {
      await refresh();
      throw err;
    }
  }

  async function deleteEntry(entryId: string) {
    // Remove otimisticamente — deixa a UI instantânea e evita reaparecer se o usuário sair da tela antes do refresh.
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    try {
      await apiFetch(`/trips/${tripId}/entries/${entryId}`, { method: "DELETE" });
    } catch (err) {
      if (!(err instanceof ApiRequestError && err.status === 404)) {
        await refresh();
        throw err;
      }
    }
  }

  return { entries, loading, error, refresh, addEntry, react, deleteEntry };
}
