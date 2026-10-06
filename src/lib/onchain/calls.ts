import { keccak_256 } from "@noble/hashes/sha3.js";
import { address as addrWord, bytes, dynamic, encode, fixed, readAddress, readWord, word } from "@/lib/abi";
import { ESCROW_STATUS, type EscrowStatus } from "@/config/contracts";

/*
 * Calldata and result decoding for the Deploier contracts, without a library.
 * Shared by the browser (transactions, record cards) and the server (tape).
 * Selectors are keccak256 of the signatures, computed once.
 */

const enc = new TextEncoder();
const hex = (b: Uint8Array) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
export const selector = (signature: string) => hex(keccak_256(enc.encode(signature))).slice(0, 8);

const S = {
  propose: selector("propose(address,(address,uint256),(address,uint256),bytes32,uint64)"),
  accept: selector("accept(uint256)"),
  cancel: selector("cancel(uint256)"),
  refund: selector("refund(uint256)"),
  getSettlements: selector("getSettlements(uint256[])"),
  settlementCount: selector("settlementCount()"),
  idOf: selector("idOf(address,bytes32)"),
  recordWith: selector("recordWith(bytes32,uint8,uint8)"),
  registryLatest: selector("latest(uint256,uint256)"),
  registryCount: selector("count()"),
  issue: selector("issue(string,string,uint256,address[],uint64,bytes32)"),
  factoryLatest: selector("latest(uint256)"),
  tokenOf: selector("tokenOf(address,bytes32)"),
  issuer: selector("issuer()"),
  maturity: selector("maturity()"),
  tokenCommitment: selector("commitment()"),
  name: selector("name()"),
  symbol: selector("symbol()"),
  isToken: selector("isToken(address)"),
  setAllowed: selector("setAllowed(address[],bool)"),
  isAllowed: selector("isAllowed(address)"),
  approve: selector("approve(address,uint256)"),
  allowance: selector("allowance(address,address)"),
  balanceOf: selector("balanceOf(address)"),
  totalSupply: selector("totalSupply()"),
} as const;

const b32 = (h: string) => h.replace(/^0x/, "").toLowerCase().padStart(64, "0");
const utf8 = (s: string) => hex(enc.encode(s));
const uintArray = (values: bigint[]) => word(values.length) + values.map((v) => word(v)).join("");
const addressArray = (values: string[]) => word(values.length) + values.map(addrWord).join("");

// ------------------------------------------------------------------ escrow

export type LegUnits = { token: string; amount: bigint };

export const encodePropose = (taker: string, a: LegUnits, b: LegUnits, commitment: string, expiry: number) =>
  `0x${S.propose}${addrWord(taker)}${addrWord(a.token)}${word(a.amount)}${addrWord(b.token)}${word(b.amount)}${b32(commitment)}${word(expiry)}`;
export const encodeAccept = (id: bigint) => `0x${S.accept}${word(id)}`;
export const encodeCancel = (id: bigint) => `0x${S.cancel}${word(id)}`;
export const encodeRefund = (id: bigint) => `0x${S.refund}${word(id)}`;
export const encodeSettlementCount = () => `0x${S.settlementCount}`;
export const encodeIdOf = (maker: string, commitment: string) => `0x${S.idOf}${addrWord(maker)}${b32(commitment)}`;
export const encodeGetSettlements = (ids: bigint[]) => `0x${S.getSettlements}${word(32)}${uintArray(ids)}`;

export type ChainSettlement = {
  id: bigint;
  maker: string;
  expiry: number;
  status: EscrowStatus;
  taker: string;
  openedBlock: number;
  tokenA: string;
  closedBlock: number;
  tokenB: string;
  amountA: bigint;
  amountB: bigint;
  commitment: string;
};

/** Settlement[] from getSettlements: offset, length, then 11 words per struct. `now` turns open-but-past-expiry into "expired". */
export function decodeSettlements(result: string, ids: bigint[], now: number): ChainSettlement[] {
  const n = Number(readWord(result, 1));
  return Array.from({ length: n }, (_, i) => {
    const b = 2 + i * 11;
    const raw = ESCROW_STATUS[Number(readWord(result, b + 2))] ?? "none";
    const expiry = Number(readWord(result, b + 1));
    return {
      id: ids[i],
      maker: readAddress(result, b),
      expiry,
      status: raw === "proposed" && now >= expiry ? "expired" : raw,
      taker: readAddress(result, b + 3),
      openedBlock: Number(readWord(result, b + 4)),
      tokenA: readAddress(result, b + 5),
      closedBlock: Number(readWord(result, b + 6)),
      tokenB: readAddress(result, b + 7),
      amountA: readWord(result, b + 8),
      amountB: readWord(result, b + 9),
      commitment: `0x${readWord(result, b + 10).toString(16).padStart(64, "0")}`,
    };
  });
}

// ------------------------------------------------------------------ registry

export const encodeRecordWith = (commitment: string, kind: number, status: number) => `0x${S.recordWith}${b32(commitment)}${word(kind)}${word(status)}`;
export const encodeRegistryLatest = (limit: number) => `0x${S.registryLatest}${word(0)}${word(limit)}`;

export type ChainRecord = { seq: number; author: string; kind: number; status: number; block: number; commitment: string };

/** (Record[] out, uint256[] seqs): two offsets, then the struct array (5 words each) and the seq array. */
export function decodeRegistryLatest(result: string): ChainRecord[] {
  const recOff = Number(readWord(result, 0)) / 32;
  const seqOff = Number(readWord(result, 1)) / 32;
  const n = Number(readWord(result, recOff));
  return Array.from({ length: n }, (_, i) => {
    const b = recOff + 1 + i * 5;
    return {
      seq: Number(readWord(result, seqOff + 1 + i)),
      author: readAddress(result, b),
      kind: Number(readWord(result, b + 1)),
      status: Number(readWord(result, b + 2)),
      block: Number(readWord(result, b + 3)),
      commitment: `0x${readWord(result, b + 4).toString(16).padStart(64, "0")}`,
    };
  });
}

// ------------------------------------------------------------------ issuance

export function encodeIssue(name: string, symbol: string, supply: bigint, holders: string[], maturity: number, commitment: string) {
  return `0x${S.issue}${encode([
    dynamic(bytes(utf8(name))),
    dynamic(bytes(utf8(symbol))),
    fixed(word(supply)),
    dynamic(addressArray(holders)),
    fixed(word(maturity)),
    fixed(b32(commitment)),
  ])}`;
}
export const encodeFactoryLatest = (limit: number) => `0x${S.factoryLatest}${word(limit)}`;
export const encodeTokenOf = (issuer: string, commitment: string) => `0x${S.tokenOf}${addrWord(issuer)}${b32(commitment)}`;
export const encodeTokenIssuer = () => `0x${S.issuer}`;
export const encodeTokenMaturity = () => `0x${S.maturity}`;
export const encodeTokenCommitment = () => `0x${S.tokenCommitment}`;
export const encodeName = () => `0x${S.name}`;
export const encodeSymbol = () => `0x${S.symbol}`;

/** An ABI-encoded `string` return value. */
export function decodeString(result: string): string {
  const data = result.replace(/^0x/, "");
  const off = Number(readWord(result, 0)) / 32;
  const len = Number(readWord(result, off));
  const hexStr = data.slice((off + 1) * 64, (off + 1) * 64 + len * 2);
  return new TextDecoder().decode(Uint8Array.from(hexStr.match(/../g) ?? [], (h) => parseInt(h, 16)));
}
export const encodeIsToken = (token: string) => `0x${S.isToken}${addrWord(token)}`;
export const encodeSetAllowed = (accounts: string[], allowed: boolean) => `0x${S.setAllowed}${word(64)}${word(allowed)}${addressArray(accounts)}`;
export const encodeIsAllowed = (account: string) => `0x${S.isAllowed}${addrWord(account)}`;

export type ChainIssuance = { token: string; issuer: string; block: number; commitment: string };

/** Issuance[] from latest(): offset, length, then 4 words per struct. */
export function decodeFactoryLatest(result: string): ChainIssuance[] {
  const n = Number(readWord(result, 1));
  return Array.from({ length: n }, (_, i) => {
    const b = 2 + i * 4;
    return {
      token: readAddress(result, b),
      issuer: readAddress(result, b + 1),
      block: Number(readWord(result, b + 2)),
      commitment: `0x${readWord(result, b + 3).toString(16).padStart(64, "0")}`,
    };
  });
}

// ------------------------------------------------------------------ ERC-20

export const encodeApprove = (spender: string, amount: bigint) => `0x${S.approve}${addrWord(spender)}${word(amount)}`;
export const encodeAllowance = (owner: string, spender: string) => `0x${S.allowance}${addrWord(owner)}${addrWord(spender)}`;
export const encodeBalanceOf = (owner: string) => `0x${S.balanceOf}${addrWord(owner)}`;
export const encodeTotalSupply = () => `0x${S.totalSupply}`;

// ------------------------------------------------------------------ events

export const TOPIC = {
  proposed: `0x${hex(keccak_256(enc.encode("Proposed(uint256,address,address,bytes32,address,uint256,address,uint256,uint64)")))}`,
  issued: `0x${hex(keccak_256(enc.encode("Issued(address,address,bytes32,string,string,uint256,uint64,uint256)")))}`,
} as const;

/** Readable reasons for the contracts' custom errors (first 4 bytes of the revert data). */
export const REVERT_REASONS: Record<string, string> = Object.fromEntries(
  (
    [
      ["InvalidTaker()", "The counterparty must be another wallet."],
      ["ZeroAmount()", "Both legs need an amount above zero."],
      ["SameAsset()", "The two legs must be different assets."],
      ["NotAContract(address)", "One of the assets is not a token contract."],
      ["BadExpiry()", "The expiry must be in the future and at most 30 days away."],
      ["EmptyCommitment()", "The commitment is missing."],
      ["CommitmentUsed()", "This commitment is already on chain."],
      ["WrongValue()", "The ETH sent does not match the ETH leg."],
      ["AmountMismatch(address,uint256,uint256)", "A token delivered less than the agreed amount (fee-on-transfer tokens are refused)."],
      ["NotOpen()", "This settlement is no longer open."],
      ["NotTaker()", "Only the named counterparty can accept."],
      ["NotMaker()", "Only the wallet that proposed it can cancel."],
      ["Expired()", "This proposal has expired. Anyone can now return leg A to the maker."],
      ["NotExpired()", "The proposal has not expired yet."],
      ["EthTransferFailed()", "A wallet refused the ETH payout, so nothing moved."],
      ["ReentrancyGuardReentrantCall()", "A token tried to call back into the escrow, so nothing moved."],
      ["SafeERC20FailedOperation(address)", "A token transfer failed (paused, blocked or not approved), so nothing moved."],
      ["BadName()", "The name takes 1 to 64 bytes."],
      ["BadSymbol()", "The symbol takes 1 to 16 bytes."],
      ["ZeroSupply()", "Units must be above zero."],
      ["TooManyHolders()", "At most 100 holders at issue time."],
      ["BadMaturity()", "Maturity must be in the future."],
      ["NotIssuer()", "Only the issuer manages the allowlist."],
      ["NotAllowed(address)", "That wallet is not on the allowlist."],
      ["IssuerStaysAllowed()", "The issuer always stays on the allowlist."],
      ["ERC20InsufficientAllowance(address,uint256,uint256)", "The token allowance is too low. Approve first."],
      ["ERC20InsufficientBalance(address,uint256,uint256)", "Your wallet does not hold enough of this token."],
    ] as const
  ).map(([sig, text]) => [`0x${selector(sig)}`, text]),
);
