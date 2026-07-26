"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "../ui/ImageSlot";
import { RoleTag } from "../ui/Tag";
import { MapPinIcon, CalendarIcon } from "../ui/icons";
import { formatDateRange } from "../../lib/format";
import type { Trip } from "../../types";

export function TripCard({ trip }: { trip: Trip }) {
  const router = useRouter();

  return (
    <div
      className="card elev-sm"
      style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
      onClick={() => router.push(`/viagens/${trip.id}`)}
    >
      <ImageSlot src={trip.coverUrl} placeholder="Foto de capa da viagem" height={140} />
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ alignSelf: "flex-start" }}>
          <RoleTag role={trip.role} />
        </div>
        <div className="card-title">{trip.title}</div>
        <div className="card-meta">
          <MapPinIcon size={12} />
          {trip.location}
        </div>
        <div className="card-meta">
          <CalendarIcon size={12} />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </div>
    </div>
  );
}
