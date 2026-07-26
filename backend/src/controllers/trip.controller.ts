import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as tripService from "../services/trip.service";

export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const trips = await tripService.listTripsForUser(req.user.id);
  res.json({ trips });
});

export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { title, location, startDate, endDate } = req.body;
  const file = req.file;

  const trip = await tripService.createTrip({
    title,
    location: location ?? "",
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    ownerId: req.user.id,
    cover: file ? { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname } : undefined,
  });

  res.status(201).json({ trip });
});

export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const trip = await tripService.getTripDetail(req.params.tripId, req.user.id);
  res.json({ trip });
});
