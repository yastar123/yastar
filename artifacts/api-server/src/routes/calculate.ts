import { Router, type IRouter } from "express";
import {
  CalculateReverseTargetBody,
  CalculateReverseTargetResponse,
  CalculateBreakEvenBody,
  CalculateBreakEvenResponse,
  CalculateHppBody,
  CalculateHppResponse,
  CalculateBepUsahaBody,
  CalculateBepUsahaResponse,
  CalculateHargaJualBody,
  CalculateHargaJualResponse,
  CalculatePajakBody,
  CalculatePajakResponse,
  CalculateEkspansiBody,
  CalculateEkspansiResponse,
  CalculatePinjamanBody,
  CalculatePinjamanResponse,
} from "@workspace/api-zod";
import { calculateReverseTarget, calculateBreakEven } from "../lib/calculationEngine";
import {
  calculateHpp,
  calculateBepUsaha,
  calculateHargaJual,
  calculatePajak,
  calculateEkspansi,
  calculatePinjaman,
} from "../lib/calculationModules";

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

router.post("/calculate/hpp", async (req, res): Promise<void> => {
  const parsed = CalculateHppBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculateHpp(parsed.data as Parameters<typeof calculateHpp>[0]);
  res.json(CalculateHppResponse.parse(result));
});

router.post("/calculate/bep-usaha", async (req, res): Promise<void> => {
  const parsed = CalculateBepUsahaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculateBepUsaha(parsed.data);
  res.json(CalculateBepUsahaResponse.parse(result));
});

router.post("/calculate/harga-jual", async (req, res): Promise<void> => {
  const parsed = CalculateHargaJualBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculateHargaJual(parsed.data as Parameters<typeof calculateHargaJual>[0]);
  res.json(CalculateHargaJualResponse.parse(result));
});

router.post("/calculate/pajak", async (req, res): Promise<void> => {
  const parsed = CalculatePajakBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculatePajak(parsed.data as Parameters<typeof calculatePajak>[0]);
  res.json(CalculatePajakResponse.parse(result));
});

router.post("/calculate/ekspansi", async (req, res): Promise<void> => {
  const parsed = CalculateEkspansiBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculateEkspansi(parsed.data);
  res.json(CalculateEkspansiResponse.parse(result));
});

router.post("/calculate/pinjaman", async (req, res): Promise<void> => {
  const parsed = CalculatePinjamanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const result = calculatePinjaman(parsed.data as Parameters<typeof calculatePinjaman>[0]);
  res.json(CalculatePinjamanResponse.parse(result));
});

export default router;
