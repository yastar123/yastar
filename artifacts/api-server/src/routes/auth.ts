import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, accountsTable } from "@workspace/db";
import {
  issueOwnerSession,
  clearOwnerSession,
  getOwnerAccountId,
} from "../lib/ownerAuth";
import { verifyPassword } from "../lib/password";

const router: IRouter = Router();

/**
 * POST /api/owner/login
 * Body: { email: string, password: string }
 */
router.post("/owner/login", async (req, res): Promise<void> => {
  const { email, password } = req.body ?? {};
  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email diperlukan" });
    return;
  }
  if (!password || typeof password !== "string") {
    res.status(400).json({ error: "Password diperlukan" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [account] = await db
    .select()
    .from(accountsTable)
    .where(eq(accountsTable.email, normalizedEmail));

  // Use the same generic error for missing account and wrong password
  // to avoid leaking which emails are registered.
  const genericError = "Email atau password salah.";

  if (!account) {
    res.status(401).json({ error: genericError });
    return;
  }

  if (!account.passwordHash) {
    res.status(401).json({ error: "Akun ini belum diatur passwordnya. Hubungi admin." });
    return;
  }

  const valid = await verifyPassword(password, account.passwordHash);
  if (!valid) {
    res.status(401).json({ error: genericError });
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
 */
router.get("/owner/session", (req, res): void => {
  const accountId = getOwnerAccountId(req);
  res.json({ authenticated: !!accountId, accountId: accountId ?? null });
});

export default router;
