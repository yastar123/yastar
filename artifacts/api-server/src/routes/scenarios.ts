import { Router, type IRouter } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db, scenariosTable } from "@workspace/db";
import {
  CreateScenarioBody,
  CreateScenarioResponse,
  ListScenariosResponse,
  GetScenarioParams,
  GetScenarioResponse,
  UpdateScenarioParams,
  UpdateScenarioBody,
  UpdateScenarioResponse,
  DeleteScenarioParams,
  CreateModuleScenarioBody,
  CreateModuleScenarioResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { getAccountById, getScenarioCount } from "../lib/accountAccess";
import { calculateReverseTarget } from "../lib/calculationEngine";

const router: IRouter = Router();

router.use("/scenarios", requireAuth);

router.get("/scenarios", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const rows = await db
    .select()
    .from(scenariosTable)
    .where(eq(scenariosTable.accountId, account.id))
    .orderBy(desc(scenariosTable.updatedAt));

  res.json(ListScenariosResponse.parse(rows));
});

// Save a target_mundur scenario (existing flow, unchanged)
router.post("/scenarios", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const parsed = CreateScenarioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (account.scenarioLimit !== null) {
    const scenarioCount = await getScenarioCount(account.id);
    if (scenarioCount >= account.scenarioLimit) {
      res.status(403).json({
        error: `Batas ${account.scenarioLimit} skenario untuk paket Anda telah tercapai. Upgrade paket untuk menyimpan lebih banyak skenario.`,
      });
      return;
    }
  }

  const input = parsed.data;
  const resultSnapshot = calculateReverseTarget(input);

  const [created] = await db
    .insert(scenariosTable)
    .values({
      accountId: account.id,
      name: input.name,
      moduleType: "target_mundur",
      businessType: input.businessType,
      employeeCount: input.employeeCount,
      workingDaysPerMonth: input.workingDaysPerMonth,
      workingHoursPerDay: input.workingHoursPerDay,
      fixedCosts: input.fixedCosts,
      targetProfit: input.targetProfit,
      commissionModel: input.commissionModel,
      commissionConfig: input.commissionConfig,
      services: input.services,
      resultSnapshot,
    })
    .returning();

  res.status(201).json(CreateScenarioResponse.parse(created));
});

// Save a scenario for any new module type (hpp, bep_usaha, etc.)
router.post("/scenarios/module", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const parsed = CreateModuleScenarioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (account.scenarioLimit !== null) {
    const scenarioCount = await getScenarioCount(account.id);
    if (scenarioCount >= account.scenarioLimit) {
      res.status(403).json({
        error: `Batas ${account.scenarioLimit} skenario untuk paket Anda telah tercapai. Upgrade paket untuk menyimpan lebih banyak skenario.`,
      });
      return;
    }
  }

  const { name, moduleType, moduleInput, resultSnapshot } = parsed.data;

  const [created] = await db
    .insert(scenariosTable)
    .values({
      accountId: account.id,
      name,
      moduleType,
      moduleInput,
      resultSnapshot,
      // placeholder values for target_mundur-specific columns (required by NOT NULL)
      businessType: "custom",
      employeeCount: 1,
      workingDaysPerMonth: 26,
      workingHoursPerDay: 8,
      fixedCosts: 0,
      targetProfit: 0,
      commissionModel: "flat",
      commissionConfig: {},
      services: [],
    })
    .returning();

  res.status(201).json(CreateModuleScenarioResponse.parse(created));
});

router.get("/scenarios/:id", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const params = GetScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [scenario] = await db
    .select()
    .from(scenariosTable)
    .where(
      and(
        eq(scenariosTable.id, params.data.id),
        eq(scenariosTable.accountId, account.id),
      ),
    );

  if (!scenario) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  res.json(GetScenarioResponse.parse(scenario));
});

router.patch("/scenarios/:id", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const params = UpdateScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateScenarioBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(scenariosTable)
    .where(
      and(
        eq(scenariosTable.id, params.data.id),
        eq(scenariosTable.accountId, account.id),
      ),
    );

  if (!existing) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  // For non-target_mundur scenarios, only allow rename
  if (existing.moduleType !== "target_mundur") {
    if (parsed.data.name) {
      const [updated] = await db
        .update(scenariosTable)
        .set({ name: parsed.data.name })
        .where(eq(scenariosTable.id, existing.id))
        .returning();
      res.json(UpdateScenarioResponse.parse(updated));
    } else {
      res.json(UpdateScenarioResponse.parse(existing));
    }
    return;
  }

  const merged = {
    businessType: parsed.data.businessType ?? existing.businessType,
    employeeCount: parsed.data.employeeCount ?? existing.employeeCount,
    workingDaysPerMonth:
      parsed.data.workingDaysPerMonth ?? existing.workingDaysPerMonth,
    workingHoursPerDay:
      parsed.data.workingHoursPerDay ?? existing.workingHoursPerDay,
    fixedCosts: parsed.data.fixedCosts ?? existing.fixedCosts,
    targetProfit: parsed.data.targetProfit ?? existing.targetProfit,
    commissionModel: parsed.data.commissionModel ?? existing.commissionModel,
    commissionConfig:
      parsed.data.commissionConfig ?? (existing.commissionConfig as object),
    services: parsed.data.services ?? (existing.services as object[]),
  };

  const resultSnapshot = calculateReverseTarget(merged as never);

  const [updated] = await db
    .update(scenariosTable)
    .set({
      name: parsed.data.name ?? existing.name,
      ...merged,
      resultSnapshot,
    })
    .where(eq(scenariosTable.id, existing.id))
    .returning();

  res.json(UpdateScenarioResponse.parse(updated));
});

router.delete("/scenarios/:id", async (req, res): Promise<void> => {
  const account = await getAccountById(req.accountId!);

  const params = DeleteScenarioParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(scenariosTable)
    .where(
      and(
        eq(scenariosTable.id, params.data.id),
        eq(scenariosTable.accountId, account.id),
      ),
    )
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Scenario not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
