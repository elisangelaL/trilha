"use client";

import { useState } from "react";
import { Dialog } from "../ui/Dialog";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Button } from "../ui/Button";
import { ImageSlot } from "../ui/ImageSlot";
import { VideoSlot } from "../ui/VideoSlot";
import { SegmentedControl } from "../ui/SegmentedControl";
import type { EntryType } from "../../types";
import type { NewItemInput } from "../../hooks/useEntryDetail";

export function AddItemDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (input: NewItemInput) => Promise<unknown> }) {
  const [type, setType] = useState<EntryType>("photo");
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<File | undefined>();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [platform, setPlatform] = useState("YouTube");
  const [url, setUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      if (type === "photo" || type === "video") {
        await onSubmit({ type, caption, media });
      } else if (type === "text") {
        await onSubmit({ type, title, body });
      } else {
        await onSubmit({ type, platform, url, title: linkTitle, media });
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível publicar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      title="Adicionar conteúdo"
      onClose={onClose}
      actions={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={loading} onClick={handleSubmit}>Publicar</Button>
        </>
      }
    >
      <SegmentedControl
        name="itype"
        value={type}
        onChange={setType}
        options={[
          { value: "photo", label: "Foto" },
          { value: "text", label: "Texto" },
          { value: "link", label: "Link" },
          { value: "video", label: "Vídeo" },
        ]}
      />

      {type === "photo" && (
        <>
          <ImageSlot placeholder="Solte a foto aqui" height={130} onFileSelect={setMedia} />
          <Field label="Legenda">
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex: Vista do mirante" />
          </Field>
        </>
      )}

      {type === "video" && (
        <>
          <VideoSlot placeholder="Selecionar vídeo" height={160} onFileSelect={setMedia} />
          <Field label="Legenda">
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Ex: Chegando no mirante" />
          </Field>
        </>
      )}

      {type === "text" && (
        <>
          <Field label="Título">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Roteiro do dia 4" />
          </Field>
          <Field label="Texto">
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Escreva os detalhes..." />
          </Field>
        </>
      )}

      {type === "link" && (
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
            <Input value={linkTitle} onChange={(e) => setLinkTitle(e.target.value)} placeholder="Do que se trata?" />
          </Field>
          <Field label="Imagem de capa (opcional)">
            <ImageSlot placeholder="Adicionar uma imagem de prévia" height={130} onFileSelect={setMedia} />
          </Field>
        </>
      )}

      {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
    </Dialog>
  );
}
