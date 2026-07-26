"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import { useTrips } from "../../hooks/useTrips";
import { TripCard } from "../../components/trips/TripCard";
import { BottomNav } from "../../components/ui/BottomNav";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { LogoIcon, PlusIcon } from "../../components/ui/icons";

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

export default function HomePage() {
  const router = useRouter();
  const { profile } = useAuth();

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <div className="nav">
        <div className="nav-brand" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoIcon size={20} style={{ color: "var(--color-accent)" }} />
          Trilha
        </div>
        <button
          onClick={() => router.push("/perfil")}
          aria-label="Ver perfil"
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", borderRadius: "50%", lineHeight: 0 }}
        >
          <Avatar initials={profile?.initials ?? "?"} src={profile?.avatarUrl} size={32} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px 100px", position: "relative" }}>
        <ViagensTab />
      </div>

      <BottomNav active="viagens" onChange={(tab) => tab === "perfil" && router.push("/perfil")} />
    </div>
  );
}
