"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { ENTRY_CATEGORY_LABELS } from "../../lib/entryCategories";
import type { EntryCategory, EntrySummary } from "../../types";

const CATEGORY_COLORS: Record<EntryCategory, string> = {
  visitar: "#E86C5D",
  comer: "#e0a03c",
  hospedagem: "#4f8fd6",
  transporte: "#6c63c9",
};

function categoryIcon(category: EntryCategory) {
  const color = CATEGORY_COLORS[category];
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -22],
  });
}

type PinnedEntry = EntrySummary & { latitude: number; longitude: number };

export function TripMap({ tripId, entries }: { tripId: string; entries: EntrySummary[] }) {
  const router = useRouter();
  const pins = entries.filter((e): e is PinnedEntry => e.latitude != null && e.longitude != null);

  if (pins.length === 0) {
    return (
      <p className="text-muted" style={{ padding: 16 }}>
        Nenhum item com localização ainda. Ao publicar uma descoberta, preencha o campo &quot;Endereço ou local&quot; para que ela apareça aqui.
      </p>
    );
  }

  const center: [number, number] = [pins[0].latitude, pins[0].longitude];

  return (
    <div style={{ height: 480 }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((entry) => (
          <Marker key={entry.id} position={[entry.latitude, entry.longitude]} icon={categoryIcon(entry.category)}>
            <Popup>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{ENTRY_CATEGORY_LABELS[entry.category]}</div>
              <div style={{ fontSize: 12, margin: "2px 0 6px" }}>{entry.address || entry.previewText || "Descoberta"}</div>
              <button
                onClick={() => router.push(`/viagens/${tripId}/descobertas/${entry.id}`)}
                style={{ background: "none", border: "none", padding: 0, color: "var(--color-accent)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
              >
                Ver descoberta
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
