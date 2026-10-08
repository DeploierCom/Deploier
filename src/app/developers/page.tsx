import { Braces, FileSearch, KeyRound, Network, PenLine, Radio, ScrollText, Send } from "lucide-react";
import { BRAND, CHAIN, USDG, explorerAddress } from "@/config/brand";
import { CONTRACTS } from "@/config/contracts";
import { Terminal } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Hero, SkyBand, Split } from "@/components/kit";
import { Defs } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/developers",
  title: "Developer Reference for Private Settlement | Deploier",
  description:
    "Deploier developer reference: settlement contracts with functions and events, the commitment rule, the signed-ticket flow and the tape and record endpoints.",
});

const CONTRACT_DOCS = [
  {
    key: "escrow" as const,
    what: "Delivery versus payment between two named wallets. Any ERC-20 or native ETH (token 0x0…0) on either leg; incoming amounts are measured by balance difference and must arrive in full.",
    fns: [
      "propose(taker, (token, amount) legA, (token, amount) legB, bytes32 commitment, uint64 expiry) payable → id: escrows leg A; expiry within 30 days",
      "accept(id) payable: named taker only, before expiry; pulls leg B and releases both legs, or reverts as a whole",
      "cancel(id): maker only, any time before acceptance; returns leg A",
      "refund(id): anyone, after expiry; returns leg A to the maker",
      "getSettlement(id), getSettlements(ids), idOf(maker, commitment), settlementCount(), isExpired(id)",
    ],
    events: ["Proposed(id, maker, taker, commitment, tokenA, amountA, tokenB, amountB, expiry)", "Settled(id, commitment)", "Cancelled(id, commitment)", "Refunded(id, commitment, caller)"],
  },
  {
    key: "registry" as const,
    what: "A public tape of commitments. Anyone records a bytes32; author and block are stored and readable by sequence number. Kind and status labels are self-declared and prove nothing: settlement and issuance status come only from the escrow and the tokens.",
    fns: ["record(bytes32 commitment) → seq", "recordWith(bytes32 commitment, uint8 kind, uint8 status) → seq", "getRecord(seq), latest(seq, limit), count()"],
    events: ["Recorded(author, commitment, kind, status, seq)"],
  },
  {
    key: "factory" as const,
    what: "Issues AllowlistTokens. The calling wallet becomes the issuer, receives the whole supply (whole units, 0 decimals) and alone manages the holder allowlist. A maturity stops transfers and opens redemption. The issuer cannot move anyone's units.",
    fns: [
      "issue(name, symbol, uint256 supply, address[] holders, uint64 maturity, bytes32 commitment) → token",
      "token: setAllowed(address[] accounts, bool allowed), issuer only",
      "token: redeem(amount) after maturity; isAllowed(account), issuer(), maturity(), commitment()",
      "tokenOf(issuer, commitment), isToken(token), latest(limit), tokenCount()",
    ],
    events: ["Issued(token, issuer, commitment, name, symbol, supply, maturity, holders)", "token: AllowlistUpdated(account, allowed), Redeemed(holder, amount)"],
  },
];

const TOOLS = [
  {
    icon: Send,
    title: "POST /api/practice/ticket",
    body: "Body: { address, action }. The server validates the action, writes the exact message to sign with a one-time nonce (5 minute expiry) and returns { nonce, message }.",
  },
  {
    icon: PenLine,
    title: "personal_sign",
    body: `The wallet signs the message. It names the domain, the action in plain words, the wallet, chain id ${CHAIN.id} and the nonce.`,
  },
  {
    icon: KeyRound,
    title: "POST /api/practice/redeem",
    body: "Body: { nonce, signature }. The nonce is burned atomically, the signer is recovered and must match, then the stored action runs. New records return their view key once.",
  },
  {
    icon: ScrollText,
    title: "GET /api/practice/tape",
    body: "The public tape: id, kind, commitment, status, time and block for the latest records. No parties, assets or amounts.",
  },
  {
    icon: FileSearch,
    title: "POST /api/practice/record",
    body: "Body: { id, key }. Returns the full private record when the view key matches. A wrong key and an unknown id give the same 404.",
  },
  {
    icon: ScrollText,
    title: "GET /api/tape",
    body: "The on-chain tape once contracts are deployed: commitment, status, block and time for the newest escrow settlements, issuances and registry records, read from contract storage.",
  },
  {
    icon: Radio,
    title: "GET /api/chain",
    body: "Latest block, block time, gas price, ETH/USD and the USDG token's symbol, decimals and supply.",
  },
  {
    icon: Braces,
    title: "GET /api/stocks",
    body: "Tokenized stocks on the chain with their Chainlink feed price and last update time.",
  },
  {
    icon: Network,
    title: "POST /api/rpc",
    body: "Read-only JSON-RPC relay for the browser: a short method allowlist, a contract allowlist for eth_call and a bounded eth_getLogs range.",
  },
];

export default function DevelopersPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Developers", path: "/developers" }])} />
      <Hero
        art={{ src: "/art/ribbon.svg", className: "top-[-30px] right-[-40px] h-[calc(100%+30px)] w-auto" }}
        title="The settlement primitive, documented"
        sub={`Everything the ${BRAND.name} practice desk does is available to read and call. Build against it now; the contract interface will follow the same shapes.`}
        after={<p className="t-body mt-[30px] max-w-[570px] text-white">Read how a commitment is formed, how a wallet signs an action, and which endpoints serve the public tape and the private records.</p>}
      >
        <Btn href="/app" small>
          Try it on the desk
        </Btn>
        <Btn href="/litepaper" small>
          Read the litepaper
        </Btn>
      </Hero>

      <Band>
        <div className="grid grid-cols-1 items-center gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0 lg:pr-[100px]">
            <h2 className="d-h5 font-medium text-black">Compute a commitment in a few lines</h2>
            <p className="mt-4 text-[14px] leading-[21px] text-black">
              The commitment is the only thing about a deal that becomes public. It is deterministic, so any party can recompute it.
            </p>
            <dl className="mt-5 space-y-4 text-[14px] leading-[21px] text-black">
              <div>
                <dt className="font-semibold">Canonical terms</dt>
                <dd>Keys sorted at every depth, lowercase addresses, amounts as decimal strings with at most six places.</dd>
              </div>
              <div>
                <dt className="font-semibold">Salt</dt>
                <dd>16 random bytes, hex encoded, kept with the private record and never published.</dd>
              </div>
              <div>
                <dt className="font-semibold">Hash</dt>
                <dd>keccak256 over the UTF-8 of canonical JSON, a pipe and the salt. Issuances use the same rule over their own fields.</dd>
              </div>
            </dl>
            <div className="mt-[30px]">
              <Btn href="/app" small>
                Run it on the desk
              </Btn>
            </div>
          </div>
          <Terminal
            title="commitment.ts"
            lines={[
              { t: "terms = { maker, taker, give: { asset, amount }," },
              { t: "          get: { asset, amount }, memo }" },
              { t: "salt  = randomBytes(16).hex()", tone: "dim" },
              { t: "" },
              { t: 'input = canonicalJSON(terms) + "|" + salt' },
              { t: 'commitment = "0x" + keccak256(utf8(input))' },
              { t: "" },
              { t: "verify(record, tapeEntry)", tone: "cmd" },
              { t: "✓ recomputed hash matches the public tape", tone: "ok" },
              { t: "✓ status settled at a Robinhood Chain block", tone: "ok" },
            ]}
          />
        </div>
      </Band>

      <section className="bg-black pb-[80px]">
        <div className="bg-board py-[60px] text-center">
          <div className="ctn">
            <h2 className="d-h2 text-white">Developer endpoints</h2>
            <p className="t-body mx-auto mt-3 max-w-[760px] text-white/90">
              Two calls per action, then reads. What the server applies is what the wallet signed, never what the browser sends afterwards.
              Public reads are rate limited per network and never cached.
            </p>
          </div>
        </div>
        <div className="ctn mt-[40px]">
          <ul className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
            {TOOLS.map((t) => (
              <li key={t.title} className="flex min-h-[280px] min-w-0 flex-col rounded-[16px] bg-board p-[24px] text-white">
                <span className="grid size-[38px] place-items-center rounded-full bg-white/10 text-accent">
                  <t.icon className="size-[18px]" />
                </span>
                <h3 className="mt-5 font-display text-[16px] leading-[22px] font-medium break-words">{t.title}</h3>
                <p className="mt-3 text-[13.5px] leading-[20px] text-white/85">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Band>
        <Split title="Settlement contracts">
          <p>
            Three contracts, Solidity 0.8.24, source and tests in the repository. None has an owner, an admin key, a pause switch, a fee or an
            upgrade path. All three are deployed on Robinhood Chain; practice mode stays available on the desk. Each deployed address can be
            checked byte for byte against the build with <span className="num">npm run verify-deployment -- &lt;address&gt; --tx &lt;creation tx&gt;</span>, and its
            verified source is on Blockscout.
          </p>
        </Split>
        <ul className="mt-[30px] grid grid-cols-1 gap-[15px] lg:grid-cols-3" data-testid="contracts-list">
          {CONTRACT_DOCS.map((c) => {
            const info = CONTRACTS[c.key];
            return (
              <li key={c.key} className="min-w-0 rounded-[16px] bg-card p-[24px]">
                <h3 className="font-display text-[20px] leading-[26px] text-black">{info.name}</h3>
                <p className="num mt-2 text-[13px] break-all">
                  {info.address ? (
                    <a href={`${explorerAddress(info.address)}?tab=contract`} target="_blank" rel="noreferrer" className="text-stamp underline">
                      {info.address}
                    </a>
                  ) : (
                    <span className="text-ink-3">Not deployed yet</span>
                  )}
                </p>
                <p className="mt-3 text-[14px] leading-[21px] text-ink-2">{c.what}</p>
                <p className="mt-4 text-[12px] font-semibold tracking-[0.05em] text-ink-3 uppercase">Functions</p>
                <ul className="mt-1 space-y-1.5">
                  {c.fns.map((f) => (
                    <li key={f} className="num text-[12.5px] leading-[18px] break-words text-black">
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[12px] font-semibold tracking-[0.05em] text-ink-3 uppercase">Events</p>
                <ul className="mt-1 space-y-1.5">
                  {c.events.map((e) => (
                    <li key={e} className="num text-[12.5px] leading-[18px] break-words text-black">
                      {e}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </Band>

      <Band className="!pt-0">
        <Split title="Chain values">
          <p>Constants the site and the contracts use.</p>
          <div className="pt-4">
            <Defs
              items={[
                ["Chain id", `${CHAIN.id} (${CHAIN.hex})`],
                ["RPC", <span key="r" className="num text-[13.5px] break-all">{CHAIN.publicRpc}</span>],
                ["Explorer", CHAIN.explorer],
                [`${USDG.symbol}`, <span key="u" className="num text-[13.5px] break-all">{`${USDG.address} · ${USDG.decimals} decimals`}</span>],
                ["Signing", "EIP-191 personal_sign, recovered with secp256k1"],
              ]}
            />
          </div>
        </Split>
      </Band>

      <SkyBand
        title="Building something on the layer?"
        action={
          <>
            <Btn href="/contact" tone="ink">
              Contact the team
            </Btn>
            <Btn href="/build" tone="ghost">
              Build patterns
            </Btn>
          </>
        }
      >
        <p>Share what you are building on the escrow, the registry or the issuance factory, and what your integration needs from the tape.</p>
      </SkyBand>
    </>
  );
}
