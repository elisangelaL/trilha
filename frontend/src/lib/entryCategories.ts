import type { EntryCategory } from "../types";

export const ENTRY_CATEGORY_LABELS: Record<EntryCategory, string> = {
  visitar: "Visitar",
  comer: "Comer & beber",
  hospedagem: "Hospedagem",
  transporte: "Transporte",
};

/** Cor semântica por categoria — usada nos pins do mapa e nas tags do feed, pra escanear as duas telas do mesmo jeito. */
export const ENTRY_CATEGORY_COLORS: Record<EntryCategory, string> = {
  visitar: "var(--color-accent)",
  comer: "#e3a548",
  hospedagem: "#5b8fd9",
  transporte: "#8b7fd1",
};
