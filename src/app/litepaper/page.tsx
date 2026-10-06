import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { PageHead } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/litepaper",
  title: "Deploier Litepaper: Private Settlement Design | Deploier",
  description:
    "The Deploier litepaper: a two-layer design for private settlement on Robinhood Chain, with commitments, view keys, signed intent, the contract plan and risks.",
  type: "article",
});

const SECTIONS: { id: string; title: string; body: React.ReactNode }[] = [
  {
    id: "abstract",
    title: "1. Abstract",
    body: (
      <>
        <p>
          {BRAND.name} is a {BRAND.category} on {CHAIN.name}. It separates each settlement into a private record held by the parties
          and a public commitment that anyone can verify. The goal is settlement that is final and auditable like a public ledger, and
          confidential like a bilateral agreement.
        </p>
        <p>
          This paper describes the design as it runs today in practice mode, the contracts planned to make it move real assets, and the
          risks that remain. It makes no claim that any institution uses {BRAND.name} or that its contracts are audited; they are not
          deployed yet.
        </p>
      </>
    ),
  },
  {
    id: "problem",
    title: "2. The problem",
    body: (
      <>
        <p>
          A transparent ledger exposes balances, counterparties and timing. For a fund, a broker or a payment company, that exposure is
          a cost: others trade ahead of known flows, read client relationships off the chain and reconstruct strategies from history.
        </p>
        <p>
          Permissioned ledgers avoid exposure by keeping data inside a consortium, at the price of trusting the consortium and splitting
          liquidity across networks that cannot settle with each other.
        </p>
      </>
    ),
  },
  {
    id: "design",
    title: "3. Two layers",
    body: (
      <>
        <p>
          The private layer holds the record: both wallet addresses, both legs, a memo and a salt. The public layer holds a commitment
          to that record, its status and the {CHAIN.name} block at which each status was reached.
        </p>
        <p>
          {BRAND.name} is not a blockchain. {CHAIN.name} provides ordering, time and the assets. This choice avoids a new validator set
          and bridges, and puts settlements next to the tokenized equities and the USDG dollar token already on that chain.
        </p>
      </>
    ),
  },
  {
    id: "commitments",
    title: "4. Commitments",
    body: (
      <>
        <p>
          A commitment is keccak256 over the canonical JSON of the terms, a separator and a 16-byte random salt. Canonical means keys
          sorted at every depth, lowercase addresses and normalised decimal amounts, so the same terms always give the same hash.
        </p>
        <p>
          The salt prevents guessing: without it, an observer could hash likely terms and compare. With it, the commitment reveals
          nothing, yet anyone given the terms and salt can confirm the match.
        </p>
      </>
    ),
  },
  {
    id: "keys",
    title: "5. View keys and selective disclosure",
    body: (
      <>
        <p>
          Each record has its own 32-byte view key, given to the creator once. The server keeps only its SHA-256. Presenting the key
          opens that record and no other. A desk answering an audit request hands over the keys of the trades in question, and nothing
          else about its book becomes visible.
        </p>
      </>
    ),
  },
  {
    id: "intent",
    title: "6. Signed intent",
    body: (
      <>
        <p>
          Every action is a plain-language message signed with personal_sign: the domain, the action, the wallet, chain id {CHAIN.id}, a
          one-time nonce and an expiry. The server burns the nonce atomically before verifying, so a signature cannot be replayed, and it
          applies the action it stored with the nonce rather than anything the browser sends later.
        </p>
      </>
    ),
  },
  {
    id: "lifecycle",
    title: "7. Lifecycle rules",
    body: (
      <ul>
        <li>A proposal names one counterparty; only that wallet can accept it, once.</li>
        <li>An unaccepted proposal expires after 24 hours; the maker may withdraw it before acceptance.</li>
        <li>The two legs must be different assets with positive amounts.</li>
        <li>An issuance lists between one and five eligible holders in practice mode, and names its class, units, face value and maturity.</li>
      </ul>
    ),
  },
  {
    id: "contracts",
    title: "8. The contract plan",
    body: (
      <>
        <p>
          Three contracts would take the design from practice to production. A settlement escrow holds both legs and releases them
          together on acceptance, or returns them on expiry. An issuance contract mints an instrument to its allowlist and refuses
          transfers outside it. A commitment registry records hashes and statuses so the public tape is the chain itself.
        </p>
        <p>
          Design goals for those contracts, not facts about anything live: no upgrade path that lets an admin move user assets, a public
          audit before deployment, and parameters published in advance.
        </p>
      </>
    ),
  },
  {
    id: "token",
    title: `9. The ${BRAND.symbol} token`,
    body: (
      <>
        <p>
          {BRAND.symbol} is the project token on {CHAIN.name}. Its intended roles are operator bonding and settlement fees once the
          contracts and the operator programme exist. It carries no claim on revenue or assets and is not an investment product. The
          contract address will be published on the <Link href="/token" className="link">token page</Link> at launch.
        </p>
      </>
    ),
  },
  {
    id: "risks",
    title: "10. Risks and limits",
    body: (
      <ul>
        <li>Practice mode depends on one server to store records and serve the tape.</li>
        <li>Losing a view key means losing the ability to open that record; there is no recovery by design.</li>
        <li>Timing and frequency of commitments are public and can leak patterns even when content does not.</li>
        <li>Token transfers on Robinhood Chain are public. A first escrow contract can keep terms and memos private, but hiding amounts on-chain needs a shielded design, which is a larger, separate milestone.</li>
        <li>Unaudited contracts can hold bugs; none will hold user funds before an audit.</li>
        <li>Regulatory treatment of private settlement differs by jurisdiction and is unresolved.</li>
      </ul>
    ),
  },
  {
    id: "roadmap",
    title: "11. Roadmap",
    body: (
      <ol>
        <li>Now: website, live chain data, practice desk for settlements and issuances.</li>
        <li>Next: token launch, contract specification published for review.</li>
        <li>Then: independent audit, testnet deployment, mainnet escrow with conservative limits.</li>
        <li>Later: operator programme, compliance hooks and integrations with custodians.</li>
      </ol>
    ),
  },
];

export default function LitepaperPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([{ name: "Litepaper", path: "/litepaper" }]),
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: `${BRAND.name} litepaper`,
            url: `${BRAND.url}/litepaper`,
            inLanguage: "en",
            publisher: { "@id": `${BRAND.url}/#org` },
          },
        ]}
      />
      <PageHead
        kicker="Litepaper · v0.1, October 2026"
        title={
          <>
            Private settlement, <em>in one read.</em>
          </>
        }
        lede={`How ${BRAND.name} keeps the terms of a deal between its parties while the proof that it settled stays public on ${CHAIN.name}.`}
      />
      <div className="wrap wrap-wide grid grid-cols-1 gap-12 py-14 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow">Contents</p>
            <ol className="mt-3 space-y-1.5 text-[14px]">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-ink-2 hover:text-stamp">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>
        <article className="min-w-0 max-w-[740px]">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 border-t border-ink pt-6 pb-10">
              <h2 className="serif text-[32px] leading-tight">{s.title}</h2>
              <div className="prose-d mt-4 text-[17px] leading-relaxed [&_li]:mt-2 [&_li]:text-ink-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
                {s.body}
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
