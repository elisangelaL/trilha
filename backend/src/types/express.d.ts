import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
      /** Papel do usuário autenticado na viagem da rota (:tripId), populado por authorize.middleware. */
      tripRole?: "owner" | "editor" | "viewer";
    }
  }
}

export {};
