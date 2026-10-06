import { NextResponse } from "next/server";
import { getStore } from "@/lib/auth/store";
import { allowPublic, badBody, readBody, tooLarge, tooMany } from "@/lib/guard";
import { openRecord } from "@/lib/practice/desk";
import { notConfigured } from "@/lib/practice/http";
import { ID } from "@/lib/practice/tickets";

export const dynamic = "force-dynamic";

/** The private record for whoever holds its view key. POST keeps the key out of URLs and logs. */
export async function POST(request: Request) {
  const store = getStore();
  if (!store) return notConfigured();
  if (!(await allowPublic(store, request, "record", 120, 3000))) return tooMany();
  const parsed = await readBody<{ id?: unknown; key?: unknown }>(request, 512);
  if (!parsed.ok) return parsed.tooLarge ? tooLarge() : badBody();
  const id = typeof parsed.value.id === "string" ? parsed.value.id : "";
  const key = typeof parsed.value.key === "string" ? parsed.value.key : "";
  if (!ID.test(id)) return NextResponse.json({ error: "Unknown record." }, { status: 404 });
  const record = await openRecord(store, id, key);
  // Same answer for "no such id" and "wrong key", so ids cannot be probed.
  if (!record) return NextResponse.json({ error: "No record matches that link." }, { status: 404 });
  return NextResponse.json(record, { headers: { "cache-control": "no-store" } });
}
