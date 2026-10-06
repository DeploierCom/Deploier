// Checks behind scripts/verify-deployment.mjs, kept free of I/O so they can be tested with a fake chain.
//
// Every check fails closed: a missing transaction, an RPC error, an empty or malformed answer is a FAIL,
// never a skip. Comparisons are exact on normalised (lowercase hex) values, never prefix or substring.
//
// None of the three Deploier contracts has constructor arguments, immutables or references to other
// contracts, so there is nothing to decode, nothing to copy from the chain and nothing to verify
// recursively: the runtime code at the address must equal the clean build byte for byte, and the creation
// transaction's input must equal the build's creation code exactly. A build that gains immutables is refused.

export const KINDS = ["SettlementEscrow", "CommitmentRegistry", "AllowlistTokenFactory"];
export const CHAIN_ID = 4663;
const SLOT_KIND = { ESCROW: "SettlementEscrow", REGISTRY: "CommitmentRegistry", FACTORY: "AllowlistTokenFactory" };

const isHex = (v) => typeof v === "string" && /^0x([0-9a-fA-F]{2})*$/.test(v);
const isAddr = (v) => typeof v === "string" && /^0x[0-9a-fA-F]{40}$/.test(v);
const isHash = (v) => typeof v === "string" && /^0x[0-9a-fA-F]{64}$/.test(v);
const norm = (v) => v.toLowerCase();

/**
 * address: deployed contract. txHash: its creation transaction (required). kind: optional expected contract.
 * artifacts: { name: { creation, runtime, immutables } }. rpc(method, params) -> result (may throw).
 * configAddresses: { ESCROW?, REGISTRY?, FACTORY? } from src/config/contracts.ts.
 */
export async function verifyDeployment({ address, txHash, kind, artifacts, rpc, configAddresses = {} }) {
  const lines = [];
  let failed = false;
  const field = (label, ok, detail = "") => {
    lines.push(`${ok ? "OK  " : "FAIL"} ${label}${detail ? `: ${detail}` : ""}`);
    if (!ok) failed = true;
    return ok;
  };
  const done = (k = null) => ({ ok: !failed, lines, kind: failed ? null : k });
  const ask = async (label, method, params) => {
    try {
      return await rpc(method, params);
    } catch (e) {
      field(label, false, `RPC error: ${e instanceof Error ? e.message : String(e)}`);
      return undefined;
    }
  };

  // Inputs.
  if (!field("address format", isAddr(address), String(address))) return done();
  if (!field("creation transaction given (--tx)", isHash(txHash), String(txHash))) return done();
  if (kind !== undefined && !field("--kind is a known contract", KINDS.includes(kind), String(kind))) return done();
  const candidates = kind ? [kind] : KINDS;
  for (const name of candidates) {
    const a = artifacts?.[name];
    const okArtifact = a && isHex(a.creation) && isHex(a.runtime) && a.creation.length > 2 && a.runtime.length > 2;
    field(`${name} build present`, Boolean(okArtifact));
    field(`${name} has no immutables`, Boolean(a) && a.immutables === 0, a ? `${a.immutables} immutable reference(s)` : "artifact missing");
  }
  if (failed) return done();

  // Chain.
  const idHex = await ask("chain id readable", "eth_chainId", []);
  if (!field("chain id readable", isHex(idHex) || /^0x[0-9a-fA-F]+$/.test(String(idHex)), String(idHex))) return done();
  field(`chain id is ${CHAIN_ID}`, Number(BigInt(idHex)) === CHAIN_ID, String(Number(BigInt(idHex))));

  // Runtime code: exact equality with one build (or the --kind build), never by length or pattern.
  const code = await ask("code readable", "eth_getCode", [address, "latest"]);
  if (!field("code readable", isHex(code), typeof code === "string" ? `${code.slice(0, 12)}…` : String(code))) return done();
  if (!field("address holds code", code.length > 2, `${(code.length - 2) / 2} bytes`)) return done();
  const runtimeMatches = candidates.filter((n) => norm(artifacts[n].runtime) === norm(code));
  const match = runtimeMatches.length === 1 ? runtimeMatches[0] : null;
  field(kind ? `runtime code equals the ${kind} build` : "runtime code equals exactly one build", match !== null, match ?? "no exact match");

  // Creation transaction: must exist, be mined, succeed, create this address, and carry exactly the creation code.
  const tx = await ask("deployment transaction readable", "eth_getTransactionByHash", [txHash]);
  const receipt = await ask("deployment receipt readable", "eth_getTransactionReceipt", [txHash]);
  if (!field("deployment transaction found", tx !== null && typeof tx === "object")) return done();
  if (!field("deployment receipt found", receipt !== null && typeof receipt === "object")) return done();
  field("transaction hash matches", isHash(tx.hash) && norm(tx.hash) === norm(txHash), String(tx.hash));
  field("transaction is a contract creation (to = null)", tx.to === null, String(tx.to));
  field("transaction is mined", isHex(receipt.blockNumber) || /^0x[0-9a-fA-F]+$/.test(String(receipt.blockNumber)), String(receipt.blockNumber));
  field("transaction succeeded", receipt.status === "0x1", String(receipt.status));
  field(
    "transaction created this address",
    isAddr(receipt.contractAddress) && norm(receipt.contractAddress) === norm(address),
    String(receipt.contractAddress),
  );
  field("creation input is valid hex", isHex(tx.input), typeof tx.input === "string" ? `${(tx.input.length - 2) / 2} bytes` : String(tx.input));
  field(
    "creation input equals the build's creation code exactly (no constructor data)",
    match !== null && isHex(tx.input) && norm(tx.input) === norm(artifacts[match].creation),
  );

  // Config slot, when the site already lists the address: it must be the right kind.
  const listed = Object.entries(configAddresses).filter(([, v]) => isAddr(v) && norm(v) === norm(address));
  if (listed.length === 0) lines.push("INFO src/config/contracts.ts does not list this address yet");
  for (const [slot] of listed) field(`config slot ${slot} holds a ${SLOT_KIND[slot]}`, SLOT_KIND[slot] === match, String(match));

  return done(match);
}
