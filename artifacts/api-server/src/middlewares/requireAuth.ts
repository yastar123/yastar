import type { NextFunction, Request, Response } from "express";
import { getOwnerAccountId } from "../lib/ownerAuth";

// Augment Express Request to carry the resolved accountId.
declare global {
  namespace Express {
    interface Request {
      accountId?: number;
    }
  }
}

/**
 * Rejects unauthenticated requests. Reads the signed owner session cookie
 * and attaches req.accountId for downstream handlers.
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const accountId = getOwnerAccountId(req);
  if (!accountId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  req.accountId = accountId;
  next();
}
