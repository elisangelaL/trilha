"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload } from "../lib/apiClient";
import type { EntryDetail, EntryType } from "../types";

export interface NewItemInput {
  type: EntryType;
  title?: string;
  body?: string;
  caption?: string;
  url?: string;
  platform?: string;
  media?: File;
}

export interface ItemEditInput {
  title?: string;
  body?: string;
  caption?: string;
  url?: string;
  platform?: string;
}

export function useEntryDetail(tripId: string, entryId: string) {
  const [entry, setEntry] = useState<EntryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ entry: EntryDetail }>(`/trips/${tripId}/entries/${entryId}`);
      setEntry(data.entry);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a descoberta");
    } finally {
      setLoading(false);
    }
  }, [tripId, entryId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  async function addItem(input: NewItemInput) {
    const form = new FormData();
    form.set("type", input.type);
    if (input.title) form.set("title", input.title);
    if (input.body) form.set("body", input.body);
    if (input.caption) form.set("caption", input.caption);
    if (input.url) form.set("url", input.url);
    if (input.platform) form.set("platform", input.platform);
    if (input.media) form.set("media", input.media);

    await apiUpload(`/trips/${tripId}/entries/${entryId}/items`, form);
    await refresh();
  }

  async function editItem(itemId: string, input: ItemEditInput) {
    await apiFetch(`/trips/${tripId}/entries/${entryId}/items/${itemId}`, { method: "PATCH", body: input });
    await refresh();
  }

  return { entry, loading, error, refresh, addItem, editItem };
}
