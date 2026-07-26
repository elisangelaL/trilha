"use client";

import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Field, Input } from "../ui/Field";
import { Button } from "../ui/Button";
import type { TripRole } from "../../types";

export function InviteDialog({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (email: string, role: Exclude<TripRole, "owner">) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<TripRole, "owner">>("editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim()) {
      setError("Informe um e-mail");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email, role);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o convite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      title="Convidar pessoa"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Enviar convite</Button>
        </>
      }
    >
      <Field label="E-mail">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@email.com" />
      </Field>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label className="radio">
          <input type="radio" name="invrole" checked={role === "editor"} onChange={() => setRole("editor")} />
          <span className="dot" />
          Pode editar
        </label>
        <label className="radio">
          <input type="radio" name="invrole" checked={role === "viewer"} onChange={() => setRole("viewer")} />
          <span className="dot" />
          Somente leitura
        </label>
      </div>
      {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
    </Dialog>
  );
}
