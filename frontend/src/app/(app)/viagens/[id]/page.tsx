"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth";
import { useTripDetail } from "../../../../hooks/useTripDetail";
import { useEntries, type NewEntryInput } from "../../../../hooks/useEntries";
import { useExpenses } from "../../../../hooks/useExpenses";
import { useMembers } from "../../../../hooks/useMembers";
import { TopNav } from "../../../../components/ui/TopNav";
import { Button } from "../../../../components/ui/Button";
import { ImageSlot } from "../../../../components/ui/ImageSlot";
import { RoleTag, Tag } from "../../../../components/ui/Tag";
import { SegmentedControl } from "../../../../components/ui/SegmentedControl";
import { EntryCard } from "../../../../components/entries/EntryCard";
import { AddEntryDialog } from "../../../../components/entries/AddEntryDialog";
import { ExpenseSummaryCard } from "../../../../components/expenses/ExpenseSummaryCard";
import { ExpenseCard } from "../../../../components/expenses/ExpenseCard";
import { AddExpenseDialog } from "../../../../components/expenses/AddExpenseDialog";
import { MemberRow } from "../../../../components/members/MemberRow";
import { InviteDialog } from "../../../../components/members/InviteDialog";
import { MapPinIcon, CalendarIcon, ChatIcon, MoreVerticalIcon, PlusIcon, UsersIcon } from "../../../../components/ui/icons";
import { formatDateRange, mapsUrlForLocation } from "../../../../lib/format";
import { ENTRY_CATEGORY_LABELS } from "../../../../lib/entryCategories";
import type { EntryCategory } from "../../../../types";

const TripMap = dynamic(() => import("../../../../components/entries/TripMap").then((m) => m.TripMap), {
  ssr: false,
  loading: () => <p className="text-muted" style={{ padding: 16 }}>Carregando mapa...</p>,
});

type TripTab = "overview" | "map" | "expenses" | "members";

export default function TripDetailPage() {
  const params = useParams<{ id: string }>();
  const tripId = params.id;
  const router = useRouter();

  const { session } = useAuth();
  const { trip, loading: tripLoading } = useTripDetail(tripId);
  const entriesState = useEntries(tripId);
  const expensesState = useExpenses(tripId);
  const membersState = useMembers(tripId);

  const [tab, setTab] = useState<TripTab>("overview");
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const justAddedEntryIdRef = useRef<string | null>(null);

  useEffect(() => {
    const id = justAddedEntryIdRef.current;
    if (!id) return;
    if (!entriesState.entries.some((e) => e.id === id)) return;
    document.getElementById(`entry-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    justAddedEntryIdRef.current = null;
  }, [entriesState.entries]);

  async function handleAddEntry(input: NewEntryInput) {
    const entry = await entriesState.addEntry(input);
    justAddedEntryIdRef.current = entry.id;
    return entry;
  }

  if (tripLoading || !trip) {
    return (
      <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
        <TopNav title="Viagem" backHref="/" />
        <p className="text-muted" style={{ padding: 16 }}>Carregando...</p>
      </div>
    );
  }

  const canEdit = trip.role !== "viewer";
  const canManageMembers = trip.role === "owner";

  const categories = (Object.keys(ENTRY_CATEGORY_LABELS) as EntryCategory[])
    .map((key) => ({ key, label: ENTRY_CATEGORY_LABELS[key], items: entriesState.entries.filter((e) => e.category === key) }))
    .filter((c) => c.items.length > 0);

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopNav
        title={trip.title}
        backHref="/"
        right={
          <>
            <Button variant="icon" title="Chat" onClick={() => router.push(`/viagens/${tripId}/chat`)}>
              <ChatIcon size={18} />
            </Button>
            <Button variant="icon">
              <MoreVerticalIcon size={18} />
            </Button>
          </>
        }
      />

      <div style={{ flex: 1, overflowY: "auto" }}>
        <ImageSlot src={trip.coverUrl} placeholder="Foto de capa da viagem" height={170} />

        <div style={{ padding: "16px 16px 8px" }}>
          <RoleTag role={trip.role} />
          <h2 style={{ margin: "10px 0 6px" }}>{trip.title}</h2>
          <a
            href={mapsUrlForLocation(trip.location)}
            target="_blank"
            rel="noopener noreferrer"
            className="card-meta"
            style={{ marginBottom: 3, textDecoration: "underline", textUnderlineOffset: 2, width: "fit-content" }}
          >
            <MapPinIcon size={13} />
            {trip.location}
          </a>
          <div className="card-meta">
            <CalendarIcon size={13} />
            {formatDateRange(trip.startDate, trip.endDate)}
          </div>
        </div>

        <div style={{ padding: "0 16px 14px" }}>
          <SegmentedControl
            name="tripTab"
            value={tab}
            onChange={setTab}
            options={[
              { value: "overview", label: "Descobertas" },
              { value: "map", label: "Mapa" },
              { value: "expenses", label: "Gastos" },
              { value: "members", label: "Membros" },
            ]}
          />
        </div>

        {tab === "overview" && (
          <div style={{ padding: "0 16px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            {categories.map((cat) => (
              <div key={cat.key} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <h6 style={{ margin: "6px 0 -2px", color: "var(--color-accent-700)" }}>{cat.label}</h6>
                {cat.items.map((entry) => (
                  <div key={entry.id} id={`entry-${entry.id}`}>
                    <EntryCard
                      tripId={tripId}
                      entry={entry}
                      onReact={entriesState.react}
                      canDelete={entry.authorId === session?.user.id || trip.role === "owner"}
                      onDelete={entriesState.deleteEntry}
                    />
                  </div>
                ))}
              </div>
            ))}
            {categories.length === 0 && <p className="text-muted">Nenhuma descoberta ainda.</p>}
            {!canEdit && (
              <Tag variant="neutral">Somente leitura</Tag>
            )}
          </div>
        )}

        {tab === "map" && <TripMap tripId={tripId} entries={entriesState.entries} />}

        {tab === "expenses" && (
          <div style={{ padding: "0 16px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
            <ExpenseSummaryCard total={expensesState.total} balances={expensesState.balances} />
            {expensesState.expenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} />
            ))}
            {canEdit && (
              <Button variant="primary" block onClick={() => setShowAddExpense(true)}>
                <PlusIcon size={16} />
                Adicionar gasto
              </Button>
            )}
          </div>
        )}

        {tab === "members" && (
          <div style={{ padding: "0 16px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
            {membersState.members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canManage={canManageMembers}
                onRemove={() => void membersState.remove(member.id)}
              />
            ))}
            {canManageMembers && (
              <Button variant="primary" block onClick={() => setShowInvite(true)}>
                <UsersIcon size={16} />
                Convidar pessoa
              </Button>
            )}
          </div>
        )}
      </div>

      {tab === "overview" && canEdit && (
        <Button
          variant="primary"
          className="btn-icon"
          style={{ position: "absolute", right: 20, bottom: 20, width: 52, height: 52, boxShadow: "var(--shadow-accent)" }}
          title="Adicionar descoberta"
          onClick={() => setShowAddEntry(true)}
        >
          <PlusIcon size={22} />
        </Button>
      )}

      {showAddEntry && (
        <AddEntryDialog onClose={() => setShowAddEntry(false)} onSubmit={handleAddEntry} />
      )}
      {showAddExpense && (
        <AddExpenseDialog members={membersState.members} onClose={() => setShowAddExpense(false)} onSubmit={expensesState.addExpense} />
      )}
      {showInvite && (
        <InviteDialog onClose={() => setShowInvite(false)} onSubmit={membersState.invite} />
      )}
    </div>
  );
}
