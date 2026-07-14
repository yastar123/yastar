import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

/**
 * Rejects unauthenticated requests. Relies on the `clerkMiddleware()` mounted
 * in app.ts having already resolved the request's auth state.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}
