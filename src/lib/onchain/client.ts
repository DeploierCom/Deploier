"use client";

import { CHAIN } from "@/config/brand";
import { CONTRACTS } from "@/config/contracts";
import { readAddress, readWord } from "@/lib/abi";
import { rpc } from "@/lib/rpc";
import {
  REVERT_REASONS,
  decodeSettlements,
  encodeAllowance,
  encodeBalanceOf,
  encodeGetSettlements,
  encodeIdOf,
  encodeIsAllowed,
  encodeName,
  encodeSymbol,
  encodeTokenCommitment,
  encodeTokenIssuer,
  encodeTokenMaturity,
  encodeTokenOf,
  encodeTotalSupply,
  decodeString,
  type ChainSettlement,
} from "@/lib/onchain/calls";

/*
 * Browser side of the contracts: reads through the site relay (with the public
 * RPC as fallback), and a dry run of every transaction before the wallet is
 * asked to sign, so a blocked token or an expired proposal is explained here
 * instead of failing on chain.
 */

async function rawCall(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  if (!res.ok) throw new Error(`RPC ${res.status}`);
  return (await res.json()) as { result?: string; error?: { message?: string; data?: unknown } };
}

function revertData(error: { message?: string; data?: unknown } | undefined) {
  const d = error?.data;
  if (typeof d === "string" && d.startsWith("0x")) return d;
  if (d && typeof d === "object" && typeof (d as { data?: unknown }).data === "string") return (d as { data: string }).data;
  return null;
}

/** Turns revert data (or a wallet error) into a sentence. */
export function explain(data: string | null, fallback: string) {
  if (data && data.length >= 10) {
    const known = REVERT_REASONS[data.slice(0, 10).toLowerCase()];
    if (known) return known;
    // Error(string) from a token, e.g. a stock token's own pause or block message.
    if (data.startsWith("0x08c379a0")) {
      try {
        const len = Number(BigInt(`0x${data.slice(74, 138)}`));
        const text = new TextDecoder().decode(Uint8Array.from(data.slice(138, 138 + len * 2).match(/../g) ?? [], (h) => parseInt(h, 16)));
        return `A token refused the transfer: "${text}". Nothing moved.`;
      } catch {
        // fall through
      }
    }
  }
  return fallback;
}

/**
 * eth_call as `from` with `value`; throws a readable reason when it would revert.
 * When no endpoint can be reached it returns quietly and the wallet's own estimate decides.
 */
export async function simulate(tx: { from: string; to?: string; data: string; value?: bigint }) {
  const params = [{ from: tx.from, ...(tx.to ? { to: tx.to } : {}), data: tx.data, ...(tx.value ? { value: `0x${tx.value.toString(16)}` } : {}) }, "latest"];
  for (const url of [CHAIN.rpc, CHAIN.fallbackRpc]) {
    let body: Awaited<ReturnType<typeof rawCall>>;
    try {
      body = await rawCall(url, { jsonrpc: "2.0", id: 1, method: "eth_call", params });
    } catch {
      continue;
    }
    if (!body.error) return body.result ?? "0x";
    if (/insufficient funds/i.test(body.error.message ?? "")) throw new Error("Not enough ETH for this amount plus gas.");
    throw new Error(explain(revertData(body.error), body.error.message ?? "The transaction would fail."));
  }
  return null;
}

export type Receipt = {
  status: string;
  contractAddress: string | null;
  blockNumber: string;
  transactionHash: string;
  logs: { address: string; topics: string[]; data: string }[];
};

export async function waitReceipt(hash: string, timeoutMs = 180_000): Promise<Receipt> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const receipt = await rpc<Receipt | null>("eth_getTransactionReceipt", [hash]).catch(() => null);
    if (receipt) {
      if (receipt.status !== "0x1") throw new Error("The transaction reverted on chain. Nothing moved.");
      return receipt;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  throw new Error("Still waiting for the block. Check the explorer for the result.");
}

export const txUrl = (hash: string) => `${CHAIN.explorer}/tx/${hash}`;

const call = (to: string, data: string) => rpc<string>("eth_call", [{ to, data }, "latest"]);

async function chainNow() {
  try {
    const block = await rpc<{ timestamp: string }>("eth_getBlockByNumber", ["latest", false]);
    return Number(BigInt(block.timestamp));
  } catch {
    return Math.floor(Date.now() / 1000);
  }
}

/**
 * The escrow settlement this maker opened with this commitment, or null. Keyed by maker on chain, so a
 * copy of the public commitment by anyone else is never returned here.
 */
export async function settlementByCommitment(maker: string, commitment: string): Promise<ChainSettlement | null> {
  const id = readWord(await call(CONTRACTS.escrow.address, encodeIdOf(maker, commitment)), 0);
  if (id === 0n) return null;
  const [s] = decodeSettlements(await call(CONTRACTS.escrow.address, encodeGetSettlements([id])), [id], await chainNow());
  return s ?? null;
}

/** The token this issuer created with this commitment, or null (keyed by issuer on chain). */
export async function tokenByCommitment(issuer: string, commitment: string): Promise<string | null> {
  const token = readAddress(await call(CONTRACTS.factory.address, encodeTokenOf(issuer, commitment)), 0);
  return /^0x0{40}$/.test(token) ? null : token;
}

export type TokenFacts = { issuer: string; name: string; symbol: string; supply: bigint; maturity: number; commitment: string; allowed: boolean[] };

/** Everything an issuance's private terms define, read from the token itself. */
export async function tokenFacts(token: string, holders: string[]): Promise<TokenFacts> {
  const [issuer, name, symbol, supply, maturity, commitment, ...allowed] = await Promise.all([
    call(token, encodeTokenIssuer()),
    call(token, encodeName()),
    call(token, encodeSymbol()),
    call(token, encodeTotalSupply()),
    call(token, encodeTokenMaturity()),
    call(token, encodeTokenCommitment()),
    ...holders.map((h) => call(token, encodeIsAllowed(h))),
  ]);
  return {
    issuer: readAddress(issuer, 0),
    name: decodeString(name),
    symbol: decodeString(symbol),
    supply: readWord(supply, 0),
    maturity: Number(readWord(maturity, 0)),
    commitment: `0x${readWord(commitment, 0).toString(16).padStart(64, "0")}`,
    allowed: allowed.map((a) => readWord(a, 0) === 1n),
  };
}

export async function allowanceOf(token: string, owner: string, spender: string) {
  return readWord(await call(token, encodeAllowance(owner, spender)), 0);
}

export async function balanceOf(token: string, owner: string) {
  return readWord(await call(token, encodeBalanceOf(owner)), 0);
}

export async function isAllowedOn(token: string, account: string) {
  return readWord(await call(token, encodeIsAllowed(account)), 0) === 1n;
}

/** Id of the settlement created by a propose receipt (first topic after the event signature). */
export function proposedId(receipt: Receipt, topic: string): bigint | null {
  const log = receipt.logs.find((l) => l.address.toLowerCase() === CONTRACTS.escrow.address.toLowerCase() && l.topics[0] === topic);
  return log ? BigInt(log.topics[1]) : null;
}

/** Token created by an issue receipt. */
export function issuedToken(receipt: Receipt, topic: string): string | null {
  const log = receipt.logs.find((l) => l.address.toLowerCase() === CONTRACTS.factory.address.toLowerCase() && l.topics[0] === topic);
  return log ? `0x${log.topics[1].slice(-40)}` : null;
}
