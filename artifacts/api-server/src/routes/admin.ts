import { Router, type IRouter } from "express";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db, accountsTable, accountHistoryTable, scenariosTable } from "@workspace/db";
import { DEFAULT_MODULE_ACCESS_BY_TIER } from "@workspace/db";
import {
  LoginAdminBody,
  LoginAdminResponse,
  GetAdminSessionResponse,
  ListAdminAccountsQueryParams,
  ListAdminAccountsResponse,
  GetAdminAccountParams,
  GetAdminAccountResponse,
  UpdateAdminAccountParams,
  UpdateAdminAccountBody,
  UpdateAdminAccountResponse,
  CreateAdminAccountBody,
  CreateAdminAccountResponse,
} from "@workspace/api-zod";
import {
  issueAdminSession,
  clearAdminSession,
  isAdminAuthenticated,
  requireAdminAuth,
} from "../lib/adminAuth";
import { getScenarioCount } from "../lib/accountAccess";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    req.log.error("ADMIN_PASSWORD is not configured");
    res.status(401).json(LoginAdminResponse.parse({ authenticated: false }));
    return;
  }

  if (parsed.data.password !== adminPassword) {
    res.status(401).json(LoginAdminResponse.parse({ authenticated: false }));
    return;
  }

  issueAdminSession(res);
  res.json(LoginAdminResponse.parse({ authenticated: true }));
});

router.post("/admin/logout", requireAdminAuth, async (_req, res): Promise<void> => {
  clearAdminSession(res);
  res.sendStatus(204);
});

router.get("/admin/session", async (req, res): Promise<void> => {
  res.json(
    GetAdminSessionResponse.parse({ authenticated: isAdminAuthenticated(req) }),
  );
});

router.post("/admin/accounts", requireAdminAuth, async (req, res): Promise<void> => {
  const parsed = CreateAdminAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, businessName, tier, scenarioLimit, exportEnabled, benchmarkAccess, moduleAccess, packageStartedAt, packageExpiresAt } = parsed.data;

  const [existing] = await db
    .select()
    .from(accountsTable)
    .where(ilike(accountsTable.email, email));

  if (existing) {
    res.status(409).json({ error: "Akun dengan email ini sudah ada" });
    return;
  }

  const resolvedTier = (tier ?? "free") as keyof typeof DEFAULT_MODULE_ACCESS_BY_TIER;
  const resolvedModuleAccess = moduleAccess ?? DEFAULT_MODULE_ACCESS_BY_TIER[resolvedTier];

  const placeholderClerkId = `admin_provisioned_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const [created] = await db
    .insert(accountsTable)
    .values({
      clerkUserId: placeholderClerkId,
      email: email.toLowerCase().trim(),
      businessName: businessName ?? null,
      tier: resolvedTier,
      scenarioLimit: scenarioLimit !== undefined ? scenarioLimit : 2,
      exportEnabled: exportEnabled ?? false,
      benchmarkAccess: benchmarkAccess ?? false,
      moduleAccess: resolvedModuleAccess,
      packageStartedAt: packageStartedAt ? new Date(packageStartedAt) : null,
      packageExpiresAt: packageExpiresAt ? new Date(packageExpiresAt) : null,
    })
    .returning();

  if (!created) {
    res.status(500).json({ error: "Gagal membuat akun" });
    return;
  }

  res.status(201).json(
    CreateAdminAccountResponse.parse({
      ...created,
      scenarioCount: 0,
      history: [],
    }),
  );
});

router.get("/admin/accounts", requireAdminAuth, async (req, res): Promise<void> => {
  const query = ListAdminAccountsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = query.data.search
    ? await db
        .select()
        .from(accountsTable)
        .where(ilike(accountsTable.email, `%${query.data.search}%`))
        .orderBy(desc(accountsTable.createdAt))
    : await db.select().from(accountsTable).orderBy(desc(accountsTable.createdAt));

  const withCounts = await Promise.all(
    rows.map(async (account) => ({
      ...account,
      scenarioCount: await getScenarioCount(account.id),
    })),
  );

  res.json(ListAdminAccountsResponse.parse(withCounts));
});

router.get("/admin/accounts/:id", requireAdminAuth, async (req, res): Promise<void> => {
  const params = GetAdminAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [account] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.id, params.data.id));

  if (!account) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const scenarioCount = await getScenarioCount(account.id);
  const history = await db
    .select()
    .from(accountHistoryTable)
    .where(eq(accountHistoryTable.accountId, account.id))
    .orderBy(desc(accountHistoryTable.createdAt));

  res.json(GetAdminAccountResponse.parse({ ...account, scenarioCount, history }));
});

router.patch("/admin/accounts/:id", requireAdminAuth, async (req, res): Promise<void> => {
  const params = UpdateAdminAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAdminAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Account not found" });
    return;
  }

  const { note, ...updateFields } = parsed.data;

  // If tier changed and no explicit moduleAccess provided, apply tier defaults
  if (updateFields.tier && updateFields.tier !== existing.tier && !updateFields.moduleAccess) {
    const newTier = updateFields.tier as keyof typeof DEFAULT_MODULE_ACCESS_BY_TIER;
    updateFields.moduleAccess = DEFAULT_MODULE_ACCESS_BY_TIER[newTier];
  }

  const [updated] = await db
    .update(accountsTable)
    .set(updateFields)
    .where(eq(accountsTable.id, existing.id))
    .returning();

  const tierChanged = updateFields.tier && updateFields.tier !== existing.tier;
  const expiryChanged =
    "packageExpiresAt" in updateFields &&
    updateFields.packageExpiresAt?.getTime() !==
      existing.packageExpiresAt?.getTime();

  if (tierChanged || expiryChanged || note) {
    await db.insert(accountHistoryTable).values({
      accountId: existing.id,
      previousTier: existing.tier,
      newTier: updated!.tier,
      previousExpiresAt: existing.packageExpiresAt,
      newExpiresAt: updated!.packageExpiresAt,
      note: note ?? null,
    });
  }

  const scenarioCount = await getScenarioCount(existing.id);
  const history = await db
    .select()
    .from(accountHistoryTable)
    .where(eq(accountHistoryTable.accountId, existing.id))
    .orderBy(desc(accountHistoryTable.createdAt));

  res.json(
    UpdateAdminAccountResponse.parse({ ...updated, scenarioCount, history }),
  );
});

export default router;
