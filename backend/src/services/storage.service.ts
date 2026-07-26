import { randomUUID } from "crypto";
import { supabaseAdmin } from "../config/supabase";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

export interface UploadableFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

/** Faz upload de um arquivo para o bucket público e retorna a URL pública. */
export async function uploadFile(prefix: string, file: UploadableFile): Promise<string> {
  const ext = file.originalname.includes(".") ? file.originalname.split(".").pop() : undefined;
  const path = `${prefix}/${randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error } = await supabaseAdmin.storage.from(env.STORAGE_BUCKET).upload(path, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });

  if (error) {
    throw ApiError.internal("Falha ao enviar arquivo para o storage", error.message);
  }

  const { data } = supabaseAdmin.storage.from(env.STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/** Remove um arquivo do bucket a partir da URL pública retornada por uploadFile. Falha silenciosamente (best-effort). */
export async function deleteFileByPublicUrl(publicUrl: string): Promise<void> {
  const marker = `/object/public/${env.STORAGE_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return;

  const path = publicUrl.slice(index + marker.length);
  await supabaseAdmin.storage.from(env.STORAGE_BUCKET).remove([path]);
}
