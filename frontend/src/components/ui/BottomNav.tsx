"use client";

import { HomeIcon, UserIcon } from "./icons";

export type HomeTab = "viagens" | "perfil";

export function BottomNav({ active, onChange }: { active: HomeTab; onChange: (tab: HomeTab) => void }) {
  return (
    <div className="bottom-nav">
      <button className={`bottom-nav-item ${active === "viagens" ? "active" : ""}`} onClick={() => onChange("viagens")}>
        <HomeIcon size={20} />
        Viagens
      </button>
      <button className={`bottom-nav-item ${active === "perfil" ? "active" : ""}`} onClick={() => onChange("perfil")}>
        <UserIcon size={20} />
        Perfil
      </button>
    </div>
  );
}
