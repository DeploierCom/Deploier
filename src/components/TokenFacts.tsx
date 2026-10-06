"use client";

import { useEffect, useState } from "react";
import { BRAND, TOKEN } from "@/config/brand";
import { Stat } from "@/components/ui";
import { compact } from "@/lib/format";
import { rpcBatch } from "@/lib/rpc";

function abiString(hex: string | null | undefined) {
  if (!hex || hex.length < 130) return null;
  const body = hex.slice(2);
  const len = Number(BigInt(`0x${body.slice(64, 128)}`));
  const bytes = body.slice(128, 128 + len * 2).match(/../g) ?? [];
  return new TextDecoder().decode(new Uint8Array(bytes.map((b) => parseInt(b, 16))));
}

/** Name, symbol, decimals and supply of the token, read on-chain once the CA is real. */
export function TokenFacts() {
  const [facts, setFacts] = useState<{ name: string | null; symbol: string | null; supply: number | null } | null>(null);
  const [failed, setFailed] = useState(false);
  const live = TOKEN.isLive;
  useEffect(() => {
    if (!live) return;
    const call = (data: string) => ({ method: "eth_call", params: [{ to: BRAND.ca, data }, "latest"] });
    rpcBatch<string>([call("0x06fdde03"), call("0x95d89b41"), call("0x313ce567"), call("0x18160ddd")])
      .then(([name, symbol, decimals, supply]) => {
        const dec = decimals && decimals.length > 2 ? Number(BigInt(decimals)) : 18;
        setFacts({
          name: abiString(name),
          symbol: abiString(symbol),
          supply: supply && supply.length > 2 ? Number(BigInt(supply) / 10n ** BigInt(dec)) : null,
        });
      })
      .catch(() => setFailed(true));
  }, [live]);
  const pending = live ? (failed ? "unavailable" : "reading…") : "at launch";
  return (
    <div className="grid grid-cols-1 gap-[15px] min-[440px]:grid-cols-2 lg:grid-cols-4">
      <Stat label="Name (on-chain)" value={facts?.name ?? pending} />
      <Stat label="Symbol (on-chain)" value={facts?.symbol ?? pending} />
      <Stat label="Total supply" value={facts?.supply != null ? compact(facts.supply) : pending} />
      <Stat label="Network" value="Robinhood Chain" note="chain id 4663" />
    </div>
  );
}
