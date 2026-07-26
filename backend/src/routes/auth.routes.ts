import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { completeLogin, getMe, updateAvatar } from "../controllers/auth.controller";

const router = Router();

router.use(requireAuth);
router.post("/complete-login", completeLogin);
router.get("/me", getMe);
router.patch("/me/avatar", upload.single("avatar"), updateAvatar);

export default router;
