import { Router } from "express";
import { z } from "zod";
import { requireTripRole } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload.middleware";
import { createMessage, deleteMessage, listMessages, updateMessage } from "../controllers/message.controller";

const router = Router({ mergeParams: true });

const createMessageSchema = z.object({
  type: z.enum(["text", "image", "audio", "entry"]),
  text: z.string().trim().optional(),
  durationSeconds: z.coerce.number().optional(),
  sharedEntryId: z.string().uuid().optional(),
});

const updateMessageSchema = z.object({
  text: z.string().trim().min(1, "Mensagem não pode ficar vazia"),
});

router.get("/", requireTripRole("viewer"), listMessages);
router.post("/", requireTripRole("viewer"), upload.single("media"), validateBody(createMessageSchema), createMessage);
router.patch("/:messageId", requireTripRole("viewer"), validateBody(updateMessageSchema), updateMessage);
router.delete("/:messageId", requireTripRole("viewer"), deleteMessage);

export default router;
