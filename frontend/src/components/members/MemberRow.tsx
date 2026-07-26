import { Avatar } from "../ui/Avatar";
import { Tag } from "../ui/Tag";
import { Button } from "../ui/Button";
import { ROLE_LABEL } from "../ui/Tag";
import { TrashIcon } from "../ui/icons";
import type { Member } from "../../types";

export function MemberRow({ member, canManage, onRemove }: { member: Member; canManage: boolean; onRemove?: () => void }) {
  return (
    <div className="card" style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <Avatar initials={member.initials} size={36} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{member.name}</div>
          <div className="text-muted" style={{ fontSize: 11 }}>{ROLE_LABEL[member.role]}</div>
        </div>
      </div>
      {canManage && (
        member.role === "owner" ? (
          <Tag variant="accent">Dono</Tag>
        ) : (
          <Button variant="icon" title="Remover" onClick={onRemove}>
            <TrashIcon size={16} />
          </Button>
        )
      )}
    </div>
  );
}
