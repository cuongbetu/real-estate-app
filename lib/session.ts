/**
 * Server-only session utilities.
 * Uses HMAC-SHA256 to sign/verify session tokens.
 * Never import this file from client components.
 */
import { createHmac, timingSafeEqual } from "crypto";

function getSecret(): string {
  return process.env.ADMIN_SECRET_KEY ?? "dev-fallback-secret-change-in-prod";
}

/**
 * Creates a signed session token.
 * Format: base64url(payload) + "." + hex(HMAC-SHA256(payload, secret))
 */
export function signSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: username, iat: Date.now() }),
  ).toString("base64url");
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/**
 * Verifies a session token. Returns true if valid.
 */
export function verifySessionToken(token: string): boolean {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return false;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");
    if (sig.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** Cookie name used for portal sessions. */
export const SESSION_COOKIE = "portal_session";
/** Session lifetime: 8 hours */
export const SESSION_MAX_AGE = 60 * 60 * 8;

/**
 * Verifies credentials against environment variables.
 * Both sides are compared with timingSafeEqual to resist timing attacks.
 */
export function verifyCredentials(username: string, password: string): boolean {
  const validUser = process.env.ADMIN_USERNAME ?? "";
  const validPass = process.env.ADMIN_PASSWORD ?? "";
  if (!validUser || !validPass) return false;

  try {
    const uOk =
      username.length === validUser.length &&
      timingSafeEqual(Buffer.from(username), Buffer.from(validUser));
    const pOk =
      password.length === validPass.length &&
      timingSafeEqual(Buffer.from(password), Buffer.from(validPass));
    return uOk && pOk;
  } catch {
    return false;
  }
}
