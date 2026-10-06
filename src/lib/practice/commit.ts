import { keccak_256 } from "@noble/hashes/sha3.js";

/*
 * Commitments shared by the server and the browser. The public tape only ever
 * holds keccak256(canonical terms + salt). Anyone holding the terms and the
 * salt can recompute it and check that the tape entry matches; anyone without
 * them learns nothing about the deal from the hash.
 */

const enc = new TextEncoder();
const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

/** JSON with sorted keys at every depth, so the same terms always hash the same way. */
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function commitment(terms: unknown, salt: string) {
  return `0x${hex(keccak_256(enc.encode(`${canonical(terms)}|${salt}`)))}`;
}
