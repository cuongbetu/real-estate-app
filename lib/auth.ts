import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/session";

/**
 * Checks whether an incoming API request is authorised.
 * Accepts either:
 *  1. x-admin-key header matching ADMIN_SECRET_KEY  (programmatic / external access)
 *  2. A valid portal_session cookie                 (browser / portal UI)
 */
export function isAdminRequest(req: NextRequest | Request): boolean {
  // ── 1. x-admin-key header ────────────────────────────────────────────────
  const secret = process.env.ADMIN_SECRET_KEY;
  if (secret) {
    const header = req.headers.get("x-admin-key");
    if (header === secret) return true;
  }

  // ── 2. Session cookie (NextRequest only) ─────────────────────────────────
  if ("cookies" in req) {
    const sessionCookie = (req as NextRequest).cookies.get(SESSION_COOKIE);
    if (sessionCookie && verifySessionToken(sessionCookie.value)) return true;
  }

  return false;
}

/**
 * Verifies the session cookie from a Server Component / Route Handler
 * that uses `next/headers` cookies (not available in Edge middleware).
 */
export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

/**
 * Legacy helper used by portal pages that previously checked ?key=.
 * Kept for any remaining call-sites; prefer isAdminSession() for new code.
 */
export function isAdminKey(key: string | null | undefined): boolean {
  if (!key) return false;
  const secret = process.env.ADMIN_SECRET_KEY;
  return Boolean(secret && key === secret);
}
