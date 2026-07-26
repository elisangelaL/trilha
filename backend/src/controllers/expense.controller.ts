import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import * as expenseService from "../services/expense.service";

export const listExpenses = asyncHandler(async (req: Request, res: Response) => {
  const summary = await expenseService.listExpenses(req.params.tripId);
  res.json(summary);
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { description, amount, category, paidBy } = req.body;
  const file = req.file;

  const expense = await expenseService.createExpense({
    tripId: req.params.tripId,
    paidBy: paidBy || req.user.id,
    description,
    amount: Number(amount),
    category,
    receipt: file ? { buffer: file.buffer, mimetype: file.mimetype, originalname: file.originalname } : undefined,
  });

  res.status(201).json({ expense });
});
