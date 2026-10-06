import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { NodeArt } from "@/components/art";
import { FAQ } from "@/content/faq";
import { Btn, Cards, Chevron, DarkRow, FaqBlock, FormSection, Hero, More } from "@/components/kit";
import { TabShowcase } from "@/components/kit-client";
import { LiveStrip, StockTicker } from "@/components/live";
import { LiveTag, PracticeTag, TargetTag } from "@/components/ui";
import { HOME_DESCRIPTION, HOME_TITLE, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({ path: "/", title: HOME_TITLE, description: HOME_DESCRIPTION });

const NOTES = [
  {
    source: "Litepaper",
    date: "v0.1 · October 2026",
    title: "The design of Deploier in one sitting",
    body: "Commitments, view keys, the two-layer model and the contracts still to come, written for treasurers and engineers alike.",
    href: "/litepaper",
  },
  {
    source: "Real-world assets",
    date: "Live on Robinhood Chain",
    title: "Tokenized equities already trade on the chain",
    body: "Apple, Alphabet, NVIDIA and Tesla stock tokens are deployed and priced by Chainlink. Deploier is built to settle against them.",
    href: "/use-cases/rwa-tokenization",
  },
  {
    source: "FAQ",
    date: "Updated 6 October 2026",
    title: "What exists today, and what does not yet",
    body: "A straight list of what runs, what is written and waiting for deployment, and what is still a design goal. Read it before you buy anything.",
    href: "/faq",
  },
];

const USES = [
  {
    label: "Crypto derivatives",
    title: "Margin calls without a headline",
    body: "Desks post and recall collateral at any hour. On the public tape a large top-up reads as one more commitment hash, so nobody can tell which side is under pressure.",
    href: "/use-cases/crypto-derivatives",
    art: ["Margin call", "Desk A", "Desk B", "USDG"] as [string, string, string, string],
  },
  {
    label: "Around-the-clock financing",
    title: "Repo that does not wait for Monday",
    body: "Cash against stock tokens, opened and closed as two private settlements. Rate, haircut and size stay in the record; the chain keeps the proof.",
    href: "/use-cases/onchain-financing",
    art: ["Repo leg", "Borrower", "Lender", "NVDA"] as [string, string, string, string],
  },
  {
    label: "Confidential USDG payments",
    title: "Pay suppliers without publishing payroll",
    body: "An invoice and its USDG payment settle as one sealed record. Payer and payee reconcile from the memo; the market only learns that a payment closed.",
    href: "/use-cases/stablecoin-payments",
    art: ["Invoice", "Payer", "Supplier", "USDG"] as [string, string, string, string],
  },
  {
    label: "RWA tokenization",
    title: "Treasuries and fund shares with a private cap table",
    body: "An issuer describes the instrument, names the eligible holders and signs. The public tape shows that an issuance happened and has not changed since.",
    href: "/use-cases/rwa-tokenization",
    art: ["Issuance", "Issuer", "Holders", "T-bill"] as [string, string, string, string],
  },
];

const HOME_FAQ = FAQ.slice(0, 6).map((f) => ({ q: f.q, a: f.a.map((p) => <p key={p.slice(0, 24)}>{p}</p>) }));

export default function HomePage() {
  return (
    <>
      <Hero
        home
        mesh
        art={{ src: "/art/mark-stack.svg", className: "top-[40px] right-[-10px] w-[500px] xl:w-[540px] max-[1199.98px]:w-[380px] max-[1199.98px]:top-[90px] drift" }}
        title={
          <>
            {BRAND.name}: where finance flows <em>privately</em>
          </>
        }
        sub="Settle trades, payments and tokenized assets on Robinhood Chain, with the terms kept private."
        after={
          <>
            <p className="mt-[30px] max-w-[600px] text-[16px] leading-[32px] font-light">{BRAND.tagline}</p>
            <p className="mt-[30px] flex flex-wrap items-center gap-x-[22px] gap-y-1 text-[16px] leading-[32px] font-light">
              <span>Start here:</span>
              {[
                ["/connect", "Connect"],
                ["/build", "Build"],
                ["/run", "Run"],
                ["/network", "Explore"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="text-accent transition-opacity hover:opacity-75">
                  {label}
                </Link>
              ))}
            </p>
          </>
        }
      />

      {/* Announcement band */}
      <section className="pt-[75px] pb-[75px] max-md:pt-[30px] max-md:pb-[40px]">
        <div className="ctn">
          <div className="rounded-[16px] bg-sky px-[50px] py-[50px] text-center text-black max-md:px-[25px]">
            <div className="mx-auto max-w-[768px]">
              <h2 className="d-h5 text-black">Tokenized US stocks already settle on {CHAIN.name}</h2>
              <p className="t-body mt-[10px]">
                Stock tokens for Apple, Alphabet, NVIDIA and Tesla are deployed on {CHAIN.name} today, each with a Chainlink price feed.
                {" "}{BRAND.name} is designed to settle against them privately: delivery against payment, without telling the market what you
                just bought or sold.
              </p>
              <div className="mt-[18px]">
                <StockTicker />
              </div>
              <div className="mt-[22px]">
                <Btn href="/network" tone="ink">
                  See the live feeds
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="pb-[75px] max-md:pb-[50px]">
        <div className="ctn">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="d-h3 text-black">Settlement notes</h2>
            <More href="/litepaper" className="!text-[#1c42d4]">
              read more
            </More>
          </div>
          <div className="mt-[20px] grid grid-cols-1 gap-[15px] md:grid-cols-3">
            {NOTES.map((n) => (
              <Link key={n.href} href={n.href} className="group flex min-w-0 flex-col rounded-[16px] bg-paper-2 px-[25px] py-[35px] transition-colors hover:bg-[#ececec]">
                <p className="text-[16px] leading-[24px] text-[#3d5264]">
                  <span className="font-semibold text-navy">{n.source}</span>
                  <span className="mx-[10px] text-black/40">|</span>
                  {n.date}
                </p>
                <h3 className="d-h4n mt-[10px] text-navy">{n.title}</h3>
                <p className="t-body mt-[14px] mb-[40px] text-black/80">{n.body}</p>
                <span className="more mt-auto">
                  Read <Chevron />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <DarkRow title="Settle with a counterparty without putting your book on display" art={{ src: "/art/planes.svg" }}>
        <p>
          Public ledgers made settlement fast and verifiable, and in the same move they made every position readable by every rival. A fund
          that rebalances on a transparent chain announces its intent before the trade is done. {BRAND.name} separates the two things a
          market needs from a settlement: proof that it happened, and the details of what happened.
        </p>
        <ul className="space-y-3">
          <li>
            <strong className="font-semibold">The proof is public.</strong> Each settlement leaves a commitment on the public tape: a 32-byte
            keccak hash of the terms plus a random salt, its status and the {CHAIN.name} block it was stamped at.
          </li>
          <li>
            <strong className="font-semibold">The terms are not.</strong> Who traded, which assets, how much and why stay in a private record
            that only holders of its view key can open.
          </li>
          <li>
            <strong className="font-semibold">Either side can check.</strong> Given the terms and the salt, anyone recomputes the hash. Change
            one character of the terms and it no longer matches.
          </li>
        </ul>
      </DarkRow>

      <DarkRow reverse title="Privacy shaped for regulated desks" art={{ src: "/art/planes-wide.svg" }}>
        <p>
          Banks, brokers and custodians cannot run their books on a chain that publishes client positions. They also cannot use a black box
          that nobody can inspect. {BRAND.name} aims at the middle: selective disclosure, where a party hands one specific record to a
          reviewer or supervisor without opening anything else.
        </p>
        <p>
          Per-record view keys, allowlisted holders for tokenized instruments and signed intent in plain words already run on the practice
          desk. Screening, reporting and jurisdiction rules are not in the contracts and are not claimed; for now they are design goals,
          not features to rely on.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <TargetTag>Institutional readiness is a target</TargetTag>
          <PracticeTag>Today: practice mode</PracticeTag>
        </div>
      </DarkRow>

      <DarkRow title="Public rules, private books" art={{ src: "/art/tunnel.svg" }}>
        <p>
          Most privacy systems ask you to trust an operator. Most open chains ask you to give up confidentiality. {BRAND.name} keeps the rules
          in the open: how a commitment is formed, who may accept, when a proposal expires. Only the content of each deal is kept close.
        </p>
        <p>
          No central intermediary decides which settlements count, because the public tape and the signatures decide it. Everyone can read the
          commitment, its status and its block; only the parties read the wallets, the legs, the memo and the salt.
        </p>
      </DarkRow>

      {/* Three paths */}
      <section className="pt-[75px] pb-[40px]">
        <div className="ctn">
          <Cards
            tone="dark"
            minH={321}
            items={[
              {
                title: "Connect a desk",
                body: "Link an EVM wallet, add Robinhood Chain in one click and open the practice desk. Propose a private settlement to a second wallet and watch only its hash reach the public tape.",
                links: [{ href: "/connect", label: "Connect" }],
              },
              {
                title: "Build on the layer",
                body: "Design applications that settle with privacy: margin desks, payment rails, issuance tools. Read the record format, the commitment scheme and the contracts first.",
                links: [{ href: "/build", label: "Build" }],
              },
              {
                title: "Run settlement",
                body: "The layer will need operators who check commitments, relay final states and answer to clear rules. Learn what an operator would do and what the role may never see.",
                links: [{ href: "/run", label: "Run" }],
              },
            ]}
          />
        </div>
      </section>

      {/* Layer + live data */}
      <section className="py-[75px] max-md:py-[50px]">
        <div className="ctn grid grid-cols-1 items-center gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0 lg:pr-[100px]">
            <h2 className="d-h2s text-black">A settlement layer that lives on {CHAIN.name}</h2>
            <p className="t-body mt-5 text-black">
              {BRAND.name} is not a separate blockchain. It is a token and an application on {CHAIN.name}, the Ethereum-compatible network
              where tokenized US equities already trade. The private record lives with the parties; finality, timestamps and commitments ride
              on {CHAIN.name} blocks. You pay gas in ETH, sign with the wallet you already use and read every public fact from the same
              explorer as everyone else.
            </p>
            <div className="mt-[30px] flex flex-wrap gap-[10px]">
              <Btn href="/settlement">How the layer works</Btn>
            </div>
          </div>
          <div className="min-w-0">
            <div className="mb-4">
              <LiveTag />
            </div>
            <LiveStrip cols={2} />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="py-[75px] max-md:py-[50px]">
        <div className="ctn">
          <h2 className="d-h2 max-w-[640px] text-black">Where private settlement changes the trade</h2>
          <p className="t-sub mt-[10px] mb-[40px] max-w-[915px] text-black">
            Four markets where a public ledger helps with speed but hurts with exposure. Each has its own page with the flow, the risks and
            what can be tried today.
          </p>
          <TabShowcase
            items={USES.map((u, i) => ({
              label: u.label,
              title: u.title,
              body: u.body,
              href: u.href,
              cta: "Read the use case",
              art: <NodeArt labels={u.art} seed={i} />,
            }))}
          />
        </div>
      </section>

      <FaqBlock title={`Questions about ${BRAND.name}`} items={HOME_FAQ} />

      <FormSection
        title={`Ready to try ${BRAND.name}?`}
        tagline="The contracts that will move real assets privately are not deployed yet. Everything below is real and works now:"
        topic="home"
      >
        <ul>
          <li>
            Connect MetaMask, Rabby, OKX, Coinbase Wallet or another EVM wallet; {CHAIN.name} (chain id {CHAIN.id}) is added for you
          </li>
          <li>Propose a practice settlement to a second wallet you control and accept it from the other side</li>
          <li>Describe a treasury bill, fund share or receivable, set its holder allowlist and record a signed practice issuance</li>
          <li>
            Follow {BRAND.symbol} launch news on X at{" "}
            <a href={BRAND.x} target="_blank" rel="noreferrer" className="text-stamp hover:underline">
              {BRAND.xHandle}
            </a>
          </li>
        </ul>
        <div className="mt-[30px] flex flex-wrap gap-[10px]">
          <Btn href="/app">
            Open the practice desk <span className="arr">→</span>
          </Btn>
        </div>
      </FormSection>
    </>
  );
}
