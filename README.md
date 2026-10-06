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

Anyone can see that a deal exists and that it closed. Only the parties, or an auditor they hand one key to, can read it.

## How it works

1. The maker names one counterparty wallet and two legs (for example USDG against a tokenized stock) and signs the terms with
   `personal_sign`. Signing is free and sends no transaction.
2. The server burns a one-time nonce, recovers the signer, stores the record and puts only the commitment on the public tape.
3. The maker shares a private link containing the view key. Only the named counterparty can sign the acceptance.
4. Either side can recompute the commitment from the terms and salt and compare it with the tape.

Tokenized instruments (treasury bills, equities, fund shares, receivables) are recorded the same way, with a holder allowlist.

## What you can try

**Live now**

- Wallet connection (EIP-6963 browser wallets, mobile deep links; WalletConnect when configured), adds Robinhood Chain automatically.
- Live Robinhood Chain data: latest block, gas, ETH/USD, USDG supply.
- Live Chainlink prices for the official tokenized stocks on Robinhood Chain (AAPL, GOOGL, NVDA, TSLA).
- The practice desk at `/app`: private settlements between two wallets and practice issuances, with a public tape.

**Coming later**

- The `$DEPLOIER` contract address (published on `/token` and in the header at launch; the swap page turns on by itself).
- Audited settlement escrow (atomic delivery against payment), issuance contract with allowlists, on-chain commitment registry.

Practice mode moves no funds and sends no transactions.

## Run it locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run build
npm start            # http://localhost:4930
```

Other scripts: `npm run typecheck`, `npm run lint`, `npm test` (practice desk validation and commitment tests).

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

There are no contracts to deploy in this repository yet.

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
src/config/         brand.ts (name, links, contract address), stocks.ts, wallets.ts
src/lib/practice/   tickets (signed actions), desk (records, tape), commitments, tests
src/lib/            RPC relay rules, rate limits, Pons swap helpers, SEO helpers
public/             brand files and wallet logos
```

## Contracts and token

- `$DEPLOIER`: launched on Robinhood Chain through Pons. Contract address: published at launch in `src/config/brand.ts`.
- USDG `0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168`, WETH `0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73`.
- Settlement contracts: planned, not deployed, not audited.

## Security and status

- Early stage. The practice desk is off-chain and relies on the site's server to store records and serve the tape.
- Signed actions use one-time nonces burned atomically; the action applied is the one stored with the nonce.
- View keys are stored only as SHA-256 hashes on the server.
- The browser RPC relay allows read methods only, with a contract allowlist and bounded log ranges, and rate limits per network.
- Token transfers on Robinhood Chain are public. Hiding amounts on-chain needs a shielded design that is planned separately.

Please report security issues privately via a direct message to [@deploier](https://x.com/deploier).

## Contributing

Issues and pull requests are welcome. Download the ZIP or fork the repository, create a branch, run `npm run typecheck`,
`npm run lint` and `npm test`, and open a pull request with a short description of the change.

## License

MIT. See [LICENSE](LICENSE).
