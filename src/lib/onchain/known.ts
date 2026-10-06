import "server-only";
import { CONTRACTS, factoryLive } from "@/config/contracts";
import { rpc } from "@/lib/feeds/rpc";
import { encodeIsToken } from "@/lib/onchain/calls";
import type { Call } from "@/lib/relay";

/*
 * Lets the read relay serve tokens made by the Deploier factory. Each unknown
 * eth_call target (at most 3 per request) is checked once with
 * factory.isToken(); positive answers are cached for the life of the process.
 */
const confirmed = new Set<string>();
const refused = new Map<string, number>();

export async function factoryTokens(calls: Call[], known: Set<string>): Promise<string[]> {
  if (!factoryLive()) return [];
  const unknown = new Set<string>();
  for (const c of calls) {
    const to = c?.method === "eth_call" && Array.isArray(c.params) ? (c.params[0] as { to?: unknown } | undefined)?.to : undefined;
    if (typeof to === "string" && /^0x[0-9a-fA-F]{40}$/.test(to) && !known.has(to.toLowerCase())) unknown.add(to.toLowerCase());
  }
  const out: string[] = [];
  for (const to of [...unknown].slice(0, 3)) {
    if (confirmed.has(to)) {
      out.push(to);
      continue;
    }
    if ((refused.get(to) ?? 0) > Date.now()) continue;
    try {
      const r = await rpc<string>("eth_call", [{ to: CONTRACTS.factory.address, data: encodeIsToken(to) }, "latest"]);
      if (BigInt(r) === 1n) {
        confirmed.add(to);
        out.push(to);
      } else refused.set(to, Date.now() + 60_000);
    } catch {
      // treat as unknown this time
    }
  }
  if (refused.size > 2000) refused.clear();
  return out;
}
