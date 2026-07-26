import { Router } from "express";
import authRoutes from "./auth.routes";
import tripRoutes from "./trip.routes";
import pushRoutes from "./push.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/auth", authRoutes);
router.use("/trips", tripRoutes);
router.use("/push", pushRoutes);

export default router;
