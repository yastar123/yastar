import crypto from "node:crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "yastar_owner_session";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getSigningSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET must be set");
  return secret;
}

function sign(payload: string): string {
  const hmac = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${hmac}`;
}

function verify(token: string): string | null {
  const separatorIndex = token.lastIndexOf(".");
  if (separatorIndex === -1) return null;
  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);
  const expectedSignature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(payload)
    .digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  const parts = payload.split(":");
  const expiresAt = Number(parts[2]);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  return payload;
}

export function issueOwnerSession(res: Response, accountId: number): void {
  const expiresAt = Date.now() + MAX_AGE_MS;
  const token = sign(`owner:${accountId}:${expiresAt}`);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_MS,
    path: "/",
  });
}

export function clearOwnerSession(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function getOwnerAccountId(req: Request): number | null {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token !== "string") return null;
  const payload = verify(token);
  if (!payload) return null;
  const accountId = Number(payload.split(":")[1]);
  return Number.isFinite(accountId) && accountId > 0 ? accountId : null;
}
