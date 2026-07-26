import { Router } from "express";
import { z } from "zod";
import { requireTripRole } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { inviteMember, listMembers, removeMember } from "../controllers/member.controller";

const router = Router({ mergeParams: true });

const inviteSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  role: z.enum(["editor", "viewer"]),
});

router.get("/", requireTripRole("viewer"), listMembers);
router.post("/invite", requireTripRole("owner"), validateBody(inviteSchema), inviteMember);
router.delete("/:memberId", requireTripRole("owner"), removeMember);

export default router;
