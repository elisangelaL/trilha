import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as messageService from "../services/message.service";

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  const messages = await messageService.listMessages(req.params.tripId);
  res.json({ messages });
});

export const createMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { type, text, durationSeconds } = req.body;
  const file = req.file;

  if (type === "text" && !text) {
    throw ApiError.badRequest("Mensagem de texto vazia");
  }
  if ((type === "image" || type === "audio") && !file) {
    throw ApiError.badRequest("Envie um arquivo para mensagens de foto/áudio");
  }

  const message = await messageService.createMessage({
    tripId: req.params.tripId,
    authorId: req.user.id,
    type,
    text,
    durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
    media: file ? { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname } : undefined,
  });

  res.status(201).json({ message });
});

export const deleteMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.tripRole) throw ApiError.unauthorized();
  await messageService.deleteMessage(req.params.tripId, req.params.messageId, req.user.id, req.tripRole);
  res.status(204).send();
});

export const updateMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { text } = req.body;
  const message = await messageService.updateMessageText(req.params.tripId, req.params.messageId, req.user.id, text);
  res.json({ message });
});
