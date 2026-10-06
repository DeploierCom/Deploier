import { test } from "node:test";
import assert from "node:assert/strict";
import { verifyDeployment } from "./verify-lib.mjs";

// A fake chain with one honest deployment and a set of tampered or broken answers. Every broken path must FAIL.
const ESC = { creation: "0x6080aa11", runtime: "0x6080bb22", immutables: 0 };
const artifacts = {
  SettlementEscrow: ESC,
  CommitmentRegistry: { creation: "0x6080cc33", runtime: "0x6080dd44", immutables: 0 },
  AllowlistTokenFactory: { creation: "0x6080ee55", runtime: "0x6080ff66", immutables: 0 },
};
const ADDR = "0x" + "1".repeat(40);
const TX = "0x" + "a".repeat(64);
const honest = () => ({
  chainId: "0x1237",
  code: "0x6080BB22", // upper case on purpose: comparisons normalise both sides
  tx: { hash: TX.toUpperCase().replace("0X", "0x"), to: null, input: "0x6080AA11" },
  receipt: { status: "0x1", contractAddress: ADDR.toUpperCase().replace("0X", "0x"), blockNumber: "0x10" },
});
const chainOf = (c, fail = {}) => async (method, params) => {
  if (fail[method]) throw new Error("boom");
  if (method === "eth_chainId") return c.chainId;
  if (method === "eth_getCode") return c.code;
  if (method === "eth_getTransactionByHash") return params[0] === TX ? c.tx : null;
  if (method === "eth_getTransactionReceipt") return params[0] === TX ? c.receipt : null;
  throw new Error(method);
};
const run = (over = {}, chain = honest(), fail = {}) => verifyDeployment({ address: ADDR, txHash: TX, artifacts, rpc: chainOf(chain, fail), ...over });
const failsWith = async (r, label) => {
  const res = await r;
  assert.equal(res.ok, false, `expected FAIL (${label})`);
  assert.ok(res.lines.some((l) => l.startsWith("FAIL") && l.includes(label)), `no FAIL line containing "${label}": ${res.lines.join(" | ")}`);
};

test("honest deployment matches (case-insensitive), with and without --kind", async () => {
  assert.equal((await run()).ok, true);
  const r = await run({ kind: "SettlementEscrow" });
  assert.equal(r.ok, true);
  assert.equal(r.kind, "SettlementEscrow");
});

test("missing or malformed --tx fails instead of skipping the creation check", async () => {
  await failsWith(run({ txHash: undefined }), "creation transaction given");
  await failsWith(run({ txHash: "0x1234" }), "creation transaction given");
});

test("RPC errors fail closed", async () => {
  for (const m of ["eth_chainId", "eth_getCode", "eth_getTransactionByHash", "eth_getTransactionReceipt"]) {
    const r = await run({}, honest(), { [m]: true });
    assert.equal(r.ok, false, m);
  }
});

test("empty or malformed answers fail closed", async () => {
  await failsWith(run({}, { ...honest(), code: null }), "code readable");
  await failsWith(run({}, { ...honest(), code: "0x" }), "address holds code");
  await failsWith(run({ txHash: "0x" + "b".repeat(64) }), "deployment transaction found");
  await failsWith(run({}, { ...honest(), receipt: null }), "deployment receipt found");
  await failsWith(run({}, { ...honest(), tx: { ...honest().tx, input: undefined } }), "creation input is valid hex");
  await failsWith(run({}, { ...honest(), receipt: { ...honest().receipt, blockNumber: null } }), "transaction is mined");
  await failsWith(run({}, { ...honest(), receipt: { ...honest().receipt, contractAddress: undefined } }), "created this address");
});

test("tampered runtime code fails", async () => {
  await failsWith(run({}, { ...honest(), code: "0x6080bb23" }), "runtime code");
  // A prefix of the build, or the build with extra bytes, is not a match.
  await failsWith(run({}, { ...honest(), code: "0x6080bb" }), "runtime code");
  await failsWith(run({}, { ...honest(), code: "0x6080bb2200" }), "runtime code");
});

test("wrong --kind fails even though another build matches", async () => {
  await failsWith(run({ kind: "CommitmentRegistry" }), "runtime code equals the CommitmentRegistry build");
  await failsWith(run({ kind: "Nope" }), "--kind is a known contract");
});

test("creation transaction tampering fails", async () => {
  const h = honest();
  await failsWith(run({}, { ...h, tx: { ...h.tx, input: "0x6080aa11" + "00".repeat(32) } }), "creation input equals");
  await failsWith(run({}, { ...h, tx: { ...h.tx, input: "0x6080aa" } }), "creation input equals");
  await failsWith(run({}, { ...h, tx: { ...h.tx, to: undefined } }), "contract creation");
  await failsWith(run({}, { ...h, tx: { ...h.tx, to: ADDR } }), "contract creation");
  await failsWith(run({}, { ...h, tx: { ...h.tx, hash: "0x" + "c".repeat(64) } }), "transaction hash matches");
  await failsWith(run({}, { ...h, receipt: { ...h.receipt, status: "0x0" } }), "transaction succeeded");
  await failsWith(run({}, { ...h, receipt: { ...h.receipt, contractAddress: "0x" + "2".repeat(40) } }), "created this address");
});

test("wrong chain fails", async () => {
  await failsWith(run({}, { ...honest(), chainId: "0x1" }), "chain id is 4663");
});

test("a build with immutables or a missing artifact is refused", async () => {
  await failsWith(run({ artifacts: { ...artifacts, SettlementEscrow: { ...ESC, immutables: 1 } } }), "has no immutables");
  await failsWith(run({ artifacts: { ...artifacts, SettlementEscrow: undefined } }), "build present");
});

test("address listed in the wrong config slot fails", async () => {
  await failsWith(run({ configAddresses: { REGISTRY: ADDR } }), "config slot REGISTRY");
  assert.equal((await run({ configAddresses: { ESCROW: ADDR.toUpperCase().replace("0X", "0x") } })).ok, true);
});
