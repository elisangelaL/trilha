import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middlewares/auth.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { subscribe, unsubscribe } from "../controllers/push.controller";

const router = Router();
router.use(requireAuth);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

const unsubscribeSchema = z.object({ endpoint: z.string().url() });

router.post("/subscribe", validateBody(subscribeSchema), subscribe);
router.post("/unsubscribe", validateBody(unsubscribeSchema), unsubscribe);

export default router;
