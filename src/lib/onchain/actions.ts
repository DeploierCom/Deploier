"use client";

import { CONTRACTS, REGISTRY_KIND, REGISTRY_STATUS } from "@/config/contracts";
import { NATIVE, assetById, toUnits } from "@/lib/practice/assets";
import {
  TOPIC,
  encodeAccept,
  encodeApprove,
  encodeCancel,
  encodeIssue,
  encodePropose,
  encodeRecordWith,
  encodeRefund,
  encodeSetAllowed,
  type ChainSettlement,
} from "@/lib/onchain/calls";
import { allowanceOf, issuedToken, proposedId, simulate, waitReceipt } from "@/lib/onchain/client";

/*
 * The transactions behind the desk's on-chain mode. Each one is dry-run first
 * (so a paused token or an expired proposal is explained before the wallet
 * opens), then sent through the connected wallet, then awaited. ERC-20 legs
 * are approved for the exact amount, never more.
 */

export type Send = (tx: { to?: string; data: string; value?: bigint }) => Promise<string>;
export type Wallet = { address: string; send: Send };
export type Step = (label: string) => void;
export type TxResult = { hash: string; block: number };

type Leg = { asset: string; amount: string };

export function legUnits(leg: Leg) {
  const a = assetById(leg.asset);
  if (!a) throw new Error(`Unknown asset ${leg.asset}.`);
  const amount = toUnits(leg.amount, a.decimals);
  if (amount === null) throw new Error(`${leg.asset} takes at most ${a.decimals} decimals.`);
  return { token: a.token, amount };
}

async function sendTx(w: Wallet, tx: { to: string; data: string; value?: bigint }, step: Step, label: string) {
  step(`Checking: ${label}…`);
  await simulate({ from: w.address, ...tx });
  step(`Confirm in your wallet: ${label}`);
  const hash = await w.send(tx);
  step(`Waiting for the block: ${label}…`);
  const receipt = await waitReceipt(hash);
  return { hash, block: Number(BigInt(receipt.blockNumber)), receipt };
}

/** Approves the escrow for exactly `amount` of an ERC-20 when the current allowance is short. */
async function ensureAllowance(w: Wallet, token: string, amount: bigint, step: Step, symbol: string) {
  if (token === NATIVE) return;
  const current = await allowanceOf(token, w.address, CONTRACTS.escrow.address).catch(() => 0n);
  if (current >= amount) return;
  await sendTx(w, { to: token, data: encodeApprove(CONTRACTS.escrow.address, amount) }, step, `allow the escrow to take ${symbol}`);
}

export type ProposeTerms = { taker: string; give: Leg; get: Leg; commitment: string; expiry: number };

export async function proposeOnChain(w: Wallet, t: ProposeTerms, step: Step): Promise<TxResult & { id: bigint | null }> {
  const a = legUnits(t.give);
  const b = legUnits(t.get);
  await ensureAllowance(w, a.token, a.amount, step, t.give.asset);
  const tx = { to: CONTRACTS.escrow.address, data: encodePropose(t.taker, a, b, t.commitment, t.expiry), value: a.token === NATIVE ? a.amount : undefined };
  const r = await sendTx(w, tx, step, `lock ${t.give.amount} ${t.give.asset} in the escrow`);
  return { hash: r.hash, block: r.block, id: proposedId(r.receipt, TOPIC.proposed) };
}

export async function acceptOnChain(w: Wallet, s: ChainSettlement, symbolB: string, step: Step): Promise<TxResult> {
  await ensureAllowance(w, s.tokenB, s.amountB, step, symbolB);
  const tx = { to: CONTRACTS.escrow.address, data: encodeAccept(s.id), value: s.tokenB === NATIVE ? s.amountB : undefined };
  return sendTx(w, tx, step, "deliver your leg and settle");
}

export async function cancelOnChain(w: Wallet, id: bigint, step: Step): Promise<TxResult> {
  return sendTx(w, { to: CONTRACTS.escrow.address, data: encodeCancel(id) }, step, "cancel and take leg A back");
}

export async function refundOnChain(w: Wallet, id: bigint, step: Step): Promise<TxResult> {
  return sendTx(w, { to: CONTRACTS.escrow.address, data: encodeRefund(id) }, step, "return leg A to the maker");
}

export type IssueTerms = { name: string; symbol: string; units: string; holders: string[]; maturity: string | null; commitment: string };

export const maturityTs = (date: string | null) => (date ? Math.floor(Date.parse(`${date}T00:00:00Z`) / 1000) : 0);

export async function issueOnChain(w: Wallet, t: IssueTerms, step: Step): Promise<TxResult & { token: string | null }> {
  const data = encodeIssue(t.name, t.symbol, BigInt(t.units), t.holders, maturityTs(t.maturity), t.commitment);
  const r = await sendTx(w, { to: CONTRACTS.factory.address, data }, step, `issue ${t.units} ${t.symbol}`);
  return { hash: r.hash, block: r.block, token: issuedToken(r.receipt, TOPIC.issued) };
}

export async function setAllowedOnChain(w: Wallet, token: string, accounts: string[], allowed: boolean, step: Step): Promise<TxResult> {
  return sendTx(w, { to: token, data: encodeSetAllowed(accounts, allowed) }, step, allowed ? "add to the allowlist" : "remove from the allowlist");
}

export async function anchorOnChain(w: Wallet, commitment: string, kind: "settlement" | "issuance", status: string, step: Step): Promise<TxResult> {
  const code = REGISTRY_STATUS[status as keyof typeof REGISTRY_STATUS] ?? REGISTRY_STATUS.recorded;
  return sendTx(w, { to: CONTRACTS.registry.address, data: encodeRecordWith(commitment, REGISTRY_KIND[kind], code) }, step, "record the commitment on chain");
}
