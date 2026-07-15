import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, accountsTable } from "@workspace/db";
import {
  issueOwnerSession,
  clearOwnerSession,
  getOwnerAccountId,
} from "../lib/ownerAuth";

const router: IRouter = Router();

/**
 * POST /api/owner/login
 * Body: { email: string }
 * Looks up the account by email and issues a signed session cookie.
 */
router.post("/owner/login", async (req, res): Promise<void> => {
  const { email } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email diperlukan" });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const [account] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.email, normalizedEmail));

  if (!account) {
    res.status(401).json({ error: "Akun dengan email ini tidak ditemukan. Hubungi admin untuk mendaftar." });
    return;
  }

  issueOwnerSession(res, account.id);
  res.json({
    authenticated: true,
    accountId: account.id,
    email: account.email,
    businessName: account.businessName,
  });
});

/**
 * POST /api/owner/logout
 */
router.post("/owner/logout", (_req, res): void => {
  clearOwnerSession(res);
  res.sendStatus(204);
});

/**
 * GET /api/owner/session
 * Returns current session state.
 */
router.get("/owner/session", (req, res): void => {
  const accountId = getOwnerAccountId(req);
  res.json({ authenticated: !!accountId, accountId: accountId ?? null });
});

export default router;
