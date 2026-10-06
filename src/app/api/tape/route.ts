import { NextResponse } from "next/server";
import { anyLive } from "@/config/contracts";
import { getStore } from "@/lib/auth/store";
import { allowPublic, tooMany } from "@/lib/guard";
import { readChainTape } from "@/lib/onchain/tape";

export const dynamic = "force-dynamic";

/** The on-chain public tape: commitments, statuses and blocks read from the deployed contracts. */
export async function GET(request: Request) {
  if (!anyLive()) return NextResponse.json({ live: false, entries: [] }, { headers: { "cache-control": "no-store" } });
  const store = getStore();
  if (store && !(await allowPublic(store, request, "chain-tape", 120, 3000))) return tooMany();
  try {
    return NextResponse.json({ live: true, at: Date.now(), entries: await readChainTape() }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ live: true, error: "The chain could not be read just now." }, { status: 502 });
  }
}
