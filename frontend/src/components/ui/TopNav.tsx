"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { ChevronLeftIcon } from "./icons";

export function TopNav({
  title,
  onBack,
  backHref,
  right,
}: {
  title: ReactNode;
  onBack?: () => void;
  backHref?: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const hasBack = Boolean(onBack || backHref);

  function handleBack() {
    if (onBack) return onBack();
    if (backHref) return router.push(backHref);
  }

  return (
    <div className="nav">
      {hasBack ? (
        <Button variant="ghost" onClick={handleBack} aria-label="Voltar" className="btn-icon">
          <ChevronLeftIcon size={20} />
        </Button>
      ) : null}
      <div className="nav-brand" style={{ fontSize: 15, textAlign: "center", flex: 1, marginRight: hasBack ? 0 : "auto" }}>
        {title}
      </div>
      {right ?? (hasBack ? <div style={{ width: 36 }} /> : null)}
    </div>
  );
}
