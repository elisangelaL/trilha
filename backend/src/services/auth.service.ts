import { findProfileById, acceptPendingInvites } from "../models/profile.model";
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
