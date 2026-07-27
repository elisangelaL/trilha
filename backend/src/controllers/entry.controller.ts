import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as entryService from "../services/entry.service";

function fileFromRequest(req: Request) {
  const file = req.file;
  return file ? { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname } : undefined;
}

export const listEntries = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const entries = await entryService.listEntries(req.params.tripId, req.user.id);
  res.json({ entries });
});

export const getEntry = asyncHandler(async (req: Request, res: Response) => {
  const entry = await entryService.getEntryDetail(req.params.tripId, req.params.entryId);
  res.json({ entry });
});

export const createEntry = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { type, category, title, body, caption, url, platform, address } = req.body;
  const media = fileFromRequest(req);

  if ((type === "photo" || type === "video") && !media) {
    throw ApiError.badRequest(`Envie um arquivo para descobertas do tipo '${type}'`);
  }

  const entry = await entryService.createEntry({
    tripId: req.params.tripId,
    authorId: req.user.id,
    category,
    type,
    title,
    body,
    caption,
    url,
    platform,
    address,
    media,
  });

  res.status(201).json({ entry });
});

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { type, title, body, caption, url, platform } = req.body;
  const media = fileFromRequest(req);

  if ((type === "photo" || type === "video") && !media) {
    throw ApiError.badRequest(`Envie um arquivo para itens do tipo '${type}'`);
  }

  const item = await entryService.addItem(req.params.tripId, req.params.entryId, req.user.id, {
    type,
    title,
    body,
    caption,
    url,
    platform,
    media,
  });

  res.status(201).json({ item });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, caption, url, platform } = req.body;

  const item = await entryService.updateItem(req.params.tripId, req.params.entryId, req.params.itemId, {
    title,
    body,
    caption,
    url,
    platform,
  });

  res.json({ item });
});

export const reactToEntry = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { type } = req.body;
  const reactions = await entryService.reactToEntry(req.params.tripId, req.params.entryId, req.user.id, type);
  res.json({ reactions });
});

export const deleteEntry = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user || !req.tripRole) throw ApiError.unauthorized();
  await entryService.deleteEntry(req.params.tripId, req.params.entryId, req.user.id, req.tripRole);
  res.status(204).send();
});
