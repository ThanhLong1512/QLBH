import crypto from "crypto";

/**
 * Hashes a plain password using crypto.scryptSync with a 16-byte random salt.
 * Result format: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plain password against a stored hash (or plain demo fallback).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Support plain text match for initial demo seeds
  if (storedHash === password) return true;

  if (!storedHash.includes(":")) {
    return false;
  }

  try {
    const [salt, key] = storedHash.split(":");
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKeyBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKeyBuffer);
  } catch {
    return false;
  }
}
