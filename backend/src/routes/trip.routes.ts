import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireTripRole } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload.middleware";
import { createTrip, getTrip, listTrips } from "../controllers/trip.controller";

import entryRoutes from "./entry.routes";
import expenseRoutes from "./expense.routes";
import memberRoutes from "./member.routes";
import messageRoutes from "./message.routes";

const router = Router();

const createTripSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório"),
  location: z.string().trim().optional().default(""),
  startDate: z.string().trim().optional().nullable(),
  endDate: z.string().trim().optional().nullable(),
});

router.use(requireAuth);

router.get("/", listTrips);
router.post("/", upload.single("cover"), validateBody(createTripSchema), createTrip);
router.get("/:tripId", requireTripRole("viewer"), getTrip);

router.use("/:tripId/entries", entryRoutes);
router.use("/:tripId/expenses", expenseRoutes);
router.use("/:tripId/members", memberRoutes);
router.use("/:tripId/messages", messageRoutes);

export default router;
