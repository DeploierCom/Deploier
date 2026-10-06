import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount } from "./assets";
import { canonical, commitment } from "./commit";
import { parseAction } from "./tickets";

const A = "0x1111111111111111111111111111111111111111";
const B = "0x2222222222222222222222222222222222222222";

test("amounts are normalised and bounded", () => {
  assert.equal(parseAmount("0012.500"), "12.5");
  assert.equal(parseAmount("1,000"), "1000");
  assert.equal(parseAmount("0"), null);
  assert.equal(parseAmount("0.0000001"), null);
  assert.equal(parseAmount("-5"), null);
  assert.equal(parseAmount("1e5"), null);
});

test("canonical JSON ignores key order", () => {
  assert.equal(canonical({ b: 1, a: { d: [2, 1], c: "x" } }), canonical({ a: { c: "x", d: [2, 1] }, b: 1 }));
});

test("commitment depends on terms and salt", () => {
  const t = { maker: A, taker: B, give: { asset: "USDG", amount: "10" }, get: { asset: "AAPL", amount: "1" }, memo: "" };
  const c1 = commitment(t, "aa");
  assert.match(c1, /^0x[0-9a-f]{64}$/);
  assert.equal(commitment({ ...t }, "aa"), c1);
  assert.notEqual(commitment(t, "ab"), c1);
  assert.notEqual(commitment({ ...t, memo: "x" }, "aa"), c1);
});

test("propose validation", () => {
  const ok = parseAction({ kind: "propose", taker: B, give: { asset: "USDG", amount: "100" }, get: { asset: "NVDA", amount: "2" } }, A);
  assert.ok(!("error" in ok));
  assert.ok("error" in parseAction({ kind: "propose", taker: A, give: { asset: "USDG", amount: "1" }, get: { asset: "NVDA", amount: "1" } }, A));
  assert.ok("error" in parseAction({ kind: "propose", taker: B, give: { asset: "USDG", amount: "1" }, get: { asset: "USDG", amount: "1" } }, A));
  assert.ok("error" in parseAction({ kind: "propose", taker: B, give: { asset: "DOGE", amount: "1" }, get: { asset: "USDG", amount: "1" } }, A));
});

test("issue validation", () => {
  const base = { kind: "issue", assetClass: "treasury", name: "13-week bill", symbol: "tb13", units: "1000", faceUsd: "100", holders: [B] };
  const ok = parseAction(base, A);
  assert.ok(!("error" in ok) && ok.kind === "issue" && ok.symbol === "TB13");
  assert.ok("error" in parseAction({ ...base, holders: [] }, A));
  assert.ok("error" in parseAction({ ...base, holders: ["nope"] }, A));
  assert.ok("error" in parseAction({ ...base, maturity: "2001-01-01" }, A));
  assert.ok("error" in parseAction({ ...base, units: "1.5" }, A));
});

test("accept needs a well-formed id", () => {
  assert.ok("error" in parseAction({ kind: "accept", id: "xyz" }, A));
  assert.ok(!("error" in parseAction({ kind: "accept", id: "0123456789abcdef" }, A)));
});
