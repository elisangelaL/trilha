"use client";

import { useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "../ui/Avatar";
import { ImageSlot } from "../ui/ImageSlot";
import { Input } from "../ui/Field";
import { Button } from "../ui/Button";
import { PauseIcon, PencilIcon, PlayIcon, TrashIcon } from "../ui/icons";
import { formatRelativeTime } from "../../lib/format";
import { ENTRY_CATEGORY_LABELS } from "../../lib/entryCategories";
import type { Message } from "../../types";

const WAVEFORM_BAR_COUNT = 27;

/** Não temos análise real do áudio — gera barras "falsas" só pra dar a textura de waveform, estáveis por mensagem. */
function waveformBars(seed: string): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const bars: number[] = [];
  for (let i = 0; i < WAVEFORM_BAR_COUNT; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bars.push(0.3 + ((h >> 8) % 100) / 100 * 0.7);
  }
  return bars;
}

function formatClock(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

export function MessageBubble({
  message,
  tripId,
  canDelete,
  canEdit,
  onDelete,
  onEdit,
}: {
  message: Message;
  tripId: string;
  canDelete?: boolean;
  canEdit?: boolean;
  onDelete?: () => void;
  onEdit?: (text: string) => Promise<void> | void;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.text ?? "");
  const [saving, setSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(message.durationSeconds ?? 0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const waveform = useMemo(() => waveformBars(message.id), [message.id]);

  function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      void audio.play();
    }
  }

  function seek(e: ReactMouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !isFinite(audio.duration)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = fraction * audio.duration;
  }

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
        <div style={{ marginLeft: 34, display: "flex", alignItems: "center", gap: 10, background: "var(--color-surface)", padding: "8px 12px", width: 260 }}>
          {message.mediaUrl && (
            <audio
              ref={audioRef}
              src={message.mediaUrl}
              preload="metadata"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setCurrentTime(0);
              }}
              onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
              onLoadedMetadata={(e) => {
                if (isFinite(e.currentTarget.duration)) setTotalDuration(e.currentTarget.duration);
              }}
              style={{ display: "none" }}
            />
          )}
          <button
            onClick={togglePlayback}
            disabled={!message.mediaUrl}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "var(--color-accent)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
              cursor: message.mediaUrl ? "pointer" : "default",
              padding: 0,
            }}
          >
            {isPlaying ? <PauseIcon size={13} /> : <PlayIcon size={13} />}
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div onClick={seek} style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 24, cursor: message.mediaUrl ? "pointer" : "default" }}>
              {waveform.map((h, i) => {
                const played = totalDuration > 0 && i / waveform.length < currentTime / totalDuration;
                return (
                  <div
                    key={i}
                    style={{
                      width: 3,
                      flex: "none",
                      height: `${h * 100}%`,
                      borderRadius: 2,
                      background: played ? "var(--color-accent)" : "var(--color-neutral-600)",
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span className="text-muted" style={{ fontSize: 10 }}>{formatClock(currentTime)}</span>
              <span className="text-muted" style={{ fontSize: 10 }}>{formatClock(totalDuration)}</span>
            </div>
          </div>
          {canDelete && (
            <Button variant="icon" title="Apagar áudio" onClick={onDelete} style={{ width: 24, height: 24, flex: "none" }}>
              <TrashIcon size={12} />
            </Button>
          )}
        </div>
      )}

      {message.type === "entry" && message.sharedEntry && (
        <div style={{ marginLeft: 34, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
          {message.text && <p style={{ margin: 0, fontSize: 14 }}>{message.text}</p>}
          <button
            onClick={() => router.push(`/viagens/${tripId}/descobertas/${message.sharedEntry!.id}`)}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              background: "var(--color-surface)",
              border: "none",
              padding: 10,
              width: 240,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <div style={{ width: 44, height: 44, flex: "none", overflow: "hidden" }}>
              <ImageSlot src={message.sharedEntry.previewMediaUrl} placeholder="" height={44} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600 }}>{ENTRY_CATEGORY_LABELS[message.sharedEntry.category]}</div>
              <div className="text-muted" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {message.sharedEntry.previewText || "Descoberta compartilhada"}
              </div>
            </div>
          </button>
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
  );
}
