// Deploier contracts on Robinhood Chain: the one place their addresses live.
//
// While an address is empty, the matching part of the desk keeps running in
// practice mode (free signatures, nothing moves). After the owner deploys from
// /deploy, paste the address and block it prints below and push: the same
// screens then send real transactions through the connected wallet.
//
// The NEXT_PUBLIC_* variables are only a fallback for local test builds against
// a devnet or a fork. Leave them unset in production.

const ESCROW = "";
const ESCROW_BLOCK = 0;
const REGISTRY = "";
const REGISTRY_BLOCK = 0;
const FACTORY = "";
const FACTORY_BLOCK = 0;

const isAddr = (v: string) => /^0x[0-9a-fA-F]{40}$/.test(v);
const pick = (fixed: string, env: string | undefined) => (isAddr(fixed) ? fixed : env && isAddr(env) ? env : "");
const pickBlock = (fixed: number, env: string | undefined) => fixed || (env && /^\d+$/.test(env) ? Number(env) : 0);

export const CONTRACTS = {
  escrow: {
    name: "SettlementEscrow",
    address: pick(ESCROW, process.env.NEXT_PUBLIC_ESCROW_CONTRACT),
    block: pickBlock(ESCROW_BLOCK, process.env.NEXT_PUBLIC_ESCROW_BLOCK),
  },
  registry: {
    name: "CommitmentRegistry",
    address: pick(REGISTRY, process.env.NEXT_PUBLIC_REGISTRY_CONTRACT),
    block: pickBlock(REGISTRY_BLOCK, process.env.NEXT_PUBLIC_REGISTRY_BLOCK),
  },
  factory: {
    name: "AllowlistTokenFactory",
    address: pick(FACTORY, process.env.NEXT_PUBLIC_FACTORY_CONTRACT),
    block: pickBlock(FACTORY_BLOCK, process.env.NEXT_PUBLIC_FACTORY_BLOCK),
  },
} as const;

export type ContractKey = keyof typeof CONTRACTS;

export const escrowLive = () => CONTRACTS.escrow.address !== "";
export const registryLive = () => CONTRACTS.registry.address !== "";
export const factoryLive = () => CONTRACTS.factory.address !== "";
export const anyLive = () => escrowLive() || registryLive() || factoryLive();

/** Escrow status codes, in Solidity order. "expired" is derived: open but past its expiry. */
export const ESCROW_STATUS = ["none", "proposed", "settled", "cancelled", "refunded"] as const;
export type EscrowStatus = (typeof ESCROW_STATUS)[number] | "expired";

/** Registry labels used by the site (the contract accepts any uint8). */
export const REGISTRY_KIND = { settlement: 1, issuance: 2 } as const;
export const REGISTRY_STATUS = { proposed: 1, settled: 2, cancelled: 3, expired: 4, recorded: 5 } as const;

/** Longest proposal the escrow accepts, and the default the desk uses. */
export const ESCROW_MAX_TERM_S = 30 * 24 * 60 * 60;
export const ESCROW_DEFAULT_TERM_S = 24 * 60 * 60;
