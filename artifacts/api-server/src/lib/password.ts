import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

const SALT_BYTES = 16;
const KEY_BYTES = 64;

export async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(SALT_BYTES).toString("hex");
  const key = (await scrypt(plain, salt, KEY_BYTES)) as Buffer;
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const [salt, storedKey] = stored.split(":");
  if (!salt || !storedKey) return false;
  const key = (await scrypt(plain, salt, KEY_BYTES)) as Buffer;
  const storedBuf = Buffer.from(storedKey, "hex");
  if (key.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(key, storedBuf);
}
