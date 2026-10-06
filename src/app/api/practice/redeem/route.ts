import { NextResponse } from "next/server";
import { getStore } from "@/lib/auth/store";
import { allowPublic, badBody, readBody, tooLarge, tooMany } from "@/lib/guard";
import { apply } from "@/lib/practice/desk";
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
  const result = await apply(store, ticket.address, ticket.action);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json(result, { headers: { "cache-control": "no-store" } });
}
