import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as pushService from "../services/push.service";

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { endpoint, keys } = req.body;
  await pushService.subscribe(req.user.id, { endpoint, keys });
  res.status(204).send();
});

export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body;
  await pushService.unsubscribe(endpoint);
  res.status(204).send();
});
