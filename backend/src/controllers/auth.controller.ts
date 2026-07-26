import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as authService from "../services/auth.service";

export const completeLogin = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const me = await authService.completeLogin(req.user.id, req.user.email);
  res.json(me);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const me = await authService.getMe(req.user.id);
  res.json(me);
});

export const updateAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const file = req.file;
  if (!file) throw ApiError.badRequest("Envie uma imagem para o avatar");

  const me = await authService.updateAvatar(req.user.id, {
    buffer: file.buffer,
    mimetype: file.mimetype,
    originalname: file.originalname,
  });
  res.json(me);
});
