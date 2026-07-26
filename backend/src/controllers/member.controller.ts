import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as memberService from "../services/member.service";

export const listMembers = asyncHandler(async (req: Request, res: Response) => {
  const members = await memberService.listMembers(req.params.tripId);
  res.json({ members });
});

export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { email, role } = req.body;

  const result = await memberService.invite({
    tripId: req.params.tripId,
    email,
    role,
    invitedBy: req.user.id,
  });

  res.status(201).json(result);
});

export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  await memberService.removeMember(req.params.tripId, req.params.memberId);
  res.status(204).send();
});
