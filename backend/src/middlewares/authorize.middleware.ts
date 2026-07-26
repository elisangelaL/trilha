import type { NextFunction, Request, Response } from "express";
import { getTripRole, type TripRole } from "../models/tripMember.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const ROLE_RANK: Record<TripRole, number> = { viewer: 0, editor: 1, owner: 2 };

/**
 * Garante que o usuário autenticado seja membro da viagem em `req.params.tripId`
 * com papel >= minRole, e popula req.tripRole. Regras de negócio (quem pode
 * editar/gerenciar membros) ficam centralizadas aqui, não nos controllers.
 */
export const requireTripRole = (minRole: TripRole) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const tripId = req.params.tripId;
    if (!req.user) throw ApiError.unauthorized();

    const role = await getTripRole(tripId, req.user.id);
    if (!role) throw ApiError.forbidden("Você não é membro desta viagem");
    if (ROLE_RANK[role] < ROLE_RANK[minRole]) {
      throw ApiError.forbidden("Seu papel nesta viagem não permite esta ação");
    }

    req.tripRole = role;
    next();
  });
