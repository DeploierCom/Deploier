import { NextResponse } from "next/server";
import { isAddress } from "@/config/brand";
import { signInDomain } from "@/lib/auth/domain";
import { getStore } from "@/lib/auth/store";
import { allowPublic, badBody, clientIp, readBody, tooLarge, tooMany } from "@/lib/guard";
import { allowTicket } from "@/lib/practice/limits";
import { notConfigured } from "@/lib/practice/http";
import { issueTicket, parseAction } from "@/lib/practice/tickets";

export const dynamic = "force-dynamic";

/** Step 1: the server writes the exact action text for the wallet to sign. */
export async function POST(request: Request) {
  const store = getStore();
  if (!store) return notConfigured();
  if (!(await allowPublic(store, request, "ticket", 40, 600))) return tooMany();
  const parsed = await readBody<{ address?: unknown; action?: unknown }>(request, 2048);
  if (!parsed.ok) return parsed.tooLarge ? tooLarge() : badBody();
  const body = parsed.value;
  const address = typeof body.address === "string" ? body.address : "";
  if (!isAddress(address)) return NextResponse.json({ error: "Connect a wallet first." }, { status: 400 });
  // Not yet proven to be the caller's address: count it only together with the caller's network.
  if (!(await allowTicket(store, clientIp(request), address))) return tooMany();
  const action = body.action && typeof body.action === "object" ? parseAction(body.action as Record<string, unknown>, address) : { error: "Missing action." };
  if ("error" in action) return NextResponse.json({ error: action.error }, { status: 400 });
  const host = signInDomain(request.headers.get("host"));
  return NextResponse.json(await issueTicket(store, address, action, host));
}
