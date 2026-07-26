"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import type { Member, TripRole } from "../types";

export function useMembers(tripId: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ members: Member[] }>(`/trips/${tripId}/members`);
      setMembers(data.members);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar membros");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  async function invite(email: string, role: Exclude<TripRole, "owner">) {
    await apiFetch(`/trips/${tripId}/members/invite`, { method: "POST", body: { email, role } });
    await refresh();
  }

  async function remove(memberId: string) {
    await apiFetch(`/trips/${tripId}/members/${memberId}`, { method: "DELETE" });
    await refresh();
  }

  return { members, loading, error, refresh, invite, remove };
}
