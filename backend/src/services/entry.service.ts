import * as entryModel from "../models/tripEntry.model";
import * as itemModel from "../models/tripEntryItem.model";
import { getProfilesMap } from "./profile.service";
import { uploadFile, type UploadableFile } from "./storage.service";
import { ApiError } from "../utils/ApiError";

export interface EntryItemDTO {
  id: string;
  type: itemModel.EntryItemType;
  title: string | null;
  body: string | null;
  caption: string | null;
  url: string | null;
  platform: string | null;
  mediaUrl: string | null;
  authorId: string;
  author: string;
  createdAt: string;
}

export interface EntrySummaryDTO {
  id: string;
  category: entryModel.EntryCategory;
  itemCount: number;
  previewType: itemModel.EntryItemType | null;
  previewPhotoUrl: string | null;
  previewText: string | null;
  author: string;
  createdAt: string;
}

export interface EntryDetailDTO {
  id: string;
  category: entryModel.EntryCategory;
  author: string;
  createdAt: string;
  items: EntryItemDTO[];
}

function toItemDTO(row: itemModel.TripEntryItemRow, authorName: string): EntryItemDTO {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    caption: row.caption,
    url: row.url,
    platform: row.platform,
    mediaUrl: row.media_url,
    authorId: row.author_id,
    author: authorName,
    createdAt: row.created_at,
  };
}

function previewTextFor(item: itemModel.TripEntryItemRow): string | null {
  if (item.type === "text") return item.title || item.body;
  if (item.type === "link") return item.title || item.platform;
  return item.caption;
}

function summarize(entry: entryModel.TripEntryRow, items: itemModel.TripEntryItemRow[], authorName: string): EntrySummaryDTO {
  const firstPhoto = items.find((i) => i.type === "photo" && i.media_url);
  const first = items[0];

  return {
    id: entry.id,
    category: entry.category,
    itemCount: items.length,
    previewType: first?.type ?? null,
    previewPhotoUrl: firstPhoto?.media_url ?? null,
    previewText: first ? previewTextFor(first) : null,
    author: authorName,
    createdAt: entry.created_at,
  };
}

export async function listEntries(tripId: string): Promise<EntrySummaryDTO[]> {
  const entries = await entryModel.listEntries(tripId);
  const items = await itemModel.listItemsForEntries(entries.map((e) => e.id));
  const profiles = await getProfilesMap(entries.map((e) => e.author_id));

  const itemsByEntry = new Map<string, itemModel.TripEntryItemRow[]>();
  for (const item of items) {
    const list = itemsByEntry.get(item.entry_id) ?? [];
    list.push(item);
    itemsByEntry.set(item.entry_id, list);
  }

  return entries.map((entry) =>
    summarize(entry, itemsByEntry.get(entry.id) ?? [], profiles.get(entry.author_id)?.name ?? "Usuário"),
  );
}

export async function getEntryDetail(tripId: string, entryId: string): Promise<EntryDetailDTO> {
  const entry = await entryModel.findEntryById(tripId, entryId);
  if (!entry) throw ApiError.notFound("Descoberta não encontrada");

  const items = await itemModel.listItems(entryId);
  const profiles = await getProfilesMap([entry.author_id, ...items.map((i) => i.author_id)]);

  return {
    id: entry.id,
    category: entry.category,
    author: profiles.get(entry.author_id)?.name ?? "Usuário",
    createdAt: entry.created_at,
    items: items.map((item) => toItemDTO(item, profiles.get(item.author_id)?.name ?? "Usuário")),
  };
}

export interface NewItemInput {
  type: itemModel.EntryItemType;
  title?: string;
  body?: string;
  caption?: string;
  url?: string;
  platform?: string;
  media?: UploadableFile;
}

export interface CreateEntryInput extends NewItemInput {
  tripId: string;
  authorId: string;
  category: entryModel.EntryCategory;
}

export async function createEntry(input: CreateEntryInput): Promise<EntryDetailDTO> {
  const entry = await entryModel.createEntry({ tripId: input.tripId, authorId: input.authorId, category: input.category });

  await addItem(input.tripId, entry.id, input.authorId, {
    type: input.type,
    title: input.title,
    body: input.body,
    caption: input.caption,
    url: input.url,
    platform: input.platform,
    media: input.media,
  });

  return getEntryDetail(input.tripId, entry.id);
}

export async function addItem(
  tripId: string,
  entryId: string,
  authorId: string,
  input: NewItemInput,
): Promise<EntryItemDTO> {
  const entry = await entryModel.findEntryById(tripId, entryId);
  if (!entry) throw ApiError.notFound("Descoberta não encontrada");

  let mediaUrl: string | undefined;
  if (input.media) {
    mediaUrl = await uploadFile(`entries/${tripId}/${entryId}`, input.media);
  }

  const row = await itemModel.createItem({
    entryId,
    tripId,
    authorId,
    type: input.type,
    title: input.title,
    body: input.body,
    caption: input.caption,
    url: input.url,
    platform: input.platform,
    mediaUrl,
  });

  const profiles = await getProfilesMap([row.author_id]);
  return toItemDTO(row, profiles.get(row.author_id)?.name ?? "Usuário");
}

export interface UpdateItemInput {
  title?: string;
  body?: string;
  caption?: string;
  url?: string;
  platform?: string;
}

export async function updateItem(
  tripId: string,
  entryId: string,
  itemId: string,
  patch: UpdateItemInput,
): Promise<EntryItemDTO> {
  const entry = await entryModel.findEntryById(tripId, entryId);
  if (!entry) throw ApiError.notFound("Descoberta não encontrada");

  const existing = await itemModel.findItemById(entryId, itemId);
  if (!existing) throw ApiError.notFound("Item não encontrado");

  const row = await itemModel.updateItem(entryId, itemId, patch);
  const profiles = await getProfilesMap([row.author_id]);
  return toItemDTO(row, profiles.get(row.author_id)?.name ?? "Usuário");
}
