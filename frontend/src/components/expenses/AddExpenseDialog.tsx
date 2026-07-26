"use client";

import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Field, Input, Select } from "../ui/Field";
import { Button } from "../ui/Button";
import { ImageSlot } from "../ui/ImageSlot";
import type { Member } from "../../types";
import type { NewExpenseInput } from "../../hooks/useExpenses";

const CATEGORIES = ["Transporte", "Hospedagem", "Alimentação", "Passeios", "Outros"];

export function AddExpenseDialog({
  members,
  onClose,
  onSubmit,
}: {
  members: Member[];
  onClose: () => void;
  onSubmit: (input: NewExpenseInput) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]?.userId ?? "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [hasReceipt, setHasReceipt] = useState(false);
  const [receipt, setReceipt] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const value = parseFloat(amount.replace(",", "."));
    if (!description.trim() || !value || value <= 0) {
      setError("Informe descrição e valor válido");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ description, amount: value, category, paidBy, receipt: hasReceipt ? receipt : undefined });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o gasto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      title="Adicionar gasto"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      <Field label="Descrição">
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Ingresso do museu" />
      </Field>
      <Field label="Valor (R$)">
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" step="0.01" placeholder="0,00" />
      </Field>
      <Field label="Pago por">
        <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
          {members.map((m) => (
            <option key={m.userId} value={m.userId}>{m.name}</option>
          ))}
        </Select>
      </Field>
      <Field label="Categoria">
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
      </Field>
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={hasReceipt}
          onChange={(e) => setHasReceipt(e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "var(--color-accent)" }}
        />
        Anexar recibo
      </label>
      {hasReceipt && <ImageSlot placeholder="Foto do recibo" height={100} onFileSelect={setReceipt} />}
      {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
    </Dialog>
  );
}
