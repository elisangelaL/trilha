import type { ReactNode } from "react";
import type { TripRole } from "../../types";

const ROLE_LABEL: Record<TripRole, string> = { owner: "Dono", editor: "Editor", viewer: "Somente leitura" };
const ROLE_CLASS: Record<TripRole, string> = { owner: "tag-accent", editor: "tag-neutral", viewer: "tag-outline" };

export function Tag({ variant = "neutral", children }: { variant?: "accent" | "neutral" | "outline"; children: ReactNode }) {
  return <span className={`tag tag-${variant}`}>{children}</span>;
}

export function RoleTag({ role }: { role: TripRole }) {
  return <span className={`tag ${ROLE_CLASS[role]}`}>{ROLE_LABEL[role]}</span>;
}

export { ROLE_LABEL };
