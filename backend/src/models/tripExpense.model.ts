import { supabaseAdmin } from "../config/supabase";

export interface TripExpenseRow {
  id: string;
  trip_id: string;
  paid_by: string;
  description: string;
  amount: number;
  category: string;
  receipt_url: string | null;
  created_at: string;
}

export interface NewTripExpense {
  tripId: string;
  paidBy: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl?: string | null;
}

export async function listExpenses(tripId: string): Promise<TripExpenseRow[]> {
  const { data, error } = await supabaseAdmin
    .from("trip_expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createExpense(input: NewTripExpense): Promise<TripExpenseRow> {
  const { data, error } = await supabaseAdmin
    .from("trip_expenses")
    .insert({
      trip_id: input.tripId,
      paid_by: input.paidBy,
      description: input.description,
      amount: input.amount,
      category: input.category,
      receipt_url: input.receiptUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
