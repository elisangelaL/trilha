"use client";

import { useState } from "react";
import { Avatar } from "../ui/Avatar";
import { ImageSlot } from "../ui/ImageSlot";
import { Input } from "../ui/Field";
import { Button } from "../ui/Button";
import { PencilIcon, PlayIcon, TrashIcon } from "../ui/icons";
import { formatRelativeTime } from "../../lib/format";
import type { Message } from "../../types";

export function MessageBubble({
  message,
  canDelete,
  canEdit,
  onDelete,
  onEdit,
}: {
  message: Message;
  canDelete?: boolean;
  canEdit?: boolean;
  onDelete?: () => void;
  onEdit?: (text: string) => Promise<void> | void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const trimmed = draft.trim();
    if (!trimmed || trimmed === message.text) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onEdit?.(trimmed);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--color-divider)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Avatar initials={message.authorInitials} size={26} />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{message.author}</span>
        <span className="text-muted" style={{ fontSize: 11, marginLeft: "auto" }}>{formatRelativeTime(message.createdAt)}</span>
      </div>

      {message.type === "text" && !isEditing && (
        <div style={{ marginLeft: 34 }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            {message.text}
            {message.editedAt && <span className="text-muted" style={{ fontSize: 11 }}> (editado)</span>}
          </p>
          {(canEdit || canDelete) && (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {canEdit && (
                <button
                  onClick={() => {
                    setDraft(message.text ?? "");
                    setIsEditing(true);
                  }}
                  className="text-muted"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                >
                  <PencilIcon size={11} /> editar
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="text-muted"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, display: "flex", alignItems: "center", gap: 4, padding: 0 }}
                >
                  <TrashIcon size={11} /> apagar
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {message.type === "text" && isEditing && (
        <div style={{ marginLeft: 34, display: "flex", gap: 8, alignItems: "center" }}>
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSave()}
            autoFocus
            style={{ flex: 1 }}
          />
          <Button variant="primary" loading={saving} onClick={handleSave}>Salvar</Button>
          <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
        </div>
      )}

      {message.type === "image" && (
        <div style={{ marginLeft: 34, width: 200, position: "relative" }}>
          <ImageSlot src={message.mediaUrl} placeholder="Foto compartilhada" height={130} borderRadius={10} />
          {canDelete && (
            <Button
              variant="icon"
              title="Apagar foto"
              onClick={onDelete}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "color-mix(in srgb, var(--color-neutral-900) 70%, transparent)",
                width: 28,
                height: 28,
              }}
            >
              <TrashIcon size={14} style={{ color: "#fff" }} />
            </Button>
          )}
        </div>
      )}

      {message.type === "audio" && (
        <div
          style={{
            marginLeft: 34,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--color-surface)",
            padding: "8px 12px",
            width: "fit-content",
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <PlayIcon size={12} />
          </div>
          <span className="text-muted" style={{ fontSize: 11 }}>
            {message.durationSeconds ? `${Math.round(message.durationSeconds)}s` : "áudio"}
          </span>
          {canDelete && (
            <Button variant="icon" title="Apagar áudio" onClick={onDelete} style={{ width: 24, height: 24 }}>
              <TrashIcon size={12} />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
