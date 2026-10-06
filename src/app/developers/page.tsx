import { Braces, FileSearch, KeyRound, Network, PenLine, Radio, ScrollText, Send } from "lucide-react";
import { BRAND, CHAIN, USDG } from "@/config/brand";
import { Terminal } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Hero, SkyBand, Split } from "@/components/kit";
import { Defs } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/developers",
  title: "Developer Reference for Private Settlement | Deploier",
  description:
    "Deploier developer reference: the commitment rule, the signed-ticket flow, the public tape and record endpoints, and the Robinhood Chain values to build on.",
});

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
        <Split title="Chain values">
          <p>Constants the site and the planned contracts use.</p>
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
        <p>Share what you are building and what the contract interface needs to support. Early input shapes the escrow and issuance contracts.</p>
      </SkyBand>
    </>
  );
}
