// Proves that a deployed address runs exactly this repository's contract code.
//   (cd contracts && ./setup.sh && forge build --force) && npm run verify-deployment -- <address> --tx <deployment tx hash> [--kind SettlementEscrow]
// Prints OK/FAIL per check and exits non-zero on any FAIL. See scripts/verify-lib.mjs for what is compared.
// RPC: DEPLOIER_RPC_URL from your shell, else the public Robinhood Chain endpoint.
import { readFileSync, existsSync } from "node:fs";
import { KINDS, verifyDeployment } from "./verify-lib.mjs";

const RPC = process.env.DEPLOIER_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";
const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const address = args.find((a) => /^0x[0-9a-fA-F]{40}$/.test(a));
const txHash = opt("--tx");
const kind = opt("--kind");

async function rpc(method, params) {
  const res = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  if (!body || typeof body !== "object" || !("result" in body || "error" in body)) throw new Error("malformed JSON-RPC answer");
  if (body.error) throw new Error(`${method}: ${body.error.message}`);
  return body.result;
}

const artifacts = {};
for (const name of KINDS) {
  const file = new URL(`../contracts/out/${name}.sol/${name}.json`, import.meta.url);
  if (!existsSync(file)) {
    console.log(`FAIL contracts/out/${name}.sol is missing. Run: cd contracts && ./setup.sh && forge build --force`);
    process.exit(1);
  }
  const a = JSON.parse(readFileSync(file, "utf8"));
  artifacts[name] = {
    creation: a.bytecode.object.toLowerCase(),
    runtime: a.deployedBytecode.object.toLowerCase(),
    immutables: Object.keys(a.deployedBytecode.immutableReferences ?? {}).length,
  };
}
const config = readFileSync(new URL("../src/config/contracts.ts", import.meta.url), "utf8");
const configAddresses = Object.fromEntries([...config.matchAll(/const (ESCROW|REGISTRY|FACTORY) = "(0x[0-9a-fA-F]{40})"/g)].map((m) => [m[1], m[2]]));

let result;
try {
  result = await verifyDeployment({ address, txHash, kind, artifacts, rpc, configAddresses });
} catch (e) {
  console.log(`FAIL unexpected error: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
}
for (const l of result.lines) console.log(l);
console.log(result.ok ? `MATCH: ${address} runs ${result.kind} from this build.` : "MISMATCH: do not trust this deployment.");
process.exit(result.ok ? 0 : 1);
