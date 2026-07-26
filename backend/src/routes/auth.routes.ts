import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { completeLogin, getMe } from "../controllers/auth.controller";

const router = Router();

router.use(requireAuth);
router.post("/complete-login", completeLogin);
router.get("/me", getMe);

export default router;
