import * as entryModel from "../models/tripEntry.model";
import * as itemModel from "../models/tripEntryItem.model";
import * as reactionModel from "../models/entryReaction.model";
import { getProfilesMap } from "./profile.service";
import { uploadFile, type UploadableFile } from "./storage.service";
import { ApiError } from "../utils/ApiError";

export type ReactionType = reactionModel.ReactionType;

export interface ReactionSummary {
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
}

function summarizeReactions(reactions: reactionModel.ReactionRow[], userId: string): ReactionSummary {
  let likeCount = 0;
  let dislikeCount = 0;
  let myReaction: ReactionType | null = null;

  for (const reaction of reactions) {
    if (reaction.type === "like") likeCount++;
    else dislikeCount++;
    if (reaction.user_id === userId) myReaction = reaction.type;
  }

  return { likeCount, dislikeCount, myReaction };
}

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
  previewMediaUrl: string | null;
  previewMediaType: "photo" | "video" | null;
  previewText: string | null;
  author: string;
  authorInitials: string;
  createdAt: string;
  likeCount: number;
  dislikeCount: number;
  myReaction: ReactionType | null;
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

function summarize(
  entry: entryModel.TripEntryRow,
  items: itemModel.TripEntryItemRow[],
  authorName: string,
  authorInitials: string,
  reactions: ReactionSummary,
): EntrySummaryDTO {
  const firstMedia = items.find((i) => (i.type === "photo" || i.type === "video") && i.media_url);
  const first = items[0];

  return {
    id: entry.id,
    category: entry.category,
    itemCount: items.length,
    previewType: first?.type ?? null,
    previewMediaUrl: firstMedia?.media_url ?? null,
    previewMediaType: firstMedia ? (firstMedia.type as "photo" | "video") : null,
    previewText: first ? previewTextFor(first) : null,
    author: authorName,
    authorInitials,
    createdAt: entry.created_at,
    likeCount: reactions.likeCount,
    dislikeCount: reactions.dislikeCount,
    myReaction: reactions.myReaction,
  };
}

export async function listEntries(tripId: string, userId: string): Promise<EntrySummaryDTO[]> {
  const entries = await entryModel.listEntries(tripId);
  const items = await itemModel.listItemsForEntries(entries.map((e) => e.id));
  const profiles = await getProfilesMap(entries.map((e) => e.author_id));
  const reactions = await reactionModel.listReactionsForEntries(entries.map((e) => e.id));

  const itemsByEntry = new Map<string, itemModel.TripEntryItemRow[]>();
  for (const item of items) {
    const list = itemsByEntry.get(item.entry_id) ?? [];
    list.push(item);
    itemsByEntry.set(item.entry_id, list);
  }

  const reactionsByEntry = new Map<string, reactionModel.ReactionRow[]>();
  for (const reaction of reactions) {
    const list = reactionsByEntry.get(reaction.entry_id) ?? [];
    list.push(reaction);
    reactionsByEntry.set(reaction.entry_id, list);
  }

  return entries.map((entry) =>
    summarize(
      entry,
      itemsByEntry.get(entry.id) ?? [],
      profiles.get(entry.author_id)?.name ?? "Usuário",
      profiles.get(entry.author_id)?.initials ?? "??",
      summarizeReactions(reactionsByEntry.get(entry.id) ?? [], userId),
    ),
  );
}

export async function reactToEntry(tripId: string, entryId: string, userId: string, type: ReactionType): Promise<ReactionSummary> {
  const entry = await entryModel.findEntryById(tripId, entryId);
  if (!entry) throw ApiError.notFound("Descoberta não encontrada");

  const existing = await reactionModel.listReactionsForEntries([entryId]);
  const mine = existing.find((r) => r.user_id === userId);

  if (mine?.type === type) {
    await reactionModel.deleteReaction(entryId, userId);
  } else {
    await reactionModel.upsertReaction(entryId, userId, type);
  }

  const updated = await reactionModel.listReactionsForEntries([entryId]);
  return summarizeReactions(updated, userId);
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
