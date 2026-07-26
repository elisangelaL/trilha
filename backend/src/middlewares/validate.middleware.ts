import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ApiError } from "../utils/ApiError";

/** Valida req.body contra um schema zod, substituindo o body pelo valor parseado (com defaults/coerções). */
export const validateBody = (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    throw ApiError.badRequest("Dados inválidos", result.error.flatten().fieldErrors);
  }
  req.body = result.data;
  next();
};
