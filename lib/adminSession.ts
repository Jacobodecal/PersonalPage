// Signed admin session cookie: "<expiresAt>.<hmac>", keyed by ADMIN_PASSWORD
// (rotating the password invalidates every existing session)
import type { NextRequest } from 'next/server';

export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Constant-time comparison so response timing doesn't leak how much matched
export function safeEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  let diff = aBytes.length ^ bBytes.length;
  for (let i = 0; i < aBytes.length; i++) {
    diff |= aBytes[i] ^ (bBytes[i % bBytes.length] ?? 0);
  }
  return diff === 0;
}

export async function createAdminSession(secret: string): Promise<string> {
  const expiresAt = Date.now() + ADMIN_SESSION_MAX_AGE * 1000;
  return `${expiresAt}.${await sign(`admin:${expiresAt}`, secret)}`;
}

export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (!secret || !token) return false;

  const [expiresAt, signature] = token.split('.');
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;

  return safeEqual(signature, await sign(`admin:${expiresAt}`, secret));
}
