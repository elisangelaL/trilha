import multer from "multer";

/** Armazena o arquivo em memória (Buffer) — o storage.service faz o upload para o Supabase Storage. */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB — fotos, recibos, áudio do chat
});

/** Limite maior para campos que podem receber vídeo (teto padrão do Supabase Storage). */
export const uploadLarge = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB — fotos e vídeos de descobertas
});
