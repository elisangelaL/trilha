import { ImageSlot } from "../ui/ImageSlot";
import { VideoSlot } from "../ui/VideoSlot";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import { LinkIcon, PencilIcon, UserIcon } from "../ui/icons";
import type { EntryItem } from "../../types";

export function EntryItemCard({ item, canEdit, onEdit }: { item: EntryItem; canEdit?: boolean; onEdit?: () => void }) {
  const editButton = canEdit ? (
    <Button variant="icon" title="Editar" onClick={onEdit}>
      <PencilIcon size={14} />
    </Button>
  ) : null;

  if (item.type === "photo") {
    return (
      <figure style={{ margin: 0 }}>
        <div style={{ position: "relative" }}>
          <ImageSlot src={item.mediaUrl} placeholder="Foto de referência" height={190} />
          {canEdit && (
            <Button
              variant="icon"
              title="Editar legenda"
              onClick={onEdit}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "color-mix(in srgb, var(--color-neutral-900) 70%, transparent)",
                width: 28,
                height: 28,
              }}
            >
              <PencilIcon size={14} style={{ color: "#fff" }} />
            </Button>
          )}
        </div>
        <figcaption>
          {item.caption || <span className="text-muted">Sem legenda</span>} · <span className="text-muted">{item.author}</span>
        </figcaption>
      </figure>
    );
  }

  if (item.type === "video") {
    return (
      <figure style={{ margin: 0 }}>
        <div style={{ position: "relative" }}>
          <VideoSlot src={item.mediaUrl} placeholder="Vídeo" height={200} borderRadius={10} />
          {canEdit && (
            <Button
              variant="icon"
              title="Editar legenda"
              onClick={onEdit}
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                background: "color-mix(in srgb, var(--color-neutral-900) 70%, transparent)",
                width: 28,
                height: 28,
              }}
            >
              <PencilIcon size={14} style={{ color: "#fff" }} />
            </Button>
          )}
        </div>
        <figcaption>
          {item.caption || <span className="text-muted">Sem legenda</span>} · <span className="text-muted">{item.author}</span>
        </figcaption>
      </figure>
    );
  }

  if (item.type === "text") {
    return (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div className="card-kicker">Anotação</div>
            <div className="card-title">{item.title}</div>
          </div>
          {editButton}
        </div>
        <p className="card-body">{item.body || <span className="text-muted">Sem texto ainda</span>}</p>
        <div className="card-meta">
          <UserIcon size={11} />
          {item.author}
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ flexDirection: "row", padding: 0, overflow: "hidden" }}>
      <div style={{ width: 96, height: 96, flex: "none" }}>
        <ImageSlot src={item.mediaUrl} placeholder="thumb" height={96} />
      </div>
      <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 4, justifyContent: "center", minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Tag variant="outline">
            <LinkIcon size={10} style={{ marginRight: 4 }} />
            {item.platform}
          </Tag>
          {editButton}
        </div>
        <div className="card-title" style={{ fontSize: 14 }}>{item.title}</div>
        <div className="card-meta">
          <UserIcon size={11} />
          {item.author}
        </div>
      </div>
    </div>
  );
}
