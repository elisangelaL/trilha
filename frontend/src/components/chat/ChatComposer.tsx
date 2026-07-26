"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { CameraIcon, MicIcon, SendIcon, TrashIcon } from "../ui/icons";
import { useVoiceRecorder } from "../../hooks/useVoiceRecorder";

const CANCEL_DRAG_PX = 80;
const MIN_RECORDING_MS = 300; // toques acidentais no mic não viram áudios de 0s

function formatTimer(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ChatComposer({
  onSendText,
  onSendMedia,
}: {
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (type: "image" | "audio", file: File, durationSeconds?: number) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const dragStartXRef = useRef(0);
  const [dragCanceled, setDragCanceled] = useState(false);
  const recorder = useVoiceRecorder();

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await onSendText(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void handleSend();
  }

  async function handleMicDown(e: PointerEvent<HTMLButtonElement>) {
    if (!recorder.isSupported) {
      audioInputRef.current?.click();
      return;
    }
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    dragStartXRef.current = e.clientX;
    setDragCanceled(false);
    await recorder.start();
  }

  function handleMicMove(e: PointerEvent<HTMLButtonElement>) {
    if (recorder.status !== "recording") return;
    setDragCanceled(e.clientX - dragStartXRef.current < -CANCEL_DRAG_PX);
  }

  async function handleMicUp() {
    if (recorder.status !== "recording") return;
    const shouldCancel = dragCanceled || recorder.elapsedMs < MIN_RECORDING_MS;
    setDragCanceled(false);

    const result = shouldCancel ? await recorder.cancel() : await recorder.stop();
    if (result) await onSendMedia("audio", result.file, result.durationSeconds);
  }

  const isRecording = recorder.status === "recording";
  const showSend = text.trim().length > 0 && !isRecording;

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 16px", borderTop: "2px solid var(--color-divider)" }}>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onSendMedia("image", file);
          e.target.value = "";
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onSendMedia("audio", file);
          e.target.value = "";
        }}
      />

      {isRecording ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minHeight: 36 }}>
          <span className="recording-dot" style={{ background: dragCanceled ? "var(--color-neutral-500)" : "var(--color-accent)" }} />
          <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{formatTimer(recorder.elapsedMs)}</span>
          <span className="text-muted" style={{ fontSize: 12, marginLeft: "auto" }}>
            {dragCanceled ? "Solte para cancelar" : "Arraste para cancelar"}
          </span>
        </div>
      ) : (
        <>
          <Button variant="secondary" className="btn-icon" title="Anexar foto" onClick={() => photoInputRef.current?.click()}>
            <CameraIcon size={16} />
          </Button>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva uma mensagem..."
            style={{ flex: 1 }}
          />
        </>
      )}

      {showSend ? (
        <Button variant="primary" className="btn-icon" title="Enviar" onClick={() => void handleSend()}>
          <SendIcon size={16} stroke="#fff" />
        </Button>
      ) : (
        <Button
          variant={isRecording ? "primary" : "secondary"}
          className="btn-icon"
          title="Segure para gravar um áudio"
          onPointerDown={(e) => void handleMicDown(e)}
          onPointerUp={() => void handleMicUp()}
          onPointerCancel={() => void handleMicUp()}
          onPointerMove={handleMicMove}
          style={{ background: dragCanceled ? "var(--color-accent)" : undefined, touchAction: "none" }}
        >
          {dragCanceled ? <TrashIcon size={16} stroke="#fff" /> : <MicIcon size={16} stroke={isRecording ? "#fff" : undefined} />}
        </Button>
      )}
    </div>
  );
}
