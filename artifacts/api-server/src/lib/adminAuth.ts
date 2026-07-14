import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const COOKIE_NAME = "yastar_admin_session";
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET must be set to sign admin sessions");
  }
  return secret;
}

function sign(payload: string): string {
  const hmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${hmac}`;
}

function verify(token: string): boolean {
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return false;

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length) return false;
  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return false;

  const expiresAt = Number(payload.split(":")[1]);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export function issueAdminSession(res: Response): void {
  const expiresAt = Date.now() + MAX_AGE_MS;
  const token = sign(`admin:${expiresAt}`);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearAdminSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function isAdminAuthenticated(req: Request): boolean {
  const token = req.cookies?.[COOKIE_NAME];
  return typeof token === "string" && verify(token);
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminAuthenticated(req)) {
    res.status(401).json({ error: "Not authenticated as admin" });
    return;
  }
  next();
}
