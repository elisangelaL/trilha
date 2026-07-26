import { Router } from "express";
import { z } from "zod";
import { requireTripRole } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { uploadLarge } from "../middlewares/upload.middleware";
import { addItem, createEntry, getEntry, listEntries, reactToEntry, updateItem } from "../controllers/entry.controller";

const router = Router({ mergeParams: true });

const itemTypeSchema = z.enum(["photo", "text", "link", "video"]);

const createEntrySchema = z.object({
  type: itemTypeSchema,
  category: z.enum(["visitar", "comer", "hospedagem", "transporte"]).default("visitar"),
  title: z.string().trim().optional(),
  body: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  url: z.string().trim().optional(),
  platform: z.string().trim().optional(),
});

const addItemSchema = createEntrySchema.omit({ category: true });

const updateItemSchema = z.object({
  title: z.string().trim().optional(),
  body: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  url: z.string().trim().optional(),
  platform: z.string().trim().optional(),
});

const reactionSchema = z.object({
  type: z.enum(["like", "dislike"]),
});

router.get("/", requireTripRole("viewer"), listEntries);
router.post("/", requireTripRole("editor"), uploadLarge.single("media"), validateBody(createEntrySchema), createEntry);
router.get("/:entryId", requireTripRole("viewer"), getEntry);
router.post("/:entryId/items", requireTripRole("editor"), uploadLarge.single("media"), validateBody(addItemSchema), addItem);
router.patch("/:entryId/items/:itemId", requireTripRole("editor"), validateBody(updateItemSchema), updateItem);
router.post("/:entryId/reactions", requireTripRole("viewer"), validateBody(reactionSchema), reactToEntry);

export default router;
