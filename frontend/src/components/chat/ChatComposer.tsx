"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Field";
import { CameraIcon, MicIcon, SendIcon } from "../ui/icons";

export function ChatComposer({
  onSendText,
  onSendMedia,
}: {
  onSendText: (text: string) => Promise<void>;
  onSendMedia: (type: "image" | "audio", file: File) => Promise<void>;
}) {
  const [text, setText] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    await onSendText(trimmed);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") void handleSend();
  }

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
      <Button variant="secondary" className="btn-icon" title="Anexar foto" onClick={() => photoInputRef.current?.click()}>
        <CameraIcon size={16} />
      </Button>
      <Button variant="secondary" className="btn-icon" title="Enviar áudio" onClick={() => audioInputRef.current?.click()}>
        <MicIcon size={16} />
      </Button>
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escreva uma mensagem..."
        style={{ flex: 1 }}
      />
      <Button variant="primary" className="btn-icon" title="Enviar" onClick={() => void handleSend()}>
        <SendIcon size={16} stroke="#fff" />
      </Button>
    </div>
  );
}
