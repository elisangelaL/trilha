"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "../ui/ImageSlot";
import { VideoSlot } from "../ui/VideoSlot";
import { Avatar } from "../ui/Avatar";
import { Tag } from "../ui/Tag";
import { HeartIcon, ThumbsDownIcon, ShareIcon, LinkIcon, VideoIcon } from "../ui/icons";
import { formatRelativeTime } from "../../lib/format";
import { ENTRY_CATEGORY_LABELS } from "../../lib/entryCategories";
import type { EntrySummary, ReactionType } from "../../types";

export function EntryCard({
  tripId,
  entry,
  onReact,
}: {
  tripId: string;
  entry: EntrySummary;
  onReact: (entryId: string, type: ReactionType) => void;
}) {
  const router = useRouter();
  const liked = entry.myReaction === "like";
  const disliked = entry.myReaction === "dislike";

  function openEntry() {
    router.push(`/viagens/${tripId}/descobertas/${entry.id}`);
  }

  function share(e: React.MouseEvent) {
    e.stopPropagation();
    router.push(`/viagens/${tripId}/chat?shareEntry=${entry.id}`);
  }

  return (
    <div className="card elev-sm" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer" }} onClick={openEntry}>
        <Avatar initials={entry.authorInitials} size={30} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.author}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{formatRelativeTime(entry.createdAt)}</div>
        </div>
        <Tag variant="outline">{ENTRY_CATEGORY_LABELS[entry.category]}</Tag>
      </div>

      <div style={{ cursor: "pointer" }} onClick={openEntry}>
        {entry.previewMediaType === "video" ? (
          <VideoSlot src={entry.previewMediaUrl} placeholder="Vídeo" height={320} />
        ) : entry.previewMediaUrl ? (
          <ImageSlot src={entry.previewMediaUrl} placeholder="Foto de referência" height={320} />
        ) : (
          <div
            style={{
              width: "100%",
              height: 140,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--color-surface)",
              color: "var(--color-neutral-500)",
            }}
          >
            {entry.previewType === "link" ? <LinkIcon size={26} /> : <VideoIcon size={26} />}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "10px 12px 4px" }}>
        <button
          className="entry-action-btn"
          onClick={(e) => { e.stopPropagation(); onReact(entry.id, "like"); }}
          title="Curtir"
          style={{ color: liked ? "var(--color-accent)" : undefined }}
        >
          <HeartIcon size={22} fill={liked ? "var(--color-accent)" : "none"} stroke={liked ? "var(--color-accent)" : "currentColor"} />
          {entry.likeCount > 0 && <span>{entry.likeCount}</span>}
        </button>
        <button
          className="entry-action-btn"
          onClick={(e) => { e.stopPropagation(); onReact(entry.id, "dislike"); }}
          title="Não curtir"
          style={{ color: disliked ? "var(--color-accent)" : undefined }}
        >
          <ThumbsDownIcon size={20} fill={disliked ? "var(--color-accent)" : "none"} stroke={disliked ? "var(--color-accent)" : "currentColor"} />
          {entry.dislikeCount > 0 && <span>{entry.dislikeCount}</span>}
        </button>
        <button className="entry-action-btn" onClick={share} title="Compartilhar" style={{ marginLeft: "auto" }}>
          <ShareIcon size={20} />
        </button>
      </div>

      <div style={{ padding: "0 12px 12px" }}>
        <p style={{ margin: 0, fontSize: 13 }}>
          {entry.previewText || "Descoberta"}
          {entry.itemCount > 1 && <span className="text-muted"> · {entry.itemCount} itens</span>}
        </p>
      </div>
    </div>
  );
}
