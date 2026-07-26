"use client";

import { useEffect, useState } from "react";
import { VideoIcon } from "./icons";

interface VideoSlotProps {
  src?: string | null;
  placeholder: string;
  height?: number;
  borderRadius?: number;
  /** Quando definido, o slot vira clicável e abre o seletor de arquivo. */
  onFileSelect?: (file: File) => void;
}

export function VideoSlot({ src, placeholder, height = 200, borderRadius = 0, onFileSelect }: VideoSlotProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resolvedSrc = previewUrl ?? src ?? null;

  const box = (
    <div
      style={{
        width: "100%",
        height,
        position: "relative",
        background: "var(--color-surface)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius,
      }}
    >
      {resolvedSrc ? (
        <video src={resolvedSrc} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            color: "var(--color-neutral-500)",
            fontSize: 12,
            padding: 12,
            textAlign: "center",
          }}
        >
          <VideoIcon size={22} />
          {placeholder}
        </div>
      )}
    </div>
  );

  if (!onFileSelect) return box;

  return (
    <label style={{ cursor: "pointer", display: "block" }}>
      <input
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setPreviewUrl(URL.createObjectURL(file));
          onFileSelect(file);
        }}
      />
      {box}
    </label>
  );
}
