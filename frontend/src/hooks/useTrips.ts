"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload } from "../lib/apiClient";
import type { Trip } from "../types";

export interface NewTripInput {
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  cover?: File;
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ trips: Trip[] }>("/trips");
      setTrips(data.trips);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar viagens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  async function createTrip(input: NewTripInput): Promise<Trip> {
    const form = new FormData();
    form.set("title", input.title);
    form.set("location", input.location);
    if (input.startDate) form.set("startDate", input.startDate);
    if (input.endDate) form.set("endDate", input.endDate);
    if (input.cover) form.set("cover", input.cover);

    const data = await apiUpload<{ trip: Trip }>("/trips", form);
    await refresh();
    return data.trip;
  }

  return { trips, loading, error, refresh, createTrip };
}
