import { findProfileById, updateAvatarUrl, acceptPendingInvites } from "../models/profile.model";
import { uploadFile, deleteFileByPublicUrl, type UploadableFile } from "./storage.service";
import { ApiError } from "../utils/ApiError";

export interface MeDTO {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
}

/**
 * Chamado pelo frontend logo após o login: converte convites pendentes
 * (trip_invites com este e-mail) em memberships reais e devolve o profile.
 */
export async function completeLogin(userId: string, email: string): Promise<MeDTO> {
  await acceptPendingInvites(userId, email);

  const profile = await findProfileById(userId);
  if (!profile) throw ApiError.notFound("Perfil não encontrado");

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    initials: profile.initials,
    avatarUrl: profile.avatar_url,
  };
}

export async function getMe(userId: string): Promise<MeDTO> {
  const profile = await findProfileById(userId);
  if (!profile) throw ApiError.notFound("Perfil não encontrado");

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    initials: profile.initials,
    avatarUrl: profile.avatar_url,
  };
}

/** Troca a foto de perfil: sobe a nova, apaga a antiga do storage (se houver) e persiste a URL. */
export async function updateAvatar(userId: string, file: UploadableFile): Promise<MeDTO> {
  const profile = await findProfileById(userId);
  if (!profile) throw ApiError.notFound("Perfil não encontrado");

  const avatarUrl = await uploadFile(`avatars/${userId}`, file);
  if (profile.avatar_url) await deleteFileByPublicUrl(profile.avatar_url).catch(() => undefined);

  const updated = await updateAvatarUrl(userId, avatarUrl);
  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    initials: updated.initials,
    avatarUrl: updated.avatar_url,
  };
}
