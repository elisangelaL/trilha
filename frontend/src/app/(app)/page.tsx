"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useTrips } from "../../hooks/useTrips";
import { TripCard } from "../../components/trips/TripCard";
import { BottomNav, type HomeTab } from "../../components/ui/BottomNav";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { LogoIcon, PlusIcon, ArrowRightIcon } from "../../components/ui/icons";

function ViagensTab() {
  const { trips, loading, error } = useTrips();
  const router = useRouter();

  return (
    <>
      <h6 style={{ margin: "0 0 12px" }}>Suas viagens</h6>
      {loading && <p className="text-muted">Carregando...</p>}
      {error && <p style={{ color: "var(--color-accent)" }}>{error}</p>}
      {!loading && trips.length === 0 && <p className="text-muted">Você ainda não tem viagens. Crie a primeira!</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
      <Button
        variant="primary"
        className="btn-icon"
        style={{ position: "absolute", right: 20, bottom: 88, width: 52, height: 52, boxShadow: "var(--shadow-md)" }}
        title="Nova viagem"
        onClick={() => router.push("/nova-viagem")}
      >
        <PlusIcon size={22} />
      </Button>
    </>
  );
}

function PerfilTab() {
  const { profile, signOut } = useAuth();

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 0 24px" }}>
        <Avatar initials={profile?.initials ?? "?"} size={72} />
        <h3 style={{ margin: "8px 0 0" }}>{profile?.name ?? "Você"}</h3>
        <div className="text-muted" style={{ fontSize: 13 }}>{profile?.email}</div>
      </div>
      <div className="hr" style={{ margin: "0 0 16px" }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Button variant="secondary" block disabled>Editar perfil</Button>
        <Button variant="secondary" block disabled>Notificações</Button>
        <Button variant="secondary" block disabled>Ajuda e suporte</Button>
        <Button variant="secondary" block onClick={() => void signOut()} style={{ color: "var(--color-accent-700)" }}>
          <ArrowRightIcon size={16} />
          Sair da conta
        </Button>
      </div>
    </>
  );
}

export default function HomePage() {
  const [tab, setTab] = useState<HomeTab>("viagens");
  const { profile } = useAuth();

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div className="nav">
        <div className="nav-brand" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoIcon size={20} style={{ color: "var(--color-accent)" }} />
          Trilha
        </div>
        <Avatar initials={profile?.initials ?? "?"} size={32} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px", position: "relative" }}>
        {tab === "viagens" ? <ViagensTab /> : <PerfilTab />}
      </div>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
