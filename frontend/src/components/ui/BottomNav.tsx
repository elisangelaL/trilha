"use client";

import { HomeIcon, UserIcon, PlusIcon } from "./icons";

export type HomeTab = "viagens" | "perfil";

interface BottomNavProps {
  active: HomeTab;
  onChange: (tab: HomeTab) => void;
  onAdd?: () => void;
  addLabel?: string;
}

export function BottomNav({ active, onChange, onAdd, addLabel = "Adicionar" }: BottomNavProps) {
  return (
    <div className="bottom-nav">
      <button className={`bottom-nav-item ${active === "viagens" ? "active" : ""}`} onClick={() => onChange("viagens")}>
        <HomeIcon size={20} />
        Viagens
      </button>
      {onAdd && (
        <button className="bottom-nav-add" onClick={onAdd} aria-label={addLabel} title={addLabel}>
          <PlusIcon size={22} />
        </button>
      )}
      <button className={`bottom-nav-item ${active === "perfil" ? "active" : ""}`} onClick={() => onChange("perfil")}>
        <UserIcon size={20} />
        Perfil
      </button>
    </div>
  );
}
