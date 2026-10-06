"use client";

import { useCallback, useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { CHAIN, explorerAddress, shortAddress } from "@/config/brand";
import { CONTRACTS, registryLive } from "@/config/contracts";
import { useWallet } from "@/components/wallet/WalletProvider";
import { assetById, assetByToken, fromUnits, NATIVE } from "@/lib/practice/assets";
import type { ChainSettlement } from "@/lib/onchain/calls";
import { isAllowedOn, settlementByCommitment, tokenByCommitment, tokenFacts, txUrl, type TokenFacts } from "@/lib/onchain/client";
import {
  acceptOnChain,
  anchorOnChain,
  cancelOnChain,
  issueOnChain,
  legUnits,
  maturityTs,
  proposeOnChain,
  refundOnChain,
  setAllowedOnChain,
  type Wallet,
} from "@/lib/onchain/actions";

/*
 * On-chain parts of a private record card. The private terms come from the
 * view key (server); everything shown as status, legs or token comes from the
 * contract itself, and every button sends a real transaction.
 */

type Leg = { asset: string; amount: string };
export type ChainRec = {
  kind: "settlement" | "issuance";
  status: string;
  commitment: string;
  maker?: string;
  taker?: string;
  give?: Leg;
  get?: Leg;
  expiry?: number;
  name?: string;
  symbol?: string;
  units?: string;
  holders?: string[];
  maturity?: string | null;
  issuer?: string;
};

/** Fired after the desk's own transactions land, so record cards re-read the contracts at once. */
export const CHAIN_EVENT = "deploier:chain";

const STATUS_TONE: Record<string, string> = { settled: "text-up", issued: "text-up", proposed: "text-stamp", cancelled: "text-ink-3", refunded: "text-ink-3", expired: "text-seal" };

function useTx() {
  const { address, sendTransaction, onRobinhoodChain, switchNetwork } = useWallet();
  const [step, setStep] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<{ hash: string; label: string } | null>(null);
  const run = useCallback(
    async (label: string, fn: (w: Wallet, step: (s: string) => void) => Promise<{ hash: string }>) => {
      if (!address) return false;
      setError(null);
      try {
        if (!onRobinhoodChain) await switchNetwork();
        const r = await fn({ address, send: sendTransaction }, setStep);
        setLast({ hash: r.hash, label });
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "The transaction did not go through.");
        return false;
      } finally {
        setStep(null);
      }
    },
    [address, sendTransaction, onRobinhoodChain, switchNetwork],
  );
  return { run, step, error, last, busy: step !== null };
}

function TxLine({ step, error, last }: { step: string | null; error: string | null; last: { hash: string; label: string } | null }) {
  if (step) return <p className="text-[13.5px] text-ink-2" role="status">{step}</p>;
  if (error) return <p className="text-[13.5px] text-down" role="alert" data-testid="tx-error">{error}</p>;
  if (last)
    return (
      <p className="text-[13.5px] text-up" data-testid="tx-done">
        Done: {last.label}.{" "}
        <a href={txUrl(last.hash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline" data-testid="tx-link">
          View transaction <ExternalLink className="size-3" />
        </a>
      </p>
    );
  return null;
}

const fmtLeg = (token: string, amount: bigint) => {
  const a = token === NATIVE ? assetById("ETH") : assetByToken(token);
  return a ? `${fromUnits(amount, a.decimals)} ${a.id}` : `${amount.toString()} units of ${shortAddress(token, 6, 4)}`;
};

/** Does the on-chain settlement carry exactly the legs and parties of the private terms? */
function legsMatch(rec: ChainRec, s: ChainSettlement) {
  try {
    const a = legUnits(rec.give!);
    const b = legUnits(rec.get!);
    return (
      s.maker.toLowerCase() === rec.maker?.toLowerCase() &&
      s.taker.toLowerCase() === rec.taker?.toLowerCase() &&
      s.tokenA.toLowerCase() === a.token.toLowerCase() &&
      s.amountA === a.amount &&
      s.tokenB.toLowerCase() === b.token.toLowerCase() &&
      s.amountB === b.amount &&
      s.commitment.toLowerCase() === rec.commitment.toLowerCase() &&
      (!rec.expiry || s.expiry === rec.expiry)
    );
  } catch {
    return false;
  }
}

export function ChainSettlementPanel({ rec, me, commitmentOk }: { rec: ChainRec; me: string; commitmentOk: boolean }) {
  const [state, setState] = useState<ChainSettlement | null | undefined>(undefined);
  const [readError, setReadError] = useState(false);
  const [now, setNow] = useState(0);
  const tx = useTx();

  const load = useCallback(async () => {
    setNow(Date.now());
    try {
      setState(await settlementByCommitment(rec.maker ?? "", rec.commitment));
      setReadError(false);
    } catch {
      setReadError(true);
    }
  }, [rec.maker, rec.commitment]);
  useEffect(() => {
    const first = window.setTimeout(load, 0);
    const t = window.setInterval(() => document.visibilityState === "visible" && load(), 12_000);
    window.addEventListener(CHAIN_EVENT, load);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
      window.removeEventListener(CHAIN_EVENT, load);
    };
  }, [load]);

  const after = (ok: boolean) => ok && load();
  const isMaker = rec.maker?.toLowerCase() === me;
  const isTaker = rec.taker?.toLowerCase() === me;
  const expiredSigned = rec.expiry && now ? rec.expiry * 1000 < now : false;

  if (state === undefined)
    return <p className="px-5 py-3 text-[13.5px] text-ink-3">{readError ? `Could not read the escrow on ${CHAIN.name} just now.` : "Reading the escrow…"}</p>;

  if (state === null)
    return (
      <div className="space-y-2 border-t border-line px-5 py-3" data-testid="chain-panel">
        <p className="text-[14px]">
          <span className="font-semibold">Not in the escrow yet.</span> The terms are signed; leg A has not been locked.
        </p>
        {isMaker && !expiredSigned ? (
          <button
            type="button"
            disabled={tx.busy}
            className="btn btn-accent min-h-0 py-1.5 text-[13.5px]"
            data-testid="send-propose"
            onClick={async () =>
              after(
                await tx.run("proposal locked in the escrow", (w, step) =>
                  proposeOnChain(w, { taker: rec.taker!, give: rec.give!, get: rec.get!, commitment: rec.commitment, expiry: rec.expiry! }, step),
                ),
              )
            }
          >
            Send to the escrow
          </button>
        ) : null}
        {isMaker && expiredSigned ? <p className="text-[13.5px] text-ink-3">The signed expiry has passed. Sign a new proposal instead.</p> : null}
        <TxLine {...tx} />
      </div>
    );

  const match = legsMatch(rec, state);
  const open = state.status === "proposed";
  return (
    <div className="space-y-2 border-t border-line px-5 py-3" data-testid="chain-panel">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13.5px]">
        <span>
          Escrow settlement <span className="num">#{state.id.toString()}</span> on {CHAIN.name} ·{" "}
          <a href={explorerAddress(CONTRACTS.escrow.address)} target="_blank" rel="noreferrer" className="underline">
            contract
          </a>
        </span>
        <span className={`num font-semibold ${STATUS_TONE[state.status] ?? ""}`} data-testid="chain-status">
          {state.status}
        </span>
      </div>
      <p className="text-[13.5px] text-ink-2">
        Locked leg A: <span className="num">{fmtLeg(state.tokenA, state.amountA)}</span> · Leg B due: <span className="num">{fmtLeg(state.tokenB, state.amountB)}</span> ·{" "}
        {state.closedBlock ? `closed in block #${state.closedBlock.toLocaleString("en-US")}` : `opened in block #${state.openedBlock.toLocaleString("en-US")}`}
        {open ? ` · expires ${new Date(state.expiry * 1000).toISOString().slice(0, 16).replace("T", " ")} UTC` : ""}
      </p>
      <p className={`text-[13.5px] ${match && commitmentOk ? "text-up" : "text-down"}`} data-testid="chain-match">
        {match && commitmentOk
          ? "The contract holds exactly these terms: parties, assets, amounts and commitment match."
          : "The contract does not match these private terms. Do not accept it."}
      </p>
      <div className="flex flex-wrap gap-2">
        {open && isTaker ? (
          <button
            type="button"
            disabled={tx.busy || !match || !commitmentOk}
            className="btn btn-accent min-h-0 py-1.5 text-[13.5px]"
            data-testid="chain-accept"
            onClick={async () =>
              after(await tx.run("settled: both legs delivered", (w, step) => acceptOnChain(w, state, assetByToken(state.tokenB)?.id ?? "token", step)))
            }
          >
            Deliver {fmtLeg(state.tokenB, state.amountB)} and settle
          </button>
        ) : null}
        {(open || state.status === "expired") && isMaker ? (
          <button
            type="button"
            disabled={tx.busy}
            className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]"
            data-testid="chain-cancel"
            onClick={async () => after(await tx.run("cancelled, leg A returned", (w, step) => cancelOnChain(w, state.id, step)))}
          >
            Cancel and take leg A back
          </button>
        ) : null}
        {state.status === "expired" ? (
          <button
            type="button"
            disabled={tx.busy}
            className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]"
            data-testid="chain-refund"
            onClick={async () => after(await tx.run("refunded to the maker", (w, step) => refundOnChain(w, state.id, step)))}
          >
            Return leg A to the maker
          </button>
        ) : null}
      </div>
      <TxLine {...tx} />
    </div>
  );
}

/** Compares every field the private issuance terms define with the token on chain; returns the mismatches. */
function issuanceMismatches(rec: ChainRec, f: TokenFacts): string[] {
  const out: string[] = [];
  if (f.issuer.toLowerCase() !== rec.issuer?.toLowerCase()) out.push("issuer");
  if (f.name !== rec.name) out.push("name");
  if (f.symbol !== rec.symbol) out.push("symbol");
  if (f.commitment.toLowerCase() !== rec.commitment.toLowerCase()) out.push("commitment");
  if (f.maturity !== maturityTs(rec.maturity ?? null)) out.push("maturity");
  const units = BigInt(rec.units ?? "0");
  // Redemption after maturity burns units, so the supply can only go down from the issued amount.
  const matured = f.maturity !== 0 && f.maturity * 1000 <= Date.now();
  if (matured ? f.supply > units : f.supply !== units) out.push("units");
  if (f.allowed.some((a) => !a)) out.push("allowlist");
  return out;
}

export function ChainIssuancePanel({ rec, me }: { rec: ChainRec; me: string }) {
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [facts, setFacts] = useState<TokenFacts | null>(null);
  const [who, setWho] = useState("");
  const [check, setCheck] = useState<string | null>(null);
  const tx = useTx();
  const load = useCallback(async () => {
    try {
      const t = await tokenByCommitment(rec.issuer ?? "", rec.commitment);
      setFacts(t ? await tokenFacts(t, rec.holders ?? []) : null);
      setToken(t);
    } catch {
      setToken(undefined);
    }
  }, [rec.issuer, rec.commitment, rec.holders]);
  useEffect(() => {
    const first = window.setTimeout(load, 0);
    window.addEventListener(CHAIN_EVENT, load);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener(CHAIN_EVENT, load);
    };
  }, [load]);
  const isIssuer = rec.issuer?.toLowerCase() === me;
  const valid = /^0x[0-9a-fA-F]{40}$/.test(who.trim());

  if (token === undefined) return <p className="border-t border-line px-5 py-3 text-[13.5px] text-ink-3">Reading the issuance factory…</p>;
  if (token === null)
    return (
      <div className="space-y-2 border-t border-line px-5 py-3" data-testid="chain-panel">
        <p className="text-[14px]">
          <span className="font-semibold">Not issued yet.</span> The terms are signed; no token exists.
        </p>
        {isIssuer ? (
          <button
            type="button"
            disabled={tx.busy}
            className="btn btn-accent min-h-0 py-1.5 text-[13.5px]"
            data-testid="send-issue"
            onClick={async () => {
              const ok = await tx.run("token issued", (w, step) =>
                issueOnChain(w, { name: rec.name!, symbol: rec.symbol!, units: rec.units!, holders: rec.holders ?? [], maturity: rec.maturity ?? null, commitment: rec.commitment }, step),
              );
              if (ok) void load();
            }}
          >
            Issue the token
          </button>
        ) : null}
        <TxLine {...tx} />
      </div>
    );

  const bad = facts ? issuanceMismatches(rec, facts) : ["token"];
  const trusted = bad.length === 0;
  return (
    <div className="space-y-2 border-t border-line px-5 py-3" data-testid="chain-panel">
      <p className="text-[13.5px]">
        Token on {CHAIN.name}:{" "}
        <a href={explorerAddress(token)} target="_blank" rel="noreferrer" className="num underline" data-testid="chain-token">
          {shortAddress(token, 8, 6)}
        </a>
        . Whole units, held only by allowlisted wallets{rec.maturity ? `, transfers stop on ${rec.maturity}` : ""}.
      </p>
      <p className={`text-[13.5px] ${trusted ? "text-up" : "text-down"}`} data-testid="chain-match">
        {trusted
          ? "The token matches these terms: issuer, name, symbol, units, maturity, commitment and every listed holder."
          : `The token does not match these terms (${bad.join(", ")}). Do not trust it.`}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          aria-label="Wallet to check or change on the allowlist"
          className="field num max-w-[420px] text-[13.5px]"
          placeholder="0x… wallet"
          value={who}
          onChange={(e) => {
            setWho(e.target.value);
            setCheck(null);
          }}
          spellCheck={false}
        />
        <button
          type="button"
          disabled={!valid}
          className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]"
          onClick={async () => setCheck((await isAllowedOn(token, who.trim()).catch(() => null)) ? "On the allowlist." : "Not on the allowlist.")}
        >
          Check
        </button>
        {isIssuer ? (
          <>
            <button
              type="button"
              disabled={!valid || tx.busy || !trusted}
              className="btn btn-accent min-h-0 py-1.5 text-[13.5px]"
              data-testid="allow-add"
              onClick={() => tx.run("allowlist updated", (w, step) => setAllowedOnChain(w, token, [who.trim()], true, step))}
            >
              Allow
            </button>
            <button
              type="button"
              disabled={!valid || tx.busy || !trusted}
              className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]"
              onClick={() => tx.run("allowlist updated", (w, step) => setAllowedOnChain(w, token, [who.trim()], false, step))}
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
      {check ? <p className="text-[13.5px] text-ink-2">{check}</p> : null}
      <TxLine {...tx} />
    </div>
  );
}

/** Records a practice record's commitment in the on-chain registry. */
export function AnchorButton({ rec }: { rec: ChainRec }) {
  const tx = useTx();
  if (!registryLive()) return null;
  return (
    <div className="space-y-1">
      <button
        type="button"
        disabled={tx.busy || tx.last !== null}
        className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]"
        data-testid="anchor"
        onClick={() => tx.run("commitment recorded on chain", (w, step) => anchorOnChain(w, rec.commitment, rec.kind, rec.status, step))}
      >
        Record the commitment on chain
      </button>
      <TxLine {...tx} />
    </div>
  );
}
