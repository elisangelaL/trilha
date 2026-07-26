import * as tripModel from "../models/trip.model";
import * as memberModel from "../models/tripMember.model";
import { ApiError } from "../utils/ApiError";
import { uploadFile, type UploadableFile } from "./storage.service";

export interface TripSummary {
  id: string;
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  coverUrl: string | null;
  role: memberModel.TripRole;
}

export async function listTripsForUser(userId: string): Promise<TripSummary[]> {
  const tripIds = await tripModel.listTripIdsForUser(userId);
  const trips = await tripModel.findTripsByIds(tripIds);

  return Promise.all(
    trips.map(async (trip) => {
      const role = await memberModel.getTripRole(trip.id, userId);
      return {
        id: trip.id,
        title: trip.title,
        location: trip.location,
        startDate: trip.start_date,
        endDate: trip.end_date,
        coverUrl: trip.cover_url,
        role: role ?? "viewer",
      };
    }),
  );
}

export interface CreateTripInput {
  title: string;
  location: string;
  startDate: string | null;
  endDate: string | null;
  ownerId: string;
  cover?: UploadableFile;
}

export async function createTrip(input: CreateTripInput): Promise<TripSummary> {
  const trip = await tripModel.createTrip(input);

  let coverUrl = trip.cover_url;
  if (input.cover) {
    coverUrl = await uploadFile(`covers/${trip.id}`, input.cover);
    await tripModel.updateTripCover(trip.id, coverUrl);
  }

  return {
    id: trip.id,
    title: trip.title,
    location: trip.location,
    startDate: trip.start_date,
    endDate: trip.end_date,
    coverUrl,
    role: "owner",
  };
}

export interface TripDetail extends TripSummary {
  memberCount: number;
}

export async function getTripDetail(tripId: string, userId: string): Promise<TripDetail> {
  const trip = await tripModel.findTripById(tripId);
  if (!trip) throw ApiError.notFound("Viagem não encontrada");

  const role = await memberModel.getTripRole(tripId, userId);
  if (!role) throw ApiError.forbidden("Você não é membro desta viagem");

  const members = await memberModel.listMembers(tripId);

  return {
    id: trip.id,
    title: trip.title,
    location: trip.location,
    startDate: trip.start_date,
    endDate: trip.end_date,
    coverUrl: trip.cover_url,
    role,
    memberCount: members.length,
  };
}
