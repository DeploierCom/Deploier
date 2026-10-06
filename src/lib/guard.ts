import { NextResponse } from "next/server";
import type { Store } from "@/lib/auth/store";
import { clientIp, trustsProxyHeaders } from "@/lib/netkey";
import { spend } from "@/lib/ratelimit";

export { clientIp };

/*
 * Request guards shared by every write endpoint: a hard cap on body size,
 * the caller's IP, and fixed-window rate limits keyed on the verified
 * session address and the IP (never on anything the caller names itself).
 */

export const MAX_BODY = 4096;

/** Parses a small JSON body; null when it is missing, malformed or too large. */
export async function readJson<T>(request: Request, max = MAX_BODY): Promise<T | null> {
  const r = await readBody<T>(request, max);
  return r.ok ? r.value : null;
}

/** Like readJson, but tells "too large" (answer 413) apart from "malformed" (answer 400). */
export async function readBody<T>(request: Request, max = MAX_BODY): Promise<{ ok: true; value: T } | { ok: false; tooLarge: boolean }> {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > max) return { ok: false, tooLarge: true };
  try {
    const text = await request.text();
    if (text.length > max) return { ok: false, tooLarge: true };
    if (!text) return { ok: false, tooLarge: false };
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, tooLarge: false };
  }
}

export const tooLarge = () => NextResponse.json({ error: "Request body too large." }, { status: 413 });

/**
 * True when the caller is still within `max` requests per `windowSec` for
 * every given key. Each key counts separately.
 */
export async function allow(store: Store, bucket: string, keys: string[], max: number, windowSec: number) {
  // spend() falls back to an in-process counter when the store fails: never open.
  const results = await Promise.all(keys.map((k) => spend(store, bucket, k, 1, max, windowSec)));
  return results.every(Boolean);
}

/** True when forwarded headers are believed (see netkey.ts). */
const trustedIp = trustsProxyHeaders();

/**
 * Limit for endpoints open to signed-out callers. With a trusted IP the
 * per-IP limit is enough. Without one (self-hosted, no proxy) a forged header
 * would give every request a fresh IP, so a site-wide ceiling applies too.
 * That ceiling is shared by everyone, so it is not used where the IP can be
 * trusted: one caller must not be able to lock everyone else out.
 */
export async function allowPublic(store: Store, request: Request, bucket: string, perIp: number, site: number) {
  if (!(await allow(store, bucket, [clientIp(request)], perIp, 60))) return false;
  return trustedIp || allow(store, `${bucket}:site`, ["all"], site, 60);
}

export const tooMany = () => NextResponse.json({ error: "Too many requests. Slow down a little." }, { status: 429 });
export const badBody = () => NextResponse.json({ error: "Invalid or oversized request body." }, { status: 400 });
