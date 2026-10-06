import "server-only";
import { CONTRACTS, escrowLive, factoryLive, registryLive } from "@/config/contracts";
import { rpc, rpcBatch } from "@/lib/feeds/rpc";
import { readWord } from "@/lib/abi";
import {
  decodeFactoryLatest,
  decodeRegistryLatest,
  decodeSettlements,
  encodeFactoryLatest,
  encodeGetSettlements,
  encodeRegistryLatest,
  encodeSettlementCount,
} from "@/lib/onchain/calls";

/*
 * The public tape read from the contracts' own storage: the newest escrow
 * settlements, issuances and registry records. Each line is a commitment, a
 * status and the block it happened in. Legs are public on chain too, but the
 * tape does not repeat them: it shows what the protocol publishes on purpose.
 *
 * Only the escrow and the issuance factory are authoritative for settlement
 * and issuance status. The registry is permissionless, so its lines are shown
 * as plain records with their author, never with a settlement or issuance
 * status: the labels a recorder chooses are not repeated.
 */

export type ChainTapeEntry = {
  source: "escrow" | "issuance" | "registry";
  ref: string;
  kind: "settlement" | "issuance" | "record";
  commitment: string;
  /** Registry lines: the wallet that recorded it. */
  author?: string;
  status: string;
  block: number;
  at: number | null;
};

const PER_SOURCE = 30;
const CACHE_MS = 5_000;
let cache: { at: number; entries: ChainTapeEntry[] } | null = null;
const blockTimes = new Map<number, number>();

const call = (to: string, data: string) => rpc<string>("eth_call", [{ to, data }, "latest"]);

async function stamp(entries: ChainTapeEntry[]) {
  const missing = [...new Set(entries.map((e) => e.block).filter((b) => b > 0 && !blockTimes.has(b)))].slice(0, 60);
  if (missing.length) {
    const blocks = await rpcBatch<{ timestamp: string } | null>(missing.map((b) => ({ method: "eth_getBlockByNumber", params: [`0x${b.toString(16)}`, false] }))).catch(() => []);
    blocks.forEach((blk, i) => blk && blockTimes.set(missing[i], Number(BigInt(blk.timestamp)) * 1000));
    if (blockTimes.size > 5000) blockTimes.clear();
  }
  for (const e of entries) e.at = blockTimes.get(e.block) ?? null;
}

export async function readChainTape(): Promise<ChainTapeEntry[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.entries;
  const out: ChainTapeEntry[] = [];
  const now = Math.floor(Date.now() / 1000);
  const jobs: Promise<void>[] = [];

  if (escrowLive()) {
    jobs.push(
      (async () => {
        const count = Number(readWord(await call(CONTRACTS.escrow.address, encodeSettlementCount()), 0));
        const ids: bigint[] = [];
        for (let id = count; id > 0 && ids.length < PER_SOURCE; id--) ids.push(BigInt(id));
        if (!ids.length) return;
        for (const s of decodeSettlements(await call(CONTRACTS.escrow.address, encodeGetSettlements(ids)), ids, now)) {
          out.push({
            source: "escrow",
            ref: s.id.toString(),
            kind: "settlement",
            commitment: s.commitment,
            status: s.status,
            block: s.closedBlock || s.openedBlock,
            at: null,
          });
        }
      })(),
    );
  }
  if (factoryLive()) {
    jobs.push(
      (async () => {
        for (const i of decodeFactoryLatest(await call(CONTRACTS.factory.address, encodeFactoryLatest(PER_SOURCE)))) {
          out.push({ source: "issuance", ref: i.token, kind: "issuance", commitment: i.commitment, status: "issued", block: i.block, at: null });
        }
      })(),
    );
  }
  if (registryLive()) {
    jobs.push(
      (async () => {
        for (const r of decodeRegistryLatest(await call(CONTRACTS.registry.address, encodeRegistryLatest(PER_SOURCE)))) {
          out.push({ source: "registry", ref: String(r.seq), kind: "record", commitment: r.commitment, status: "recorded", author: r.author, block: r.block, at: null });
        }
      })(),
    );
  }
  const settled = await Promise.allSettled(jobs);
  if (settled.every((r) => r.status === "rejected") && jobs.length) throw new Error("The contracts could not be read.");
  const seen = new Set<string>();
  const unique = out.filter((e) => {
    const key = `${e.source}:${e.ref}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => b.block - a.block);
  const entries = unique.slice(0, 40);
  await stamp(entries);
  cache = { at: Date.now(), entries };
  return entries;
}
