import { USDG, WETH } from "@/config/brand";
import { STOCKS } from "@/config/stocks";

/*
 * Assets a settlement can name: native ETH, USDG and WETH, and the tokenized
 * stocks listed in stocks.ts, all real Robinhood Chain assets. Decimals were
 * read on chain on 7 Oct 2026. Practice mode never moves any of them; with the
 * escrow deployed, the same legs are sent through it (token "0x0…0" = ETH).
 */

export type AssetId = "ETH" | "USDG" | "WETH" | (typeof STOCKS)[number]["symbol"];

export const NATIVE = "0x0000000000000000000000000000000000000000";

export type Asset = { id: AssetId; label: string; kind: "cash" | "crypto" | "equity"; token: string; decimals: number };

export const ASSETS: Asset[] = [
  { id: "USDG", label: "USDG · Global Dollar", kind: "cash", token: USDG.address, decimals: USDG.decimals },
  { id: "ETH", label: "ETH · Ether", kind: "crypto", token: NATIVE, decimals: 18 },
  { id: "WETH", label: "WETH · Wrapped Ether", kind: "crypto", token: WETH, decimals: 18 },
  ...STOCKS.map((s) => ({ id: s.symbol as AssetId, label: `${s.symbol} · ${s.name} stock token`, kind: "equity" as const, token: s.token, decimals: 18 })),
];

export const assetById = (id: string) => ASSETS.find((a) => a.id === id) ?? null;
export const assetByToken = (token: string) => ASSETS.find((a) => a.token.toLowerCase() === token.toLowerCase()) ?? null;

/** A normalised decimal amount ("12.5") in base units for an asset; null if it has more decimals than the token. */
export function toUnits(amount: string, decimals: number): bigint | null {
  const [w, f = ""] = amount.split(".");
  if (f.length > decimals) return null;
  return BigInt(w) * 10n ** BigInt(decimals) + BigInt(f.padEnd(decimals, "0") || "0");
}

/** Base units back to a normalised decimal string. */
export function fromUnits(units: bigint, decimals: number): string {
  const d = 10n ** BigInt(decimals);
  const frac = (units % d).toString().padStart(decimals, "0").replace(/0+$/, "");
  return frac ? `${units / d}.${frac}` : `${units / d}`;
}

export const isAsset = (v: unknown): v is AssetId => typeof v === "string" && ASSETS.some((a) => a.id === v);

export const ASSET_CLASSES = [
  { id: "treasury", label: "Treasury bill" },
  { id: "equity", label: "Listed equity" },
  { id: "etf", label: "Exchange-traded fund" },
  { id: "money-market", label: "Money market fund share" },
  { id: "receivable", label: "Trade receivable" },
] as const;

export type AssetClass = (typeof ASSET_CLASSES)[number]["id"];

export const isAssetClass = (v: unknown): v is AssetClass => typeof v === "string" && ASSET_CLASSES.some((c) => c.id === v);

export const classLabel = (id: AssetClass) => ASSET_CLASSES.find((c) => c.id === id)?.label ?? id;

/** A positive decimal with at most 6 places and 12 whole digits, normalised; null when invalid. */
export function parseAmount(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim().replace(/,/g, "");
  if (!/^\d{1,12}(\.\d{1,6})?$/.test(t)) return null;
  const [w, f = ""] = t.split(".");
  const whole = w.replace(/^0+(?=\d)/, "");
  const frac = f.replace(/0+$/, "");
  const out = frac ? `${whole}.${frac}` : whole;
  return /^0(\.0*)?$/.test(out) ? null : out;
}
