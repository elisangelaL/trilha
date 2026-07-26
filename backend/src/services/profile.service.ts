import { findProfilesByIds } from "../models/profile.model";

/** Busca perfis em lote e devolve um Map id -> profile, para montar nome/iniciais dos autores. */
export async function getProfilesMap(ids: string[]) {
  const uniqueIds = [...new Set(ids)];
  const profiles = await findProfilesByIds(uniqueIds);
  return new Map(profiles.map((p) => [p.id, p]));
}
