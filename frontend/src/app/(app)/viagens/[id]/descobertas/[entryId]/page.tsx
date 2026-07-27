"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTripDetail } from "../../../../../../hooks/useTripDetail";
import { useEntryDetail } from "../../../../../../hooks/useEntryDetail";
import { TopNav } from "../../../../../../components/ui/TopNav";
import { Button } from "../../../../../../components/ui/Button";
import { EntryItemCard } from "../../../../../../components/entries/EntryItemCard";
import { AddItemDialog } from "../../../../../../components/entries/AddItemDialog";
import { EditEntryDialog } from "../../../../../../components/entries/EditEntryDialog";
import { PlusIcon } from "../../../../../../components/ui/icons";
import { ENTRY_CATEGORY_LABELS } from "../../../../../../lib/entryCategories";
import type { EntryItem } from "../../../../../../types";

export default function EntryDetailPage() {
  const params = useParams<{ id: string; entryId: string }>();
  const tripId = params.id;
  const entryId = params.entryId;
  const router = useRouter();

  const { trip } = useTripDetail(tripId);
  const { entry, loading, addItem, editItem } = useEntryDetail(tripId, entryId);

  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<EntryItem | null>(null);

  const canEdit = trip ? trip.role !== "viewer" : false;

  if (loading || !entry) {
    return (
      <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
        <TopNav title="Descoberta" onBack={() => router.push(`/viagens/${tripId}`)} />
        <p className="text-muted" style={{ padding: 16 }}>Carregando...</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopNav title={ENTRY_CATEGORY_LABELS[entry.category]} onBack={() => router.push(`/viagens/${tripId}`)} />

      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {entry.items.map((item) => (
          <EntryItemCard key={item.id} item={item} canEdit={canEdit} onEdit={() => setEditingItem(item)} />
        ))}
        {entry.items.length === 0 && <p className="text-muted">Nenhum conteúdo ainda.</p>}
      </div>

      {canEdit && (
        <Button
          variant="primary"
          className="btn-icon"
          style={{ position: "absolute", right: 20, bottom: 20, width: 52, height: 52, boxShadow: "var(--shadow-accent)" }}
          title="Adicionar conteúdo"
          onClick={() => setShowAddItem(true)}
        >
          <PlusIcon size={22} />
        </Button>
      )}

      {showAddItem && <AddItemDialog onClose={() => setShowAddItem(false)} onSubmit={addItem} />}
      {editingItem && (
        <EditEntryDialog
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(input) => editItem(editingItem.id, input)}
        />
      )}
    </div>
  );
}
