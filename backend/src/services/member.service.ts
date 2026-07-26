import * as memberModel from "../models/tripMember.model";
import * as inviteModel from "../models/tripInvite.model";
import { findProfileByEmail } from "../models/profile.model";
import { getProfilesMap } from "./profile.service";
import { ApiError } from "../utils/ApiError";

export interface MemberDTO {
  id: string;
  userId: string;
  name: string;
  initials: string;
  role: memberModel.TripRole;
}

export async function listMembers(tripId: string): Promise<MemberDTO[]> {
  const members = await memberModel.listMembers(tripId);
  const profiles = await getProfilesMap(members.map((m) => m.user_id));

  return members.map((m) => {
    const profile = profiles.get(m.user_id);
    return {
      id: m.id,
      userId: m.user_id,
      name: profile?.name ?? "Usuário",
      initials: profile?.initials ?? "??",
      role: m.role,
    };
  });
}

export interface InviteInput {
  tripId: string;
  email: string;
  role: "editor" | "viewer";
  invitedBy: string;
}

export type InviteResult =
  | { status: "member_added"; member: MemberDTO }
  | { status: "invite_pending" };

export async function invite(input: InviteInput): Promise<InviteResult> {
  const existingProfile = await findProfileByEmail(input.email);

  if (existingProfile) {
    const row = await memberModel.addMember(input.tripId, existingProfile.id, input.role);
    return {
      status: "member_added",
      member: {
        id: row.id,
        userId: existingProfile.id,
        name: existingProfile.name,
        initials: existingProfile.initials,
        role: row.role,
      },
    };
  }

  await inviteModel.createInvite(input.tripId, input.email, input.role, input.invitedBy);
  return { status: "invite_pending" };
}

export async function removeMember(tripId: string, memberId: string): Promise<void> {
  const members = await memberModel.listMembers(tripId);
  const target = members.find((m) => m.id === memberId);
  if (!target) throw ApiError.notFound("Membro não encontrado");
  if (target.role === "owner") throw ApiError.badRequest("Não é possível remover o dono da viagem");

  await memberModel.removeMember(tripId, memberId);
}
