import type { ReactNode } from "react";
import type { EntryCategory, TripRole } from "../../types";
import { ENTRY_CATEGORY_COLORS } from "../../lib/entryCategories";

const ROLE_LABEL: Record<TripRole, string> = { owner: "Dono", editor: "Editor", viewer: "Somente leitura" };
const ROLE_CLASS: Record<TripRole, string> = { owner: "tag-accent", editor: "tag-neutral", viewer: "tag-outline" };

export function Tag({ variant = "neutral", children }: { variant?: "accent" | "neutral" | "outline"; children: ReactNode }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export function RoleTag({ role }: { role: TripRole }) {
  return <span className={`tag ${ROLE_CLASS[role]}`}>{ROLE_LABEL[role]}</span>;
}

export function CategoryTag({ category, children }: { category: EntryCategory; children: ReactNode }) {
  const color = ENTRY_CATEGORY_COLORS[category];
  return (
    <span
      className="tag"
      style={{ background: `color-mix(in srgb, ${color} 18%, var(--color-surface-2))`, color: `color-mix(in srgb, ${color} 70%, white)` }}
    >
      {children}
    </span>
  );
}

export { ROLE_LABEL };
