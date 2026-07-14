import { Router, type IRouter } from "express";
import {
  CalculateReverseTargetBody,
  CalculateReverseTargetResponse,
  CalculateBreakEvenBody,
  CalculateBreakEvenResponse,
} from "@workspace/api-zod";
import { calculateReverseTarget, calculateBreakEven } from "../lib/calculationEngine";

const router: IRouter = Router();

router.post("/calculate/reverse-target", async (req, res): Promise<void> => {
  const parsed = CalculateReverseTargetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = calculateReverseTarget(parsed.data);
  res.json(CalculateReverseTargetResponse.parse(result));
});

router.post("/calculate/break-even", async (req, res): Promise<void> => {
  const parsed = CalculateBreakEvenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = calculateBreakEven(parsed.data);
  res.json(CalculateBreakEvenResponse.parse(result));
});

export default router;
