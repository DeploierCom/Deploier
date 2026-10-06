"use client";

import { useEffect, useState } from "react";
import { CHAIN, USDG, explorerAddress, explorerToken } from "@/config/brand";
import { useChain } from "@/components/providers/ChainProvider";
import { Stat } from "@/components/ui";
import { compact, usd } from "@/lib/format";

/** Four live readings of Robinhood Chain: latest block, gas, ETH/USD, USDG supply. */
export function LiveStrip() {
  const { facts, failed } = useChain();
  const supply = facts?.usdg.supply ? Number(BigInt(facts.usdg.supply) / 10n ** BigInt(facts.usdg.decimals)) : null;
  const age = facts?.blockTime ? Math.max(0, Math.round(facts.at / 1000 - facts.blockTime)) : null;
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4" data-testid="live-strip">
      <Stat
        label="Latest block"
        testid="live-block"
        value={facts?.block ? `#${facts.block.toLocaleString("en-US")}` : failed ? "unavailable" : "reading…"}
        note={age !== null ? `${age}s ago` : `chain id ${CHAIN.id}`}
      />
      <Stat label="Gas price" value={facts?.gasGwei != null ? `${facts.gasGwei.toFixed(4)} gwei` : "–"} note="eth_gasPrice" />
      <Stat label="ETH / USD" value={facts?.ethUsd != null ? usd(facts.ethUsd) : "–"} note="native gas asset, spot" />
      <Stat
        label="USDG supply"
        value={supply !== null ? compact(supply) : "–"}
        note={
          <a href={explorerToken(USDG.address)} target="_blank" rel="noreferrer" className="link">
            read from the token contract
          </a>
        }
      />
    </div>
  );
}

type StockRow = { symbol: string; name: string; token: string; feed: string; price: number | null; updatedAt: number | null };

/** Tokenized equities on Robinhood Chain, priced live by their Chainlink feeds. */
export function StockBoard() {
  const [rows, setRows] = useState<StockRow[] | null>(null);
  const [open, setOpen] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/stocks", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((v: { rows: StockRow[]; marketOpen: boolean }) => {
          if (cancelled) return;
          setRows(v.rows);
          setOpen(v.marketOpen);
          setFailed(false);
        })
        .catch(() => !cancelled && setFailed(true));
    load();
    const t = window.setInterval(() => document.visibilityState === "visible" && load(), 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(t);
    };
  }, []);
  return (
    <div className="min-w-0" data-testid="stock-board">
      <div className="scroll-x">
        <table className="tbl min-w-[560px]">
          <thead>
            <tr>
              <th>Token</th>
              <th>Company</th>
              <th className="text-right">Feed price</th>
              <th className="text-right">Last update</th>
              <th>Contract</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((r) => (
              <tr key={r.symbol}>
                <td className="num font-medium">{r.symbol}</td>
                <td>{r.name}</td>
                <td className="num text-right">{r.price != null ? usd(r.price) : "–"}</td>
                <td className="num text-right text-ink-3">{r.updatedAt ? new Date(r.updatedAt).toISOString().slice(5, 16).replace("T", " ") : "–"}</td>
                <td>
                  <a href={explorerAddress(r.token)} target="_blank" rel="noreferrer" className="link num text-[13px]">
                    {r.token.slice(0, 6)}…{r.token.slice(-4)}
                  </a>
                </td>
              </tr>
            ))}
            {!rows ? (
              <tr>
                <td colSpan={5} className="text-ink-3">
                  {failed ? "The price feeds could not be read right now. Retrying." : "Reading Chainlink feeds on Robinhood Chain…"}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13px] text-ink-3">
        Prices from Chainlink USD feeds on {CHAIN.name}, times in UTC. {open === false ? "US equity hours are closed, so feeds hold their last value." : ""} These
        tokens are issued by Robinhood, not by Deploier.
      </p>
    </div>
  );
}
