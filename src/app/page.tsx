import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { LayerDiagram, PathGlyph, StatementArt } from "@/components/art";
import { LiveStrip, StockBoard } from "@/components/live";
import { ArrowLink, Columns, CtaBand, LiveTag, PracticeTag, Rows, Section, TargetTag } from "@/components/ui";
import { USE_CASES } from "@/components/site";
import { HOME_DESCRIPTION, HOME_TITLE, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ path: "/", title: HOME_TITLE, description: HOME_DESCRIPTION });

const PATHS = [
  {
    href: "/connect",
    variant: "connect" as const,
    title: "Connect a desk",
    body: "Link an EVM wallet, add Robinhood Chain in one click and open the practice desk. Propose a private settlement to a second wallet and watch only its hash reach the public tape.",
    cta: "Start connecting",
  },
  {
    href: "/build",
    variant: "build" as const,
    title: "Build on the layer",
    body: "Design applications that settle with privacy: margin desks, payment rails, issuance tools. Read the record format, the commitment scheme and the contract plan before a line of production code exists.",
    cta: "See the build plan",
  },
  {
    href: "/run",
    variant: "run" as const,
    title: "Run settlement",
    body: "The layer will need operators who check commitments, relay final states and answer to clear rules. Learn what an operator would do and what the role is not allowed to see.",
    cta: "Read the operator role",
  },
];

const NOTES = [
  {
    tag: "Litepaper",
    title: "The design of Deploier in one sitting",
    body: "Commitments, view keys, the two-layer model and the contracts still to come, written for treasurers and engineers alike.",
    href: "/litepaper",
  },
  {
    tag: "Real-world assets",
    title: "Tokenized equities already trade on Robinhood Chain",
    body: "Apple, Alphabet, NVIDIA and Tesla stock tokens are live on the chain today, priced by Chainlink. Deploier is built to settle against them.",
    href: "/use-cases/rwa-tokenization",
  },
  {
    tag: "FAQ",
    title: "What exists today, and what does not yet",
    body: "A straight list: the token, the website and the practice desk are here. Audited settlement contracts are not. Read it before you buy anything.",
    href: "/faq",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-ink">
        <div className="wrap wrap-wide grid grid-cols-1 gap-12 py-14 md:py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
          <div className="min-w-0">
            <p className="eyebrow">Privacy settlement layer on {CHAIN.name}</p>
            <h1 className="h-display mt-5 text-[52px] sm:text-[72px] lg:text-[88px]">
              {BRAND.name}: where finance flows <em>privately.</em>
            </h1>
            <p className="lede mt-6 max-w-[560px]">{BRAND.tagline}</p>
            <p className="mt-4 max-w-[560px] text-[16px] text-ink-2">
              {BRAND.name} lets two parties settle a trade, a payment or a tokenized asset on {CHAIN.name} while the amounts, the
              counterparties and the terms stay between them. The chain keeps the proof. The parties keep the book.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <span className="eyebrow">Start by</span>
              {[
                ["/connect", "Connect"],
                ["/build", "Build"],
                ["/run", "Run"],
                ["/network", "Explore"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="border-b border-ink pb-0.5 text-[17px] font-medium hover:text-stamp">
                  {label}
                </Link>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/app" className="btn btn-accent">
                Open the practice desk <span className="arr">→</span>
              </Link>
              <Link href="/token" className="btn btn-ghost">
                {BRAND.symbol} token
              </Link>
            </div>
          </div>
          <div className="min-w-0 lg:pl-6">
            <StatementArt />
          </div>
        </div>
      </section>

      {/* Live band */}
      <section className="border-b border-ink bg-paper-2">
        <div className="wrap wrap-wide py-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="serif text-[30px] leading-tight">{CHAIN.name}, read live as you scroll</h2>
            <LiveTag />
          </div>
          <p className="mt-3 max-w-[760px] text-[15.5px] text-ink-2">
            Nothing in this strip is a mock-up. Each figure comes from the public RPC of {CHAIN.name} or a spot market a few seconds ago:
            the newest block, the gas price, ether in dollars and the circulating supply of USDG, the dollar token the practice desk
            settles in.
          </p>
          <div className="mt-8">
            <LiveStrip />
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="border-b border-ink">
        <div className="wrap wrap-wide py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="h-display text-[38px] sm:text-[46px]">Settlement notes</h2>
            <ArrowLink href="/litepaper">Read the litepaper</ArrowLink>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {NOTES.map((n) => (
              <Link key={n.href} href={n.href} className="group flex min-w-0 flex-col border border-ink bg-card p-6 transition-colors hover:bg-paper-2">
                <span className="eyebrow">{n.tag}</span>
                <h3 className="serif mt-3 text-[26px] leading-tight">{n.title}</h3>
                <p className="mt-3 flex-1 text-[15px] text-ink-2">{n.body}</p>
                <span className="mt-5 text-[14px] font-medium text-stamp">
                  Read <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Section
        index="01"
        title="Settle with a counterparty without putting your book on display"
        lede={
          <>
            Public ledgers made settlement fast and verifiable, and in the same move they made every position readable by every rival. A
            fund that rebalances on a transparent chain announces its intent before the trade is done. {BRAND.name} separates the two
            things a market needs from a settlement: proof that it happened, and the details of what happened.
          </>
        }
      >
        <Columns
          items={[
            {
              title: "The proof is public",
              body: "Every settlement leaves a commitment on the public tape: a 32-byte keccak hash of the terms plus a random salt, its status and the Robinhood Chain block it was stamped at. Anyone can see that a deal exists and that it closed.",
            },
            {
              title: "The terms are not",
              body: "Who traded, which assets, how much and why stay in a private record. Only holders of that record's view key can open it, and only the named counterparty can accept it with a wallet signature.",
            },
            {
              title: "Either side can check",
              body: "Given the terms and the salt, any party recomputes the hash and compares it with the public entry. If one character of the terms were changed later, the hash would no longer match.",
            },
          ]}
        />
      </Section>

      <Section
        index="02"
        night
        title="Privacy shaped for regulated desks"
        lede={
          <>
            Banks, brokers and custodians cannot run their books on a chain that publishes client positions. They also cannot use a
            black box that nobody can inspect. {BRAND.name} aims at the middle: selective disclosure, where a party can hand one specific
            record to an auditor or supervisor without opening anything else.
          </>
        }
      >
        <div className="mb-8 flex flex-wrap gap-2">
          <TargetTag>Institutional readiness is a target</TargetTag>
          <PracticeTag>Today: practice mode</PracticeTag>
        </div>
        <Rows
          items={[
            {
              title: "Per-record view keys",
              body: "Each settlement gets its own key. Sharing one key reveals one deal, so a desk can answer an audit request for a single trade without exposing the rest of its history.",
            },
            {
              title: "Allowlisted holders",
              body: "Tokenized instruments carry an eligibility list. A transfer to an address that is not on it is refused by the rules, not by a person reviewing it after the fact.",
            },
            {
              title: "Signed intent",
              body: "Every action is a message the wallet signs in plain words. The record keeps that signature, so who agreed to what is never a matter of interpretation.",
            },
            {
              title: "Compliance hooks, planned",
              body: "Screening, reporting and jurisdiction rules belong in the contracts, where they can be read and tested. They are design goals for the audited release, not features you can rely on today.",
            },
          ]}
        />
      </Section>

      <Section
        index="03"
        title="Public rules, private books"
        lede={
          <>
            Most privacy systems ask you to trust an operator. Most open chains ask you to give up confidentiality. {BRAND.name} keeps
            the rules in the open: how a commitment is formed, who may accept, when a proposal expires. Only the content of each deal is
            kept close. No central intermediary decides which settlements count, because the public tape and the signatures decide it.
          </>
        }
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="min-w-0 border border-ink p-6">
            <p className="eyebrow">What everyone can read</p>
            <ul className="mt-4 space-y-2 text-[15.5px] text-ink-2">
              <li>— The commitment hash of every settlement and issuance</li>
              <li>— Its status: proposed, settled, withdrawn or expired</li>
              <li>— The time and the {CHAIN.name} block it was stamped at</li>
              <li>— The rules themselves, in this site and in the litepaper</li>
            </ul>
          </div>
          <div className="min-w-0 border border-ink bg-ink p-6 text-paper">
            <p className="eyebrow !text-paper/70">What only the parties read</p>
            <ul className="mt-4 space-y-2 text-[15.5px] text-paper/85">
              <li>— Both wallet addresses</li>
              <li>— The assets and the amounts on each leg</li>
              <li>— The memo and any internal reference</li>
              <li>— The salt that opens the commitment</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Paths */}
      <section className="border-b border-ink bg-paper-2">
        <div className="wrap wrap-wide py-16">
          <h2 className="h-display text-[38px] sm:text-[46px]">Three ways into {BRAND.name}</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {PATHS.map((p) => (
              <div key={p.href} className="flex min-w-0 flex-col border border-ink bg-card p-6">
                <PathGlyph variant={p.variant} />
                <h3 className="serif mt-5 text-[28px] leading-tight">{p.title}</h3>
                <p className="mt-3 flex-1 text-[15px] text-ink-2">{p.body}</p>
                <ArrowLink href={p.href} className="mt-6 self-start">
                  {p.cta}
                </ArrowLink>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section
        index="04"
        title={`A settlement layer that lives on ${CHAIN.name}`}
        lede={
          <>
            {BRAND.name} is not a separate blockchain. It is a token and an application on {CHAIN.name}, the Ethereum-compatible network
            where tokenized US equities already trade. The private record lives with the parties; finality, timestamps and the
            commitments ride on {CHAIN.name} blocks. You pay gas in ETH, sign with the wallet you already use, and read every public
            fact from the same explorer as everyone else.
          </>
        }
      >
        <LayerDiagram />
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
          <ArrowLink href="/settlement">How the settlement layer works</ArrowLink>
          <ArrowLink href="/network">Live network readings</ArrowLink>
          <ArrowLink href="/why-deploier">Why build it this way</ArrowLink>
        </div>
      </Section>

      <Section
        index="05"
        title="Real-world assets are already on the chain"
        lede={
          <>
            Tokenization is not a slide in a deck here. Stock tokens for large US companies are deployed on {CHAIN.name} and priced by
            Chainlink feeds that update during market hours. What they lack is a private way to settle in size. That is the gap{" "}
            {BRAND.name} is built for: delivery against payment, without telling the market what you just bought.
          </>
        }
      >
        <StockBoard />
      </Section>

      <Section
        index="06"
        title="Where private settlement changes the trade"
        lede="Four markets where a public ledger helps with speed but hurts with exposure. Each has its own page with the flow, the risks and what can be tried today."
      >
        <ul className="border-t border-ink">
          {USE_CASES.map((u, i) => (
            <li key={u.href} className="border-b border-line">
              <Link href={u.href} className="group grid grid-cols-1 gap-1 py-5 sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1.2fr)_24px] sm:items-center sm:gap-6">
                <span className="num text-[13px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                <span className="serif text-[26px] leading-tight group-hover:text-stamp">{u.label}</span>
                <span className="text-[15px] text-ink-2">{u.note}</span>
                <span aria-hidden="true" className="hidden text-ink-3 transition-transform group-hover:translate-x-1 sm:block">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        index="07"
        title={`Getting started with ${BRAND.name} today`}
        lede="The contracts that will move real assets privately are not deployed yet. Everything below is real and works now."
      >
        <Rows
          items={[
            {
              title: "Connect a wallet",
              body: `MetaMask, Rabby, OKX, Coinbase Wallet and other EVM wallets work. Connecting adds ${CHAIN.name} (chain id ${CHAIN.id}) if your wallet does not know it yet.`,
            },
            {
              title: "Run a practice settlement",
              body: "Propose a deal to a second wallet you control, sign it, then accept it from the other side. The public tape on the desk shows only the hash and the status.",
            },
            {
              title: "Draft a tokenized instrument",
              body: "Describe a treasury bill, a fund share or a receivable, set its holder allowlist and record a signed practice issuance.",
            },
            {
              title: `Follow ${BRAND.symbol}`,
              body: (
                <>
                  The token contract address is published on the token page and in the header at launch, and nowhere else. Updates go out
                  on X at{" "}
                  <a href={BRAND.x} target="_blank" rel="noreferrer" className="link">
                    {BRAND.xHandle}
                  </a>
                  .
                </>
              ),
            },
          ]}
        />
      </Section>

      <CtaBand
        title="Try a private settlement in two signatures"
        body={`No funds move in practice mode. You sign two messages, and the desk shows you the public view and the private view of the same deal on ${CHAIN.name}.`}
      >
        <Link href="/app" className="btn btn-accent">
          Open the practice desk <span className="arr">→</span>
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          Talk to the team
        </Link>
      </CtaBand>
    </>
  );
}
