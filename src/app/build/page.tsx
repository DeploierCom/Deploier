import { BRAND, CHAIN } from "@/config/brand";
import { NodeArt } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Cards, FormSection, Hero } from "@/components/kit";
import { QuoteBand, TabShowcase } from "@/components/kit-client";
import { TargetTag } from "@/components/ui";
import { PRINCIPLES } from "@/content/quotes";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/build",
  title: "Build Private Finance Apps on Robinhood Chain | Deploier",
  description:
    "Build on Deploier: private settlement apps on Robinhood Chain for tokenization, custody, collateral, payments and financing, with public commitment proofs.",
});

const PATTERNS: { label: string; body: string; art: [string, string, string, string?] }[] = [
  {
    label: "Tokenized issuance",
    body: "Issue a bill, fund share or receivable to an allowlist, keep the cap table private and publish only the commitment of each issuance.",
    art: ["Issuance", "Issuer", "Holders", "Bill"],
  },
  {
    label: "Custody between clients",
    body: "Custodians can settle between client accounts and show a regulator one record at a time with its view key, without opening the rest of the book.",
    art: ["Transfer", "Client A", "Client B", "Key"],
  },
  {
    label: "Moving posted margin",
    body: "Move posted collateral between venues as a private settlement, so the market sees that margin moved but not whose or how much.",
    art: ["Margin", "Venue", "Desk", "WETH"],
  },
  {
    label: "Supplier payments in USDG",
    body: "Pay suppliers and staff in USDG with invoices that stay between payer and payee, while the payment itself is final on the chain.",
    art: ["Invoice", "Payer", "Payee", "USDG"],
  },
  {
    label: "Round-the-clock financing",
    body: "Repo-style deals that open and close on a Sunday night: cash against stock tokens, with both legs recorded privately.",
    art: ["Repo", "Borrower", "Lender", "AAPL"],
  },
];

export default function BuildPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Build", path: "/build" }])} />
      <Hero
        art={{ src: "/art/ribbon.svg", className: "top-[-30px] right-[-40px] h-[calc(100%+30px)] w-auto drift" }}
        title="Ship finance apps that keep a secret"
        sub={`${BRAND.name} gives builders on ${CHAIN.name} a settlement primitive with privacy in its design: a record format, a commitment scheme and a signing flow that already run on the practice desk. The escrow, registry and issuance contracts are written, tested and published with the source.`}
      >
        <Btn href="/developers" small>
          Developer reference
        </Btn>
      </Hero>

      <Band>
        <p className="d-h2 max-w-[915px] text-black">Build connected markets without giving up confidentiality</p>
        <Cards
          className="mt-[30px]"
          minH={222}
          items={[
            { title: "Privacy that scales with the deal count", body: "Each record has its own salt and key, so a busy desk with thousands of settlements leaks no more than a quiet one." },
            { title: "Control stays with the parties", body: "Only named wallets can accept or withdraw. The app builder cannot settle on a user's behalf without that user's signature." },
            { title: "Composable with the chain", body: `Settlements reference real ${CHAIN.name} assets: USDG, WETH and the tokenized stocks. No wrapped copies, no bridge.` },
          ]}
        />
      </Band>

      <Band className="!pt-0">
        <h2 className="d-h2 text-black">Get started</h2>
        <p className="t-sub mt-[2px] mb-[40px] max-w-[915px] text-black">
          Read how the layer works, pick the market you want to serve, and build against the same shapes the contracts will use.
        </p>
        <Cards
          tone="dark"
          minH={427}
          items={[
            {
              title: "Explore the layer",
              body: "How a private record and a public commitment stay consistent, what the chain carries and which rules every participant follows.",
              links: [
                { href: "/settlement", label: "The settlement layer" },
                { href: "/network", label: "Live network readings" },
              ],
            },
            {
              title: "Move assets privately",
              body: "Margin at any hour, repo against stock tokens and supplier payments in USDG, each written up as a flow with its risks and what can be tried today.",
              links: [
                { href: "/use-cases/crypto-derivatives", label: "Private margin" },
                { href: "/use-cases/onchain-financing", label: "Around-the-clock financing" },
                { href: "/use-cases/stablecoin-payments", label: "Confidential payments" },
              ],
            },
            {
              title: "Developer reference",
              body: "The commitment rule, the signed-ticket flow and every endpoint the practice desk calls, with the settlement contracts, their functions and events.",
              links: [{ href: "/developers", label: "Developer docs" }],
            },
          ]}
        />
      </Band>

      <Band>
        <h2 className="d-h2 mb-[20px] max-w-[640px] text-black">Patterns you can build on {BRAND.name}</h2>
        <TabShowcase items={PATTERNS.map((p, i) => ({ label: p.label, title: p.label, body: p.body, art: <NodeArt labels={p.art as [string, string, string, string?]} seed={i + 1} /> }))} />
      </Band>

      <QuoteBand quotes={PRINCIPLES} />

      <FormSection title={`Build on ${BRAND.name}`} tagline="Builders deserve a clear picture before they commit time." topic="build">
        <div className="mb-4">
          <TargetTag>Contracts deployed and verified; addresses on the developers page</TargetTag>
        </div>
        <ul>
          <li>Available now: the record format, the commitment function, the signed-ticket flow and a public tape API, all exercised by the practice desk.</li>
          <li>Contracts: SettlementEscrow for atomic delivery against payment, AllowlistTokenFactory for issuer-managed holder allowlists, CommitmentRegistry for the on-chain tape. See the developers page for functions and events.</li>
          <li>Tell the team what you are building and what the contract interface must support.</li>
        </ul>
      </FormSection>
    </>
  );
}
