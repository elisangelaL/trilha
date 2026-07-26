import * as expenseModel from "../models/tripExpense.model";
import * as memberModel from "../models/tripMember.model";
import { getProfilesMap } from "./profile.service";
import { uploadFile, type UploadableFile } from "./storage.service";
import { splitExpenses, type ExpenseSplit } from "../utils/balances";

export interface ExpenseDTO {
  id: string;
  description: string;
  amount: number;
  category: string;
  receiptUrl: string | null;
  paidBy: string;
  createdAt: string;
}

export interface ExpensesResponse {
  expenses: ExpenseDTO[];
  total: number;
  perPerson: number;
  balances: ExpenseSplit["balances"];
}

export async function listExpenses(tripId: string): Promise<ExpensesResponse> {
  const [rows, members] = await Promise.all([expenseModel.listExpenses(tripId), memberModel.listMembers(tripId)]);
  const profiles = await getProfilesMap([...rows.map((r) => r.paid_by), ...members.map((m) => m.user_id)]);

  const expenses: ExpenseDTO[] = rows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    receiptUrl: row.receipt_url,
    paidBy: profiles.get(row.paid_by)?.name ?? "Usuário",
    createdAt: row.created_at,
  }));

  const split = splitExpenses(
    rows.map((r) => ({ paidBy: r.paid_by, amount: Number(r.amount) })),
    members.map((m) => ({ userId: m.user_id, name: profiles.get(m.user_id)?.name ?? "Usuário" })),
  );

  return { expenses, total: split.total, perPerson: split.perPerson, balances: split.balances };
}

export interface CreateExpenseInput {
  tripId: string;
  paidBy: string;
  description: string;
  amount: number;
  category: string;
  receipt?: UploadableFile;
}

export async function createExpense(input: CreateExpenseInput): Promise<ExpenseDTO> {
  let receiptUrl: string | undefined;
  if (input.receipt) {
    receiptUrl = await uploadFile(`receipts/${input.tripId}`, input.receipt);
  }

  const row = await expenseModel.createExpense({
    tripId: input.tripId,
    paidBy: input.paidBy,
    description: input.description,
    amount: input.amount,
    category: input.category,
    receiptUrl,
  });

  const profiles = await getProfilesMap([row.paid_by]);

  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    category: row.category,
    receiptUrl: row.receipt_url,
    paidBy: profiles.get(row.paid_by)?.name ?? "Usuário",
    createdAt: row.created_at,
  };
}
