import { Router } from "express";
import authRoutes from "./auth.routes";
import tripRoutes from "./trip.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);

export default router;
