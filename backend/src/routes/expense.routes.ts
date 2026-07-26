import { Router } from "express";
import { z } from "zod";
import { requireTripRole } from "../middlewares/authorize.middleware";
import { validateBody } from "../middlewares/validate.middleware";
import { upload } from "../middlewares/upload.middleware";
import { createExpense, listExpenses } from "../controllers/expense.controller";

const router = Router({ mergeParams: true });

const createExpenseSchema = z.object({
  description: z.string().trim().min(1, "Descrição é obrigatória"),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  category: z.string().trim().default("Outros"),
  paidBy: z.string().uuid().optional(),
});

router.get("/", requireTripRole("viewer"), listExpenses);
router.post(
  "/",
  requireTripRole("editor"),
  upload.single("receipt"),
  validateBody(createExpenseSchema),
  createExpense,
);

export default router;
