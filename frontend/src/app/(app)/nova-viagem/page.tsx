"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrips } from "../../../hooks/useTrips";
import { TopNav } from "../../../components/ui/TopNav";
import { Field, Input } from "../../../components/ui/Field";
import { Button } from "../../../components/ui/Button";
import { ImageSlot } from "../../../components/ui/ImageSlot";

export default function NewTripPage() {
  const router = useRouter();
  const { createTrip } = useTrips();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cover, setCover] = useState<File | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!title.trim()) {
      setError("Dê um título para a viagem");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const trip = await createTrip({
        title,
        location,
        startDate: startDate || null,
        endDate: endDate || null,
        cover,
      });
      router.push(`/viagens/${trip.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar a viagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", height: "100dvh", display: "flex", flexDirection: "column" }}>
      <TopNav title="Nova viagem" backHref="/" />
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        <ImageSlot placeholder="Foto de capa" height={130} onFileSelect={setCover} />
        <Field label="Título">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Chapada Diamantina" />
        </Field>
        <Field label="Local">
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ex: Bahia, Brasil" />
        </Field>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <Field label="Início">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Fim">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
        </div>
        {error && <div style={{ color: "var(--color-accent)", fontSize: 13 }}>{error}</div>}
        <Button variant="primary" block loading={loading} onClick={handleSubmit}>
          Criar viagem
        </Button>
      </div>
    </div>
  );
}
