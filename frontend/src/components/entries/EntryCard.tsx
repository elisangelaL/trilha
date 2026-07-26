"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "../ui/ImageSlot";
import { VideoIcon, LinkIcon, UserIcon } from "../ui/icons";
import type { EntrySummary } from "../../types";

function PreviewIcon({ entry }: { entry: EntrySummary }) {
  if (entry.previewType === "video") return <VideoIcon size={22} />;
  if (entry.previewType === "link") return <LinkIcon size={22} />;
  return <UserIcon size={22} />;
}

export function EntryCard({ tripId, entry }: { tripId: string; entry: EntrySummary }) {
  const router = useRouter();

  return (
    <div
      className="card elev-sm"
      style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
      onClick={() => router.push(`/viagens/${tripId}/descobertas/${entry.id}`)}
    >
      {entry.previewPhotoUrl ? (
        <ImageSlot src={entry.previewPhotoUrl} placeholder="Foto de referência" height={140} />
      ) : (
        <div
          style={{
            width: "100%",
            height: 90,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            background: "var(--color-surface)",
            color: "var(--color-neutral-500)",
          }}
        >
          <PreviewIcon entry={entry} />
        </div>
      )}
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 4 }}>
        <div className="card-title" style={{ fontSize: 14 }}>
          {entry.previewText || "Descoberta"}
        </div>
        <div className="card-meta">
          <UserIcon size={11} />
          {entry.author} · {entry.itemCount} {entry.itemCount === 1 ? "item" : "itens"}
        </div>
      </div>
    </div>
  );
}
