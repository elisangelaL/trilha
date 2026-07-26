"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, apiUpload } from "../lib/apiClient";
import type { ExpensesResponse } from "../types";

export interface NewExpenseInput {
  description: string;
  amount: number;
  category: string;
  paidBy?: string;
  receipt?: File;
}

const EMPTY: ExpensesResponse = { expenses: [], total: 0, perPerson: 0, balances: [] };

export function useExpenses(tripId: string) {
  const [summary, setSummary] = useState<ExpensesResponse>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<ExpensesResponse>(`/trips/${tripId}/expenses`);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar gastos");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  async function addExpense(input: NewExpenseInput) {
    const form = new FormData();
    form.set("description", input.description);
    form.set("amount", String(input.amount));
    form.set("category", input.category);
    if (input.paidBy) form.set("paidBy", input.paidBy);
    if (input.receipt) form.set("receipt", input.receipt);

    await apiUpload(`/trips/${tripId}/expenses`, form);
    await refresh();
  }

  return { ...summary, loading, error, refresh, addExpense };
}
