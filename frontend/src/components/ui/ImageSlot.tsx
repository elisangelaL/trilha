"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CameraIcon } from "./icons";

interface ImageSlotProps {
  src?: string | null;
  placeholder: string;
  height?: number;
  /** Raio das bordas do slot. 0 (padrão) mantém o visual do design system. */
  borderRadius?: number;
  /** Quando definido, o slot vira clicável e abre o seletor de arquivo. */
  onFileSelect?: (file: File) => void;
  accept?: string;
}

export function ImageSlot({ src, placeholder, height = 140, borderRadius = 0, onFileSelect, accept = "image/*" }: ImageSlotProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const resolvedSrc = previewUrl ?? src ?? null;

  const box = (
    <div
      // O filtro grayscale é só o visual de placeholder (igual ao protótipo);
      // uma vez que existe uma foto real, ela deve aparecer colorida.
      className={resolvedSrc ? undefined : "grayscale"}
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
        <Image src={resolvedSrc} alt={placeholder} fill style={{ objectFit: "cover" }} unoptimized />
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
          <CameraIcon size={22} />
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
        accept={accept}
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
