"use client";

import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import type { EntryItem } from "../../types";
import type { ItemEditInput } from "../../hooks/useEntryDetail";

export function EditEntryDialog({
  item,
  onClose,
  onSubmit,
}: {
  item: EntryItem;
  onClose: () => void;
  onSubmit: (input: ItemEditInput) => Promise<void>;
}) {
  const [caption, setCaption] = useState(item.caption ?? "");
  const [title, setTitle] = useState(item.title ?? "");
  const [body, setBody] = useState(item.body ?? "");
  const [platform, setPlatform] = useState(item.platform ?? "YouTube");
  const [url, setUrl] = useState(item.url ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      if (item.type === "photo" || item.type === "video") {
        await onSubmit({ caption });
      } else if (item.type === "text") {
        await onSubmit({ title, body });
      } else {
        await onSubmit({ title, platform, url });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      title="Editar item"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Salvar</Button>
        </>
      }
    >
      {(item.type === "photo" || item.type === "video") && (
        <Field label="Legenda">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex: Vista do mirante" />
        </Field>
      )}

      {item.type === "text" && (
        <>
          <Field label="Título">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Roteiro do dia 4" />
          </Field>
          <Field label="Texto">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escreva os detalhes..." />
          </Field>
        </>
      )}

      {item.type === "link" && (
        <>
          <Field label="Plataforma">
            <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
              <option>YouTube</option>
              <option>TikTok</option>
              <option>Instagram</option>
              <option>Outro</option>
            </Select>
          </Field>
          <Field label="Link">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Título">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Do que se trata?" />
          </Field>
        </>
      )}

      {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
    </Dialog>
  );
}
