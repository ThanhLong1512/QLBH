import { PermissionKey, UserRole } from "@/types/erp";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  roleTitle?: string;
  branchId?: string;
  warehouseId?: string;
  employeeId?: string;
  permissions: PermissionKey[];
  iat?: number;
  exp?: number;
}

const DEFAULT_SECRET = "nexus-erp-super-secure-enterprise-jwt-key-2026";

function getSecretKey(): string {
  return process.env.JWT_SECRET || DEFAULT_SECRET;
}

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64Url encode
function base64UrlEncode(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Base64Url decode
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
}

/**
 * Signs a JWT token using Web Crypto HMAC-SHA256 (compatible with Next.js Edge & Node runtime).
 */
export async function signJWT(
  payload: Omit<JWTPayload, "iat" | "exp">,
  expiresInSeconds: number = 7 * 24 * 60 * 60 // 7 days
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(stringToUint8Array(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(stringToUint8Array(JSON.stringify(fullPayload)));

  const secret = getSecretKey();
  const key = await crypto.subtle.importKey(
    "raw",
    stringToUint8Array(secret) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const dataToSign = stringToUint8Array(`${encodedHeader}.${encodedPayload}`);
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, dataToSign as unknown as BufferSource);
  const encodedSignature = base64UrlEncode(signatureBuffer);

  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a JWT token using Web Crypto HMAC-SHA256.
 * Returns payload if valid, null if expired or signature mismatch.
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, encodedSignature] = parts;

    const secret = getSecretKey();
    const key = await crypto.subtle.importKey(
      "raw",
      stringToUint8Array(secret) as unknown as BufferSource,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Decode signature
    const signatureStr = base64UrlDecode(encodedSignature);
    const signatureBytes = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
      signatureBytes[i] = signatureStr.charCodeAt(i);
    }

    const dataToVerify = stringToUint8Array(`${encodedHeader}.${encodedPayload}`);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      dataToVerify as unknown as BufferSource
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: JWTPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
