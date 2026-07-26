import type { NextFunction, Request, Response } from "express";
import { supabaseAuth } from "../config/supabase";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

/** Valida o Bearer token (access_token do Supabase Auth) e popula req.user. */
export const requireAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    throw ApiError.unauthorized("Token de autenticação ausente");
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);

  if (error || !data.user) {
    throw ApiError.unauthorized("Token inválido ou expirado");
  }

  req.user = { id: data.user.id, email: data.user.email ?? "" };
  next();
});
