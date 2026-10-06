"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, ShieldCheck, TriangleAlert } from "lucide-react";
import { CHAIN, shortAddress } from "@/config/brand";
import { useWallet } from "@/components/wallet/WalletProvider";
import { AccessButton } from "@/components/wallet/WalletButton";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { ASSETS, ASSET_CLASSES, classLabel, type AssetClass } from "@/lib/practice/assets";
import { commitment } from "@/lib/practice/commit";

/*
 * The practice desk. Every action: the server writes a ticket, the wallet
 * signs it (personal_sign, free), the server applies it. View keys for the
 * records you create or open are kept in this browser only.
 */

type Saved = { id: string; key: string };
type Leg = { asset: string; amount: string };
type Rec = {
  kind: "settlement" | "issuance";
  id: string;
  status: string;
  commitment: string;
  salt: string;
  createdAt: number;
  createdBlock: number | null;
  closedAt?: number | null;
  closedBlock?: number | null;
  maker?: string;
  taker?: string;
  give?: Leg;
  get?: Leg;
  memo?: string;
  issuer?: string;
  assetClass?: AssetClass;
  name?: string;
  symbol?: string;
  units?: string;
  faceUsd?: string;
  holders?: string[];
  maturity?: string | null;
};
type Tape = { id: string; kind: string; commitment: string; status: string; at: number; block: number | null };

const STATUS_TONE: Record<string, string> = {
  settled: "text-up",
  recorded: "text-up",
  proposed: "text-stamp",
  cancelled: "text-ink-3",
  expired: "text-ink-3",
};

function recompute(r: Rec) {
  const terms =
    r.kind === "settlement"
      ? { maker: r.maker, taker: r.taker, give: r.give, get: r.get, memo: r.memo }
      : { issuer: r.issuer, assetClass: r.assetClass, name: r.name, symbol: r.symbol, units: r.units, faceUsd: r.faceUsd, holders: r.holders, maturity: r.maturity };
  return commitment(terms, r.salt);
}

async function post<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; error: string; configured: boolean }> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string; message?: string };
    if (res.ok) return { ok: true, data };
    if (res.status === 503) return { ok: false, error: data.message ?? "Practice storage is not configured on this site yet.", configured: false };
    return { ok: false, error: data.error ?? `Request failed (${res.status}).`, configured: true };
  } catch {
    return { ok: false, error: "The site could not be reached. Check your connection.", configured: true };
  }
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="eyebrow mb-1.5 block">
      {children}
    </label>
  );
}

function AssetSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <select id={id} className="field" value={value} onChange={(e) => onChange(e.target.value)}>
      {ASSETS.map((a) => (
        <option key={a.id} value={a.id}>
          {a.label}
        </option>
      ))}
    </select>
  );
}

export function DeskApp() {
  const { address, signMessage, onRobinhoodChain, chainId } = useWallet();
  const who = address?.toLowerCase() ?? "";
  const [saved, setSaved] = useLocalStore<Saved[]>(`deploier.desk.${who || "none"}`, []);
  const [tab, setTab] = useState<"settle" | "issue">("settle");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "err"; text: string } | null>(null);
  const [configured, setConfigured] = useState(true);
  const [records, setRecords] = useState<Record<string, Rec | "missing">>({});
  const [tape, setTape] = useState<Tape[] | null>(null);

  // Settlement form
  const [taker, setTaker] = useState("");
  const [giveAsset, setGiveAsset] = useState("USDG");
  const [giveAmount, setGiveAmount] = useState("");
  const [getAsset, setGetAsset] = useState("AAPL");
  const [getAmount, setGetAmount] = useState("");
  const [memo, setMemo] = useState("");
  // Issuance form
  const [assetClass, setAssetClass] = useState<AssetClass>("treasury");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [units, setUnits] = useState("");
  const [faceUsd, setFaceUsd] = useState("100");
  const [holders, setHolders] = useState("");
  const [maturity, setMaturity] = useState("");

  const loadTape = useCallback(async () => {
    try {
      const res = await fetch("/api/practice/tape", { cache: "no-store" });
      if (res.status === 503) {
        setConfigured(false);
        return;
      }
      if (res.ok) setTape(((await res.json()) as { entries: Tape[] }).entries);
    } catch {
      // keep the last tape
    }
  }, []);

  useEffect(() => {
    const first = window.setTimeout(loadTape, 0);
    const t = window.setInterval(() => document.visibilityState === "visible" && loadTape(), 10_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
    };
  }, [loadTape]);

  const loadRecord = useCallback(async (s: Saved) => {
    const r = await post<Rec>("/api/practice/record", { id: s.id, key: s.key });
    if (r.ok) setRecords((m) => ({ ...m, [s.id]: r.data }));
    else if (!r.configured) setConfigured(false);
    else setRecords((m) => ({ ...m, [s.id]: "missing" }));
  }, []);

  const savedKey = useMemo(() => saved.map((s) => s.id).join(","), [saved]);
  useEffect(() => {
    saved.forEach((s) => void loadRecord(s));
    // Reload when the list changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedKey, loadRecord]);

  // A shared link carries "#open=<id>.<key>". Keep it for this wallet and clear it from the address bar.
  useEffect(() => {
    if (!who) return;
    const take = () => {
      const m = /open=([0-9a-f]{16})\.([0-9a-f]{64})/.exec(window.location.hash);
      if (!m) return;
      const entry = { id: m[1], key: m[2] };
      if (!saved.some((s) => s.id === entry.id)) setSaved([entry, ...saved].slice(0, 50));
      history.replaceState(null, "", window.location.pathname);
      setNotice({ tone: "ok", text: "Opened a shared settlement. It is listed under your records below." });
    };
    const first = window.setTimeout(take, 0);
    window.addEventListener("hashchange", take);
    return () => {
      window.clearTimeout(first);
      window.removeEventListener("hashchange", take);
    };
  }, [who, saved, setSaved]);

  const run = async (action: Record<string, unknown>, done: (d: { id: string; viewKey?: string; status: string }) => void) => {
    if (!address) return;
    setBusy(true);
    setNotice(null);
    try {
      const ticket = await post<{ nonce: string; message: string }>("/api/practice/ticket", { address, action });
      if (!ticket.ok) {
        if (!ticket.configured) setConfigured(false);
        setNotice({ tone: "err", text: ticket.error });
        return;
      }
      let signature: string;
      try {
        signature = await signMessage(ticket.data.message);
      } catch (e) {
        setNotice({ tone: "err", text: e instanceof Error ? e.message : "The wallet did not sign." });
        return;
      }
      const result = await post<{ id: string; viewKey?: string; status: string }>("/api/practice/redeem", { nonce: ticket.data.nonce, signature });
      if (!result.ok) {
        setNotice({ tone: "err", text: result.error });
        return;
      }
      done(result.data);
      void loadTape();
    } finally {
      setBusy(false);
    }
  };

  const propose = (e: React.FormEvent) => {
    e.preventDefault();
    run({ kind: "propose", taker, give: { asset: giveAsset, amount: giveAmount }, get: { asset: getAsset, amount: getAmount }, memo }, (d) => {
      if (d.viewKey) setSaved([{ id: d.id, key: d.viewKey }, ...saved].slice(0, 50));
      setNotice({ tone: "ok", text: "Proposal signed. Copy its private link below and send it to the counterparty." });
      setGiveAmount("");
      setGetAmount("");
      setMemo("");
    });
  };

  const issue = (e: React.FormEvent) => {
    e.preventDefault();
    const list = holders.split(/[\s,]+/).filter(Boolean);
    run({ kind: "issue", assetClass, name, symbol, units, faceUsd, holders: list, maturity: maturity || null }, (d) => {
      if (d.viewKey) setSaved([{ id: d.id, key: d.viewKey }, ...saved].slice(0, 50));
      setNotice({ tone: "ok", text: "Practice issuance recorded. Only its commitment is on the public tape." });
      setName("");
      setSymbol("");
      setUnits("");
    });
  };

  const act = (kind: "accept" | "cancel", s: Saved) =>
    run({ kind, id: s.id }, () => {
      setNotice({ tone: "ok", text: kind === "accept" ? "Accepted. The settlement is final on the practice tape." : "Proposal withdrawn." });
      void loadRecord(s);
    });

  const tapeById = useMemo(() => new Map((tape ?? []).map((t) => [t.id, t])), [tape]);

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-8">
        {!configured ? (
          <div className="flex items-start gap-3 border border-seal bg-seal-soft p-4 text-[15px]" data-testid="desk-not-configured">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-seal" />
            <p>Practice storage is not configured on this deployment yet, so the desk cannot record actions. Everything else on the site works.</p>
          </div>
        ) : null}

        {!address ? (
          <div className="border border-ink bg-card p-6">
            <h2 className="serif text-[28px] leading-tight">Connect a wallet to use the desk</h2>
            <p className="mt-2 max-w-[560px] text-[15px] text-ink-2">
              Every action is a free signature. Nothing is sent to {CHAIN.name} and no token approval is ever requested.
            </p>
            <div className="mt-5">
              <AccessButton />
            </div>
          </div>
        ) : (
          <div className="border border-ink bg-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink px-5 py-3">
              <div role="tablist" className="flex gap-1">
                {(
                  [
                    ["settle", "Private settlement"],
                    ["issue", "Tokenize an asset"],
                  ] as const
                ).map(([k, label]) => (
                  <button
                    key={k}
                    role="tab"
                    type="button"
                    aria-selected={tab === k}
                    onClick={() => setTab(k)}
                    className={`cursor-pointer px-3 py-1.5 text-[14.5px] font-medium ${tab === k ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <span className="num text-[12.5px] text-ink-3">Signing as {shortAddress(address, 6, 4)}</span>
            </div>

            {chainId !== null && !onRobinhoodChain ? (
              <p className="border-b border-line px-5 py-2.5 text-[13.5px] text-ink-2">
                Your wallet is on chain {chainId}. Practice signatures still work; switch to {CHAIN.name} from the header when you want to trade.
              </p>
            ) : null}

            {tab === "settle" ? (
              <form onSubmit={propose} className="grid grid-cols-1 gap-5 p-5" data-testid="settle-form">
                <div>
                  <Label htmlFor="taker">Counterparty wallet</Label>
                  <input id="taker" className="field num" placeholder="0x…" value={taker} onChange={(e) => setTaker(e.target.value)} autoComplete="off" spellCheck={false} />
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <fieldset className="min-w-0 border border-line-2 p-4">
                    <legend className="eyebrow px-1">You deliver</legend>
                    <AssetSelect id="give-asset" value={giveAsset} onChange={setGiveAsset} />
                    <input aria-label="Amount you deliver" className="field num mt-3" inputMode="decimal" placeholder="Amount" value={giveAmount} onChange={(e) => setGiveAmount(e.target.value)} />
                  </fieldset>
                  <fieldset className="min-w-0 border border-line-2 p-4">
                    <legend className="eyebrow px-1">You receive</legend>
                    <AssetSelect id="get-asset" value={getAsset} onChange={setGetAsset} />
                    <input aria-label="Amount you receive" className="field num mt-3" inputMode="decimal" placeholder="Amount" value={getAmount} onChange={(e) => setGetAmount(e.target.value)} />
                  </fieldset>
                </div>
                <div>
                  <Label htmlFor="memo">Private memo (optional)</Label>
                  <input id="memo" className="field" maxLength={80} placeholder="Only the two parties will read this" value={memo} onChange={(e) => setMemo(e.target.value)} />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" disabled={busy || !configured} className="btn btn-accent">
                    {busy ? "Check your wallet…" : "Sign proposal"}
                  </button>
                  <span className="text-[13.5px] text-ink-3">Proposals expire after 24 hours.</span>
                </div>
              </form>
            ) : (
              <form onSubmit={issue} className="grid grid-cols-1 gap-5 p-5" data-testid="issue-form">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="min-w-0">
                    <Label htmlFor="class">Asset class</Label>
                    <select id="class" className="field" value={assetClass} onChange={(e) => setAssetClass(e.target.value as AssetClass)}>
                      {ASSET_CLASSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="maturity">Maturity (optional)</Label>
                    <input id="maturity" type="date" className="field" value={maturity} onChange={(e) => setMaturity(e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="iname">Instrument name</Label>
                    <input id="iname" className="field" maxLength={48} placeholder="e.g. 13-week bill, Dec 2026" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="isym">Symbol</Label>
                    <input id="isym" className="field num uppercase" maxLength={10} placeholder="TB13W" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="units">Units</Label>
                    <input id="units" className="field num" inputMode="numeric" placeholder="10000" value={units} onChange={(e) => setUnits(e.target.value)} />
                  </div>
                  <div className="min-w-0">
                    <Label htmlFor="face">Face value per unit (USD)</Label>
                    <input id="face" className="field num" inputMode="decimal" value={faceUsd} onChange={(e) => setFaceUsd(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="holders">Eligible holders (1 to 5 addresses)</Label>
                  <textarea id="holders" rows={3} className="field num text-[13.5px]" placeholder="0x… one per line" value={holders} onChange={(e) => setHolders(e.target.value)} spellCheck={false} />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <button type="submit" disabled={busy || !configured} className="btn btn-accent">
                    {busy ? "Check your wallet…" : "Sign practice issuance"}
                  </button>
                  <span className="text-[13.5px] text-ink-3">No token is minted in practice mode.</span>
                </div>
              </form>
            )}

            {notice ? (
              <p role="status" className={`border-t border-line px-5 py-3 text-[14px] ${notice.tone === "err" ? "text-down" : "text-up"}`} data-testid="desk-notice">
                {notice.text}
              </p>
            ) : null}
          </div>
        )}

        {address ? (
          <section aria-labelledby="mine">
            <h2 id="mine" className="serif text-[30px] leading-tight">
              Your private records
            </h2>
            <p className="mt-1 text-[14.5px] text-ink-3">Opened with view keys stored in this browser for {shortAddress(address, 6, 4)}.</p>
            {saved.length === 0 ? (
              <p className="mt-4 border border-dashed border-line-2 p-5 text-[15px] text-ink-2">
                Nothing yet. Sign a proposal or an issuance above, or open a private link someone sent you.
              </p>
            ) : (
              <ul className="mt-4 space-y-4" data-testid="records">
                {saved.map((s) => (
                  <RecordCard key={s.id} saved={s} rec={records[s.id]} me={who} tape={tapeById.get(s.id)} busy={busy} onAct={act} />
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>

      <aside className="min-w-0" aria-labelledby="tape">
        <div className="night border border-ink xl:sticky xl:top-24">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <h2 id="tape" className="serif text-[24px]">
              Public tape
            </h2>
            <span className="chip chip-live">Polling</span>
          </div>
          <p className="px-5 pt-3 text-[13.5px] text-ink-3">What anyone can see. No parties, no assets, no amounts.</p>
          <ol className="max-h-[560px] overflow-y-auto px-5 py-3" data-testid="tape">
            {tape === null ? <li className="py-3 text-[14px] text-ink-3">{configured ? "Reading the tape…" : "Not configured on this deployment."}</li> : null}
            {tape?.length === 0 ? <li className="py-3 text-[14px] text-ink-3">The tape is empty. Be the first to settle.</li> : null}
            {tape?.map((t) => (
              <li key={t.id} className="border-b border-line py-3 last:border-b-0">
                <div className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="eyebrow">{t.kind}</span>
                  <span className={`num ${STATUS_TONE[t.status] ?? ""}`}>{t.status}</span>
                </div>
                <p className="num mt-1 truncate text-[13px] text-ink">{t.commitment}</p>
                <p className="num mt-0.5 text-[12px] text-ink-3">
                  {t.block ? `block #${t.block.toLocaleString("en-US")}` : "block unknown"} · {new Date(t.at).toISOString().slice(0, 16).replace("T", " ")} UTC
                </p>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}

function RecordCard({
  saved,
  rec,
  me,
  tape,
  busy,
  onAct,
}: {
  saved: Saved;
  rec: Rec | "missing" | undefined;
  me: string;
  tape: Tape | undefined;
  busy: boolean;
  onAct: (k: "accept" | "cancel", s: Saved) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  if (!rec) return <li className="border border-line-2 p-5 text-[14px] text-ink-3">Opening record {saved.id}…</li>;
  if (rec === "missing") return <li className="border border-line-2 p-5 text-[14px] text-ink-3">Record {saved.id} could not be opened with the stored key.</li>;
  const link = typeof window !== "undefined" ? `${window.location.origin}/app#open=${saved.id}.${saved.key}` : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // the link stays selectable below
    }
  };
  const verify = () => setVerified(recompute(rec) === rec.commitment && (!tape || tape.commitment === rec.commitment));
  const role = rec.kind === "issuance" ? "issuer" : rec.maker === me ? "maker" : rec.taker === me ? "counterparty" : "viewer";
  return (
    <li className="border border-ink bg-card" data-testid="record">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="eyebrow">
          {rec.kind} · {saved.id} · you are {role}
        </span>
        <span className={`num text-[13px] ${STATUS_TONE[rec.status] ?? ""}`}>{rec.status}</span>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 px-5 py-4 text-[14.5px] sm:grid-cols-2">
        {rec.kind === "settlement" ? (
          <>
            <p>
              <span className="text-ink-3">Maker</span> <span className="num">{shortAddress(rec.maker ?? "", 6, 4)}</span>
            </p>
            <p>
              <span className="text-ink-3">Counterparty</span> <span className="num">{shortAddress(rec.taker ?? "", 6, 4)}</span>
            </p>
            <p>
              <span className="text-ink-3">Maker delivers</span>{" "}
              <span className="num">
                {rec.give?.amount} {rec.give?.asset}
              </span>
            </p>
            <p>
              <span className="text-ink-3">Maker receives</span>{" "}
              <span className="num">
                {rec.get?.amount} {rec.get?.asset}
              </span>
            </p>
            {rec.memo ? <p className="sm:col-span-2">
              <span className="text-ink-3">Memo</span> {rec.memo}
            </p> : null}
          </>
        ) : (
          <>
            <p>
              <span className="text-ink-3">Instrument</span> {rec.name} <span className="num">({rec.symbol})</span>
            </p>
            <p>
              <span className="text-ink-3">Class</span> {rec.assetClass ? classLabel(rec.assetClass) : ""}
            </p>
            <p>
              <span className="text-ink-3">Units</span> <span className="num">{rec.units}</span> at <span className="num">${rec.faceUsd}</span>
            </p>
            <p>
              <span className="text-ink-3">Maturity</span> {rec.maturity ?? "none"}
            </p>
            <p className="sm:col-span-2">
              <span className="text-ink-3">Eligible holders</span>{" "}
              <span className="num">{rec.holders?.map((h) => shortAddress(h, 6, 4)).join(", ")}</span>
            </p>
          </>
        )}
        <p className="min-w-0 sm:col-span-2">
          <span className="text-ink-3">Commitment</span> <span className="num break-all text-[13px]">{rec.commitment}</span>
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <button type="button" onClick={verify} className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]">
          <ShieldCheck className="size-4" /> Verify commitment
        </button>
        {rec.kind === "settlement" ? (
          <button type="button" onClick={copy} className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Link copied" : "Copy private link"}
          </button>
        ) : null}
        {rec.kind === "settlement" && rec.status === "proposed" && role === "counterparty" ? (
          <button type="button" disabled={busy} onClick={() => onAct("accept", saved)} className="btn btn-accent min-h-0 py-1.5 text-[13.5px]">
            Sign acceptance
          </button>
        ) : null}
        {rec.kind === "settlement" && rec.status === "proposed" && role === "maker" ? (
          <button type="button" disabled={busy} onClick={() => onAct("cancel", saved)} className="btn btn-ghost min-h-0 py-1.5 text-[13.5px]">
            Withdraw
          </button>
        ) : null}
        {verified !== null ? (
          <span className={`text-[13.5px] ${verified ? "text-up" : "text-down"}`} data-testid="verify-result">
            {verified ? "Matches the public tape: terms + salt hash to this commitment." : "Does not match. Do not rely on this record."}
          </span>
        ) : null}
      </div>
    </li>
  );
}
