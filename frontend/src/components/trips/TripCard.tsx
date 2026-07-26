"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "../ui/ImageSlot";
import { RoleTag } from "../ui/Tag";
import { MapPinIcon, CalendarIcon } from "../ui/icons";
import { formatDateRange, mapsUrlForLocation } from "../../lib/format";
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
        <a
          href={mapsUrlForLocation(trip.location)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="card-meta"
          style={{ textDecoration: "underline", textUnderlineOffset: 2, width: "fit-content" }}
        >
          <MapPinIcon size={12} />
          {trip.location}
        </a>
        <div className="card-meta">
          <CalendarIcon size={12} />
          {formatDateRange(trip.startDate, trip.endDate)}
        </div>
      </div>
    </div>
  );
}
