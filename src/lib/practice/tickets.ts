import { randomBytes } from "node:crypto";
import { BRAND, CHAIN, isAddress } from "@/config/brand";
import type { Store } from "@/lib/auth/store";
import { recoverSigner } from "@/lib/auth/verify";
import { CONTRACTS, ESCROW_MAX_TERM_S, escrowLive, factoryLive } from "@/config/contracts";
import { assetById, classLabel, isAsset, isAssetClass, parseAmount, toUnits, type AssetClass, type AssetId } from "@/lib/practice/assets";

/*
 * Signed practice tickets. The server writes the exact text of an action,
 * the wallet signs it with personal_sign (free, no transaction), and only
 * then is the action applied. The action is stored next to its one-time
 * nonce, so what runs is what was shown in the wallet, never what the
 * browser sends afterwards.
 */

export type Leg = { asset: AssetId; amount: string };

export type Action =
  | { kind: "propose"; taker: string; give: Leg; get: Leg; memo: string; expiry?: number }
  | { kind: "accept"; id: string }
  | { kind: "cancel"; id: string }
  | {
      kind: "issue";
      assetClass: AssetClass;
      name: string;
      symbol: string;
      units: string;
      faceUsd: string;
      holders: string[];
      maturity: string | null;
      onchain?: boolean;
    };

const TTL = 5 * 60;
const key = (nonce: string) => `practice:ticket:${nonce}`;
export const ID = /^[0-9a-f]{16}$/;

type Raw = Record<string, unknown>;

const leg = (v: unknown): Leg | null => {
  const r = (v && typeof v === "object" ? v : {}) as Raw;
  const amount = parseAmount(r.amount);
  return isAsset(r.asset) && amount ? { asset: r.asset, amount } : null;
};

const text = (v: unknown, max: number) =>
  typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max) : "";

/** Validates the shape of an action from the browser. `from` is the wallet asking. */
export function parseAction(raw: Raw, from: string): Action | { error: string } {
  switch (raw.kind) {
    case "propose": {
      const taker = typeof raw.taker === "string" ? raw.taker.trim() : "";
      if (!isAddress(taker)) return { error: "Enter the counterparty's 0x address." };
      if (taker.toLowerCase() === from.toLowerCase()) return { error: "The counterparty must be a different wallet." };
      const give = leg(raw.give);
      const get = leg(raw.get);
      if (!give || !get) return { error: "Each leg needs an asset and an amount above zero (up to 6 decimals)." };
      if (give.asset === get.asset) return { error: "The two legs must be different assets." };
      const base = { kind: "propose" as const, taker: taker.toLowerCase(), give, get, memo: text(raw.memo, 80) };
      if (raw.onchain !== true) return base;
      // On-chain proposal: the escrow must be deployed, the expiry sane, and both amounts representable in token units.
      if (!escrowLive()) return { error: "The settlement escrow is not deployed yet." };
      const now = Math.floor(Date.now() / 1000);
      const expiry = typeof raw.expiry === "number" && Number.isInteger(raw.expiry) ? raw.expiry : 0;
      if (expiry < now + 300 || expiry > now + ESCROW_MAX_TERM_S - 300) return { error: "Pick an expiry between 5 minutes and 30 days from now." };
      for (const l of [give, get]) {
        const a = assetById(l.asset);
        if (!a || toUnits(l.amount, a.decimals) === null) return { error: `${l.asset} takes at most ${a?.decimals ?? 0} decimals.` };
      }
      return { ...base, expiry };
    }
    case "accept":
    case "cancel": {
      const id = typeof raw.id === "string" ? raw.id : "";
      return ID.test(id) ? { kind: raw.kind, id } : { error: "Unknown settlement." };
    }
    case "issue": {
      if (!isAssetClass(raw.assetClass)) return { error: "Pick an asset class." };
      const name = text(raw.name, 48);
      const symbol = text(raw.symbol, 10).toUpperCase();
      if (name.length < 3) return { error: "Give the instrument a name of at least 3 characters." };
      if (!/^[A-Z][A-Z0-9]{1,9}$/.test(symbol)) return { error: "The symbol takes 2 to 10 letters or digits, starting with a letter." };
      const units = typeof raw.units === "string" && /^\d{1,12}$/.test(raw.units.trim()) ? raw.units.trim().replace(/^0+(?=\d)/, "") : null;
      if (!units || units === "0") return { error: "Units must be a whole number above zero." };
      const faceUsd = parseAmount(raw.faceUsd);
      if (!faceUsd) return { error: "Enter a face value per unit in US dollars." };
      const list = Array.isArray(raw.holders) ? raw.holders : [];
      const holders = [...new Set(list.filter((h): h is string => typeof h === "string").map((h) => h.trim().toLowerCase()).filter(Boolean))];
      if (holders.length === 0 || holders.length > 5) return { error: "List between 1 and 5 eligible holder addresses." };
      if (!holders.every((h) => isAddress(h))) return { error: "Every eligible holder must be a 0x address." };
      const m = typeof raw.maturity === "string" && raw.maturity ? raw.maturity : null;
      if (m !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(m) || Number.isNaN(Date.parse(`${m}T00:00:00Z`)))) return { error: "Maturity must be a date." };
      if (m !== null && Date.parse(`${m}T00:00:00Z`) < Date.now() - 86_400_000) return { error: "Maturity cannot be in the past." };
      if (raw.onchain === true) {
        if (!factoryLive()) return { error: "The issuance contract is not deployed yet." };
        if (m !== null && Date.parse(`${m}T00:00:00Z`) <= Date.now() + 3_600_000) return { error: "An on-chain maturity must be a future date." };
        return { kind: "issue", assetClass: raw.assetClass, name, symbol, units, faceUsd, holders, maturity: m, onchain: true };
      }
      return { kind: "issue", assetClass: raw.assetClass, name, symbol, units, faceUsd, holders, maturity: m };
    }
    default:
      return { error: "Unknown action." };
  }
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

/** One line a person can read in their wallet before signing. */
export function describeAction(a: Action): string {
  switch (a.kind) {
    case "propose":
      return `Propose a private settlement with ${short(a.taker)}: I deliver ${a.give.amount} ${a.give.asset} and receive ${a.get.amount} ${a.get.asset}.${
        a.expiry ? ` Open on chain until ${new Date(a.expiry * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC.` : ""
      }`;
    case "accept":
      return `Accept private settlement ${a.id} and mark it settled.`;
    case "cancel":
      return `Withdraw my proposal for private settlement ${a.id}.`;
    case "issue":
      return `${a.onchain ? "Issue on chain" : "Record a practice issuance"}: ${a.units} units of ${a.symbol} (${a.name}, ${classLabel(a.assetClass)}) at $${a.faceUsd} face value, held only by ${a.holders.length} allowlisted address${a.holders.length === 1 ? "" : "es"}.`;
  }
}

function onchainNote(a: Action) {
  if (a.kind === "propose" && a.expiry)
    return `On chain: after this free signature your wallet sends the proposal to the escrow ${CONTRACTS.escrow.address} and leg A is locked there. The terms stay private; the legs themselves are public on ${CHAIN.name}.`;
  if (a.kind === "issue" && a.onchain)
    return `On chain: after this free signature your wallet sends the issuance to the factory ${CONTRACTS.factory.address}. Name, symbol, units, maturity and allowlist are public; the rest of the terms stay private.`;
  return "Practice mode: no funds move and no transaction is sent.";
}

const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

export async function issueTicket(store: Store, address: string, action: Action, host: string) {
  const nonce = hex(randomBytes(16));
  const message = [
    `${host} asks you to sign a ${BRAND.name} practice action:`,
    "",
    describeAction(action),
    "",
    onchainNote(action),
    "",
    `Wallet: ${address}`,
    `Chain ID: ${CHAIN.id}`,
    `Nonce: ${nonce}`,
    `Issued At: ${new Date().toISOString()}`,
    `Expires At: ${new Date(Date.now() + TTL * 1000).toISOString()}`,
  ].join("\n");
  await store.setEx(key(nonce), JSON.stringify({ address: address.toLowerCase(), message, action }), TTL);
  return { nonce, message };
}

/**
 * Burns the nonce first, atomically (GETDEL), then checks the signature. Two
 * parallel or repeated submissions of the same ticket can never both get the
 * stored action: the second finds nothing and is refused as used.
 */
export async function redeemTicket(store: Store, nonce: string, signature: string) {
  if (!/^[0-9a-f]{32}$/.test(nonce)) return { error: "This request expired or was already used.", status: 409 } as const;
  const raw = await store.take(key(nonce));
  if (!raw) return { error: "This request expired or was already used.", status: 409 } as const;
  let ticket: { address: string; message: string; action: Action };
  try {
    ticket = JSON.parse(raw) as { address: string; message: string; action: Action };
  } catch {
    return { error: "This request could not be read. Try again.", status: 400 } as const;
  }
  if (recoverSigner(ticket.message, signature) !== ticket.address) {
    return { error: "That signature does not match the connected wallet.", status: 401 } as const;
  }
  return { address: ticket.address, action: ticket.action } as const;
}
