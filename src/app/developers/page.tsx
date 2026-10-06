import Link from "next/link";
import { BRAND, CHAIN, USDG } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { CtaBand, Defs, PageHead, Rows, Section } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/developers",
  title: "Developer Reference for Private Settlement | Deploier",
  description:
    "Deploier developer reference: the commitment rule, the signed-ticket flow, the public tape and record endpoints, and the Robinhood Chain values to build on.",
});

const code = "block overflow-x-auto border border-ink bg-ink p-4 font-mono text-[13px] leading-relaxed text-paper";

export default function DevelopersPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Developers", path: "/developers" }])} />
      <PageHead
        kicker="Developers"
        title={
          <>
            The settlement primitive, <em>documented.</em>
          </>
        }
        lede={`Everything the ${BRAND.name} practice desk does is available to read and call: how a commitment is formed, how a wallet signs an action, and the endpoints that serve the public tape and private records. Build against it now; the contract interface will follow the same shapes.`}
      >
        <Link href="/app" className="btn btn-accent">
          Try it on the desk <span className="arr">→</span>
        </Link>
      </PageHead>

      <Section index="01" title="The commitment rule" lede="The only thing about a deal that becomes public. Deterministic, so any party can recompute it.">
        <pre className={code}>
          <code>{`terms = { maker, taker, give: { asset, amount }, get: { asset, amount }, memo }
salt  = 16 random bytes, hex
input = canonicalJSON(terms) + "|" + salt     // keys sorted at every depth
commitment = "0x" + keccak256(utf8(input))`}</code>
        </pre>
        <p className="mt-5 max-w-[760px] text-[15.5px] text-ink-2">
          Addresses are lowercase, amounts are decimal strings with at most six places and no trailing zeros. Issuances use the same rule
          over issuer, asset class, name, symbol, units, face value, holder list and maturity.
        </p>
      </Section>

      <Section index="02" night title="The signed-ticket flow" lede="Two calls per action. What the server applies is what the wallet signed, never what the browser sends afterwards.">
        <Rows
          items={[
            {
              title: "POST /api/practice/ticket",
              body: "Body: { address, action }. The server validates the action, writes the exact message to sign with a one-time nonce (5 minute expiry) and returns { nonce, message }.",
            },
            {
              title: "personal_sign",
              body: `The wallet signs the message. It names the domain, the action in plain words, the wallet, chain id ${CHAIN.id} and the nonce.`,
            },
            {
              title: "POST /api/practice/redeem",
              body: "Body: { nonce, signature }. The nonce is burned atomically, the signer is recovered and must match, then the stored action runs. Returns the record id, status, commitment and, for new records, the view key.",
            },
          ]}
        />
      </Section>

      <Section index="03" title="Reading endpoints" lede="Public reads are rate limited per network. Responses are JSON and never cached.">
        <Defs
          items={[
            ["GET /api/practice/tape", "The public tape: id, kind, commitment, status, time and block for the latest records. No parties, assets or amounts."],
            ["POST /api/practice/record", "Body: { id, key }. Returns the full private record when the view key matches. A wrong key and an unknown id give the same 404."],
            ["GET /api/chain", "Latest block, block time, gas price, ETH/USD and the USDG token's symbol, decimals and supply."],
            ["GET /api/stocks", "Tokenized stocks with their Chainlink feed price and last update."],
            ["POST /api/rpc", "Read-only JSON-RPC relay for the browser: a short method allowlist, contract allowlist for eth_call, and a bounded eth_getLogs range."],
          ]}
        />
      </Section>

      <Section index="04" night title="Chain values" lede="Constants the site and the planned contracts use.">
        <Defs
          items={[
            ["Chain id", `${CHAIN.id} (${CHAIN.hex})`],
            ["RPC", CHAIN.publicRpc],
            ["Explorer", CHAIN.explorer],
            [`${USDG.symbol}`, `${USDG.address} · ${USDG.decimals} decimals`],
            ["Signing", "EIP-191 personal_sign, recovered with secp256k1"],
          ]}
        />
      </Section>

      <CtaBand title="Building something on the layer?" body="Share what you are building and what the contract interface needs to support.">
        <Link href="/contact" className="btn btn-accent">
          Contact the team <span className="arr">→</span>
        </Link>
        <Link href="/build" className="btn btn-ghost">
          Build patterns
        </Link>
      </CtaBand>
    </>
  );
}
