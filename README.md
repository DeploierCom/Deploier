# Deploier — Enterprise privacy settlement for regulated markets. Real-time settlement. Institutional trust.

Website: https://deploier.com · X: [@deploier](https://x.com/deploier) · Token: `$DEPLOIER` on Robinhood Chain

## The problem

Public ledgers settle fast and can be verified by anyone, but they also publish every balance, counterparty and trade. A fund
that rebalances on a transparent chain announces its intent before the trade is done, and a payment company exposes its client
list. Permissioned ledgers hide that data, but then nobody outside the consortium can check the rules, and every member depends
on one operator.

## The solution

Deploier is a privacy settlement layer on Robinhood Chain (it is a token and an application, not a separate blockchain). Each
settlement is split in two:

- a **private record** with the parties, assets, amounts and memo, opened only with that record's view key;
- a **public commitment**: `keccak256(canonical terms | salt)`, its status and the Robinhood Chain block it was stamped at.

Anyone can see that a deal exists and that it closed. Only the parties, or a reviewer they hand one key to, can read the terms.

## How it works

1. The maker names one counterparty wallet and two legs (for example USDG against a tokenized stock) and signs the terms with
   `personal_sign`. Signing is free. The server burns a one-time nonce, recovers the signer, stores the private terms with a
   fresh salt and returns the commitment.
2. With the contracts deployed, the maker's wallet then sends `propose` to **SettlementEscrow**: leg A is locked in the
   escrow together with the commitment, the counterparty and an expiry. (In practice mode nothing is sent; the server keeps
   the status instead.)
3. The maker shares a private link containing the view key. The counterparty opens the terms, the site checks that the
   contract holds exactly those parties, assets, amounts and commitment, and the counterparty sends `accept`: leg B goes to
   the maker and leg A to the counterparty in the same transaction, or nothing moves at all.
4. Before acceptance the maker can `cancel`; after the expiry anyone can `refund` leg A to the maker.
5. Either side can recompute the commitment from the terms and salt and compare it with the chain.

Tokenized instruments go through **AllowlistTokenFactory**: the issuing wallet receives the whole supply and alone manages the
holder allowlist; a maturity date stops transfers and opens redemption. Any commitment can also be stamped in
**CommitmentRegistry**, so the public tape is the chain itself.

What stays private and what does not: the terms behind each commitment (memo, the full agreement) stay with the parties. The
token legs themselves (which tokens, how much, between which wallets) are public on Robinhood Chain like every ERC-20 transfer.

## What you can try

**Live now**

- Wallet connection (EIP-6963 browser wallets, mobile deep links; WalletConnect when configured), adds Robinhood Chain automatically.
- Live Robinhood Chain data: latest block, gas, ETH/USD, USDG supply.
- Live Chainlink prices for the official tokenized stocks on Robinhood Chain (AAPL, GOOGL, NVDA, TSLA).
- The desk at `/app`: private settlements between two wallets and issuances, with a public tape. Practice mode (free
  signatures, nothing moves) until the contracts are deployed; then real transactions, with practice mode still one click away.

**Coming later**

- Contract addresses for SettlementEscrow, CommitmentRegistry and AllowlistTokenFactory (written and tested in `contracts/`;
  they appear in `src/config/contracts.ts` and on `/developers` once deployed).
- The `$DEPLOIER` contract address (published on `/token` and in the header at launch; the swap page turns on by itself).
  The settlement contracts do not depend on it.

## Run it locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run build
npm start            # http://localhost:4930
```

Other scripts: `npm run typecheck`, `npm run lint`, `npm test` (desk validation, commitments and contract calldata).

Without any configuration the site runs on public endpoints, and the practice desk keeps its data in `.practice-data.json`
in the project folder. Every environment variable is optional. Put them in `.env.local` for a local run, or in your host's
project settings (on Vercel: Project → Settings → Environment Variables). `.env.example` lists the names with empty values.

| Variable | Purpose |
|---|---|
| `ROBINHOOD_RPC_URL` | Private RPC for server reads (for example an Alchemy Robinhood Chain URL). Empty = public RPC. |
| `NEXT_PUBLIC_ROBINHOOD_RPC_URL` | RPC for browser reads. Empty = public RPC. |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Project id from cloud.reown.com. Empty = WalletConnect shows "Not configured". |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`, or `KV_REDIS_URL` / `REDIS_URL` | Storage for the practice desk in production. Without it on a serverless host the desk shows "not configured". |
| `STORE_KEY_PREFIX` | Key prefix when several projects share one Redis. |
| `TRUST_PROXY_HEADERS`, `TRUSTED_PROXY_HOPS`, `CLIENT_IP_HEADER` | Rate-limit client IP handling when self-hosting behind a proxy. |

### Contracts

Foundry project in `contracts/` (Solidity 0.8.24, OpenZeppelin Contracts 5.1.0, optimizer 200 runs, via-ir, EVM paris,
no metadata hash). Install Foundry from getfoundry.sh, then:

```bash
cd contracts
./setup.sh                 # fetches forge-std and OpenZeppelin into contracts/lib (not committed)
forge build --force        # always a clean build: incremental via-ir builds can emit different bytes
forge test                 # unit, fuzz and invariant tests
FORK_URL=https://rpc.mainnet.chain.robinhood.com forge test --match-path test/Deploier.fork.t.sol --evm-version cancun
```

The fork tests run the contracts against the real USDG, WETH and stock tokens on Robinhood Chain, including a stock leg the
issuer blocks (the whole settlement reverts and leg A is refunded).

`npm run contracts:bytecode` copies the creation code into `src/lib/onchain/bytecode.ts` for the deploy page.

### Deploying

None of the three contracts takes constructor arguments or has an owner. Open `/deploy` (not linked, not indexed), connect the
deploying wallet on Robinhood Chain and deploy each contract (about 1.07M, 0.41M and 1.63M gas). The page prints the lines to
paste into `src/config/contracts.ts`; each address switches its part of the desk to real transactions on the next build.

### Verifying a deployment

```bash
cd contracts && ./setup.sh && forge build --force && cd ..
npm run verify-deployment -- <address> --tx <deployment transaction hash> [--kind SettlementEscrow]
```

The script prints OK or FAIL per check and exits non-zero on any FAIL. It compares the code at the address with this
repository's clean build byte for byte, and requires the creation transaction: mined, successful, creating that address, with
an input equal to the creation code and nothing appended. An unreachable RPC or a missing answer is a FAIL, never a skip. `DEPLOIER_RPC_URL` in your shell overrides the public RPC. For source verification on Blockscout
(robinhoodchain.blockscout.com → the contract → Code → Verify & publish): choose Solidity (Standard JSON input), compiler
v0.8.24, and upload the standard JSON input produced by
`forge verify-contract --show-standard-json-input <address> src/SettlementEscrow.sol:SettlementEscrow > escrow.json`
(same for the other two).

No keeper or relayer is needed: refunds after expiry can be sent by anyone, from the desk or the explorer.

## Network in your wallet

| Field | Value |
|---|---|
| Network name | Robinhood Chain |
| Chain id | 4663 (0x1237) |
| RPC | https://rpc.mainnet.chain.robinhood.com |
| Currency | ETH |
| Explorer | https://robinhoodchain.blockscout.com |

## Project layout

```
src/app/            pages (Next.js App Router), API routes under src/app/api
src/components/     site UI, wallet dialog and menu, practice desk, live data
src/config/         brand.ts (name, links, token address), contracts.ts (contract addresses), stocks.ts, wallets.ts
src/lib/practice/   tickets (signed actions), desk (records, tape), commitments, tests
src/lib/onchain/    calldata and decoding, browser transactions, on-chain tape, deploy bytecode
src/lib/            RPC relay rules, rate limits, Pons swap helpers, SEO helpers
contracts/          SettlementEscrow, CommitmentRegistry, AllowlistToken(+Factory), Foundry tests
scripts/            contracts-bytecode.mjs, verify-deployment.mjs
public/             brand files and wallet logos
```

## Contracts and token

- `$DEPLOIER`: launched on Robinhood Chain through Pons. Contract address: published at launch in `src/config/brand.ts`.
- USDG `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, WETH `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`.
- SettlementEscrow, CommitmentRegistry, AllowlistTokenFactory: source in `contracts/src`, addresses in
  `src/config/contracts.ts` (empty until deployed). No owner, admin key, pause, fee, deposit limit or upgrade path.

## Security and status

- Early stage. Practice mode is off-chain and relies on the site's server to store records and serve the tape. With the
  contracts deployed, status and commitments come from the chain; the server only keeps private terms, locked by view key.
- The contracts cannot be upgraded or paused, so a bug cannot be patched after deployment. Stock tokens on Robinhood Chain can
  be paused or blocked by their issuer; a settlement then reverts as a whole and leg A stays refundable.
- Signed actions use one-time nonces burned atomically; the action applied is the one stored with the nonce.
- View keys are stored only as SHA-256 hashes on the server.
- The browser RPC relay allows read methods only, with a contract allowlist and bounded log ranges, and rate limits per network.
- Token transfers on Robinhood Chain are public, amounts included. Hiding amounts on-chain needs a shielded design, which is a separate project.

Please report security issues privately via a direct message to [@deploier](https://x.com/deploier).

## Contributing

Issues and pull requests are welcome. Download the ZIP or fork the repository, create a branch, run `npm run typecheck`,
`npm run lint` and `npm test`, and open a pull request with a short description of the change.

## License

MIT. See [LICENSE](LICENSE).
