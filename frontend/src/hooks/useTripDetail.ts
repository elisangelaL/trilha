"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";
import type { TripDetail } from "../types";

export function useTripDetail(tripId: string) {
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ trip: TripDetail }>(`/trips/${tripId}`);
      setTrip(data.trip);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar a viagem");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  return { trip, loading, error, refresh };
}
