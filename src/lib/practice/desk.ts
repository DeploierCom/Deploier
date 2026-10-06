import { createHash, randomBytes } from "node:crypto";
import type { Store } from "@/lib/auth/store";
import { rpc } from "@/lib/feeds/rpc";
import { commitment } from "@/lib/practice/commit";
import type { Action, Leg } from "@/lib/practice/tickets";
import type { AssetClass } from "@/lib/practice/assets";

/*
 * The practice desk: private settlements between two wallets and practice
 * issuances of tokenized instruments. Nothing here touches a contract.
 *
 * Every record has two faces:
 *   - the public tape: id, kind, commitment hash, status, time and the Robinhood
 *     Chain block read at that moment. No parties, assets or amounts.
 *   - the private record: full terms plus the salt behind the commitment. It is
 *     only returned to someone holding the record's view key, which is handed to
 *     the creator once and never stored in clear (only its SHA-256).
 */

export const PROPOSAL_TTL_MS = 24 * 60 * 60 * 1000;
const TAPE = "practice:tape";
const TAPE_KEEP = 60;
/** Practice records expire so the store cannot grow without bound. */
export const RECORD_TTL_SEC = 30 * 24 * 60 * 60;

export type Status = "proposed" | "settled" | "cancelled" | "expired" | "recorded";

export type Settlement = {
  kind: "settlement";
  id: string;
  maker: string;
  taker: string;
  give: Leg;
  get: Leg;
  memo: string;
  salt: string;
  commitment: string;
  status: Status;
  createdAt: number;
  createdBlock: number | null;
  closedAt: number | null;
  closedBlock: number | null;
  keyHash: string;
};

export type Issuance = {
  kind: "issuance";
  id: string;
  issuer: string;
  assetClass: AssetClass;
  name: string;
  symbol: string;
  units: string;
  faceUsd: string;
  holders: string[];
  maturity: string | null;
  salt: string;
  commitment: string;
  status: Status;
  createdAt: number;
  createdBlock: number | null;
  keyHash: string;
};

export type TapeEntry = { id: string; kind: "settlement" | "issuance"; commitment: string; status: Status; at: number; block: number | null };

const recordKey = (id: string) => `practice:record:${id}`;
const sha = (v: string) => createHash("sha256").update(v).digest("hex");
const hex = (n: number) => randomBytes(n).toString("hex");

/** Terms covered by a settlement's commitment. */
export const settlementTerms = (s: Pick<Settlement, "maker" | "taker" | "give" | "get" | "memo">) => ({
  maker: s.maker,
  taker: s.taker,
  give: s.give,
  get: s.get,
  memo: s.memo,
});

/** Terms covered by an issuance's commitment. */
export const issuanceTerms = (i: Pick<Issuance, "issuer" | "assetClass" | "name" | "symbol" | "units" | "faceUsd" | "holders" | "maturity">) => ({
  issuer: i.issuer,
  assetClass: i.assetClass,
  name: i.name,
  symbol: i.symbol,
  units: i.units,
  faceUsd: i.faceUsd,
  holders: i.holders,
  maturity: i.maturity,
});

async function block(): Promise<number | null> {
  try {
    return Number(BigInt(await rpc<string>("eth_blockNumber", [])));
  } catch {
    return null;
  }
}

function effective<T extends Settlement | Issuance>(r: T): T {
  if (r.kind === "settlement" && r.status === "proposed" && Date.now() - r.createdAt > PROPOSAL_TTL_MS) return { ...r, status: "expired" };
  return r;
}

export async function readRecord(store: Store, id: string): Promise<Settlement | Issuance | null> {
  const raw = await store.get(recordKey(id));
  if (!raw) return null;
  try {
    return effective(JSON.parse(raw) as Settlement | Issuance);
  } catch {
    return null;
  }
}

/** The private record, only for a caller who holds its view key. */
export async function openRecord(store: Store, id: string, viewKey: string) {
  if (!/^[0-9a-f]{64}$/.test(viewKey)) return null;
  const r = await readRecord(store, id);
  if (!r || r.keyHash !== sha(viewKey)) return null;
  // The key hash stays on the server.
  const { keyHash: _drop, ...rest } = r;
  void _drop;
  return rest;
}

async function updateTape(store: Store, r: Settlement | Issuance) {
  const entry: TapeEntry = {
    id: r.id,
    kind: r.kind,
    commitment: r.commitment,
    status: r.status,
    at: r.kind === "settlement" && r.closedAt ? r.closedAt : r.createdAt,
    block: r.kind === "settlement" && r.closedBlock ? r.closedBlock : r.createdBlock,
  };
  await store.pushCapped(TAPE, JSON.stringify(entry), TAPE_KEEP);
}

/** Public tape, newest first, one line per record (its latest state). */
export async function readTape(store: Store, count = 30): Promise<TapeEntry[]> {
  const raw = await store.range(TAPE, TAPE_KEEP);
  const seen = new Set<string>();
  const out: TapeEntry[] = [];
  for (const line of raw) {
    try {
      const e = JSON.parse(line) as TapeEntry;
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      if (e.kind === "settlement" && e.status === "proposed" && Date.now() - e.at > PROPOSAL_TTL_MS) e.status = "expired";
      out.push(e);
      if (out.length >= count) break;
    } catch {
      // skip a damaged line
    }
  }
  return out;
}

type Result =
  | { ok: true; id: string; viewKey?: string; status: Status; commitment: string }
  | { ok: false; error: string; status: number };

/** Applies a verified action. Changes to one record are serialised with a short lock. */
export async function apply(store: Store, address: string, action: Action): Promise<Result> {
  const who = address.toLowerCase();
  if (action.kind === "propose" || action.kind === "issue") {
    const id = hex(8);
    const salt = hex(16);
    const viewKey = hex(32);
    const at = Date.now();
    const createdBlock = await block();
    let record: Settlement | Issuance;
    if (action.kind === "propose") {
      const terms = settlementTerms({ maker: who, taker: action.taker, give: action.give, get: action.get, memo: action.memo });
      record = {
        kind: "settlement",
        id,
        ...terms,
        salt,
        commitment: commitment(terms, salt),
        status: "proposed",
        createdAt: at,
        createdBlock,
        closedAt: null,
        closedBlock: null,
        keyHash: sha(viewKey),
      };
    } else {
      const terms = issuanceTerms({ issuer: who, ...action });
      record = { kind: "issuance", id, ...terms, salt, commitment: commitment(terms, salt), status: "recorded", createdAt: at, createdBlock, keyHash: sha(viewKey) };
    }
    await store.setEx(recordKey(id), JSON.stringify(record), RECORD_TTL_SEC);
    await updateTape(store, record);
    return { ok: true, id, viewKey, status: record.status, commitment: record.commitment };
  }

  const lock = `practice:lock:${action.id}`;
  const token = hex(8);
  if (!(await store.setNx(lock, token, 10))) return { ok: false, error: "This settlement is being updated. Try again.", status: 409 };
  try {
    const r = await readRecord(store, action.id);
    if (!r || r.kind !== "settlement") return { ok: false, error: "Unknown settlement.", status: 404 };
    if (r.status !== "proposed") return { ok: false, error: `This settlement is already ${r.status}.`, status: 409 };
    if (action.kind === "accept" && who !== r.taker) return { ok: false, error: "Only the named counterparty can accept.", status: 403 };
    if (action.kind === "cancel" && who !== r.maker) return { ok: false, error: "Only the wallet that proposed it can withdraw it.", status: 403 };
    const next: Settlement = { ...r, status: action.kind === "accept" ? "settled" : "cancelled", closedAt: Date.now(), closedBlock: await block() };
    await store.setEx(recordKey(r.id), JSON.stringify(next), RECORD_TTL_SEC);
    await updateTape(store, next);
    return { ok: true, id: r.id, status: next.status, commitment: r.commitment };
  } finally {
    await store.delIf(lock, token).catch(() => false);
  }
}
