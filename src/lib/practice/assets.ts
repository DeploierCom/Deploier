import { STOCKS } from "@/config/stocks";

/*
 * Assets a practice settlement can name. USDG and WETH are the real Robinhood
 * Chain contracts; the equities are the tokenized stocks listed in stocks.ts.
 * Practice mode never moves any of them: a settlement only records terms.
 */

export type AssetId = "USDG" | "WETH" | (typeof STOCKS)[number]["symbol"];

export const ASSETS: { id: AssetId; label: string; kind: "cash" | "crypto" | "equity" }[] = [
  { id: "USDG", label: "USDG · Global Dollar", kind: "cash" },
  { id: "WETH", label: "WETH · Wrapped Ether", kind: "crypto" },
  ...STOCKS.map((s) => ({ id: s.symbol as AssetId, label: `${s.symbol} · ${s.name} stock token`, kind: "equity" as const })),
];

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
