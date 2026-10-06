import { NextResponse } from "next/server";
import { getStore } from "@/lib/auth/store";
import { allowPublic, badBody, clientIp, readBody, tooLarge, tooMany } from "@/lib/guard";
import { apply } from "@/lib/practice/desk";
import { allowCreate } from "@/lib/practice/limits";
import { notConfigured } from "@/lib/practice/http";
import { redeemTicket } from "@/lib/practice/tickets";

export const dynamic = "force-dynamic";

/** Step 2: the signed ticket comes back; the stored action (never the browser's copy) is applied. */
export async function POST(request: Request) {
  const store = getStore();
  if (!store) return notConfigured();
  if (!(await allowPublic(store, request, "redeem", 40, 600))) return tooMany();
  const parsed = await readBody<{ nonce?: unknown; signature?: unknown }>(request, 1024);
  if (!parsed.ok) return parsed.tooLarge ? tooLarge() : badBody();
  const nonce = typeof parsed.value.nonce === "string" ? parsed.value.nonce : "";
  const signature = typeof parsed.value.signature === "string" ? parsed.value.signature : "";
  const ticket = await redeemTicket(store, nonce, signature);
  if ("error" in ticket) return NextResponse.json({ error: ticket.error }, { status: ticket.status });
  // Creating records is the only path that grows the store: cap it per network and per signing wallet.
  const creates = ticket.action.kind === "propose" || ticket.action.kind === "issue";
  if (creates && !(await allowCreate(store, clientIp(request), ticket.address))) return tooMany();
  const result = await apply(store, ticket.address, ticket.action);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
