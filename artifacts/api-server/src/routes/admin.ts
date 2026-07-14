import { Router, type IRouter } from "express";
import { and, desc, eq, ilike } from "drizzle-orm";
import { db, accountsTable, accountHistoryTable, scenariosTable } from "@workspace/db";
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
