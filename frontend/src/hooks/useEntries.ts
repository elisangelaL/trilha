"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload } from "../lib/apiClient";
import type { EntryCategory, EntryDetail, EntrySummary, EntryType } from "../types";

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

  return { entries, loading, error, refresh, addEntry };
}
