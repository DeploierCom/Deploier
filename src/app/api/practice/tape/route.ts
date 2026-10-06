import { NextResponse } from "next/server";
import { getStore } from "@/lib/auth/store";
import { allowPublic, tooMany } from "@/lib/guard";
import { readTape } from "@/lib/practice/desk";
import { notConfigured } from "@/lib/practice/http";

export const dynamic = "force-dynamic";

/** The public tape: commitments and statuses only, never parties or amounts. */
export async function GET(request: Request) {
  const store = getStore();
  if (!store) return notConfigured();
  if (!(await allowPublic(store, request, "tape", 120, 3000))) return tooMany();
  return NextResponse.json({ at: Date.now(), entries: await readTape(store) }, { headers: { "cache-control": "no-store" } });
}
