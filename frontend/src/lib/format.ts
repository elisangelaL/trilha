import type { BalanceStatus } from "../types";

export function formatCurrency(value: number): string {
  return "R$ " + (value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDateShort(iso: string | null): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return "Datas a definir";
  return `${formatDateShort(start)} – ${formatDateShort(end)}`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  if (sameDay) return time;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return `ontem ${time}`;

  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${time}`;
}

export function balanceLabel(status: BalanceStatus, amount: number): string {
  if (status === "settled") return "quitado";
  if (status === "receives") return `recebe ${formatCurrency(amount)}`;
  return `deve ${formatCurrency(amount)}`;
}

export function balanceColorVar(status: BalanceStatus): string {
  if (status === "settled") return "var(--color-neutral-500)";
  if (status === "receives") return "var(--color-accent-700)";
  return "var(--color-text)";
}
