import * as messageModel from "../models/tripMessage.model";
import { getProfilesMap } from "./profile.service";
import { uploadFile, deleteFileByPublicUrl, type UploadableFile } from "./storage.service";
import { listEntries, type EntrySummaryDTO } from "./entry.service";
import { ApiError } from "../utils/ApiError";
import type { TripRole } from "../models/tripMember.model";

export interface MessageDTO {
  id: string;
  type: messageModel.MessageType;
  text: string | null;
  mediaUrl: string | null;
  durationSeconds: number | null;
  sharedEntry: EntrySummaryDTO | null;
  authorId: string;
  author: string;
  authorInitials: string;
  createdAt: string;
  editedAt: string | null;
}

function toDTO(
  row: messageModel.TripMessageRow,
  authorName: string,
  authorInitials: string,
  sharedEntry: EntrySummaryDTO | null,
): MessageDTO {
  return {
    id: row.id,
    type: row.type,
    text: row.text,
    mediaUrl: row.media_url,
    durationSeconds: row.duration_seconds,
    sharedEntry,
    authorId: row.author_id,
    author: authorName,
    authorInitials,
    createdAt: row.created_at,
    editedAt: row.edited_at,
  };
}

export async function listMessages(tripId: string, userId: string): Promise<MessageDTO[]> {
  const rows = await messageModel.listMessages(tripId);
  const profiles = await getProfilesMap(rows.map((r) => r.author_id));

  const sharedEntryIds = [...new Set(rows.map((r) => r.shared_entry_id).filter((id): id is string => !!id))];
  const entryMap = new Map<string, EntrySummaryDTO>();
  if (sharedEntryIds.length > 0) {
    const entries = await listEntries(tripId, userId);
    for (const entry of entries) {
      if (sharedEntryIds.includes(entry.id)) entryMap.set(entry.id, entry);
    }
  }

  return rows.map((row) => {
    const profile = profiles.get(row.author_id);
    const sharedEntry = row.shared_entry_id ? entryMap.get(row.shared_entry_id) ?? null : null;
    return toDTO(row, profile?.name ?? "Usuário", profile?.initials ?? "??", sharedEntry);
  });
}

export interface CreateMessageInput {
  tripId: string;
  authorId: string;
  type: messageModel.MessageType;
  text?: string;
  media?: UploadableFile;
  durationSeconds?: number;
  sharedEntryId?: string;
}

export async function createMessage(input: CreateMessageInput): Promise<MessageDTO> {
  let mediaUrl: string | undefined;
  if (input.media) {
    mediaUrl = await uploadFile(`chat/${input.tripId}`, input.media);
  }

  const row = await messageModel.createMessage({
    tripId: input.tripId,
    authorId: input.authorId,
    type: input.type,
    text: input.text,
    mediaUrl,
    durationSeconds: input.durationSeconds,
    sharedEntryId: input.sharedEntryId,
  });

  const profiles = await getProfilesMap([row.author_id]);
  const profile = profiles.get(row.author_id);

  let sharedEntry: EntrySummaryDTO | null = null;
  if (row.shared_entry_id) {
    const entries = await listEntries(input.tripId, input.authorId);
    sharedEntry = entries.find((e) => e.id === row.shared_entry_id) ?? null;
  }

  return toDTO(row, profile?.name ?? "Usuário", profile?.initials ?? "??", sharedEntry);
}

/** Só o autor da mensagem ou o dono da viagem podem apagá-la. */
export async function deleteMessage(tripId: string, messageId: string, userId: string, userRole: TripRole): Promise<void> {
  const message = await messageModel.findMessageById(tripId, messageId);
  if (!message) throw ApiError.notFound("Mensagem não encontrada");

  if (message.author_id !== userId && userRole !== "owner") {
    throw ApiError.forbidden("Você só pode apagar suas próprias mensagens");
  }

  await messageModel.deleteMessage(tripId, messageId);

  if (message.media_url) {
    await deleteFileByPublicUrl(message.media_url).catch(() => undefined);
  }
}

/** Só o autor pode editar o texto da própria mensagem, e só mensagens de texto. */
export async function updateMessageText(tripId: string, messageId: string, userId: string, text: string): Promise<MessageDTO> {
  const message = await messageModel.findMessageById(tripId, messageId);
  if (!message) throw ApiError.notFound("Mensagem não encontrada");

  if (message.author_id !== userId) {
    throw ApiError.forbidden("Você só pode editar suas próprias mensagens");
  }
  if (message.type !== "text") {
    throw ApiError.badRequest("Só é possível editar mensagens de texto");
  }

  const row = await messageModel.updateMessageText(tripId, messageId, text);
  const profiles = await getProfilesMap([row.author_id]);
  const profile = profiles.get(row.author_id);
  return toDTO(row, profile?.name ?? "Usuário", profile?.initials ?? "??", null);
}
