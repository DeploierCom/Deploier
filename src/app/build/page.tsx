import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Columns, CtaBand, PageHead, Rows, Section, TargetTag } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/build",
  title: "Build Private Finance Apps on Robinhood Chain | Deploier",
  description:
    "Build on Deploier: private settlement apps on Robinhood Chain for tokenization, custody, collateral, payments and financing, with public commitment proofs.",
});

const PATTERNS = [
  {
    title: "Asset tokenization",
    body: "Issue a bill, fund share or receivable to an allowlist, keep the cap table private and publish only the commitment of each issuance.",
  },
  {
    title: "Custody and wallets",
    body: "Custodians can settle between client accounts and show a regulator one record at a time with its view key, without opening the rest of the book.",
  },
  {
    title: "Collateral mobility",
    body: "Move posted collateral between venues as a private settlement, so the market sees that margin moved but not whose or how much.",
  },
  {
    title: "On-chain payments",
    body: "Pay suppliers and staff in USDG with invoices that stay between payer and payee, while the payment itself is final on the chain.",
  },
  {
    title: "Round-the-clock financing",
    body: "Repo-style deals that open and close on a Sunday night: cash against stock tokens, with both legs recorded privately.",
  },
];

export default function BuildPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Build", path: "/build" }])} />
      <PageHead
        kicker="Build"
        title={
          <>
            Ship finance apps that <em>keep a secret.</em>
          </>
        }
        lede={`${BRAND.name} gives builders on ${CHAIN.name} a settlement primitive with privacy in its design: a record format, a commitment scheme and a signing flow that already run on the practice desk. The contracts follow after audit.`}
      >
        <Link href="/developers" className="btn btn-accent">
          Developer reference <span className="arr">→</span>
        </Link>
        <Link href="/litepaper" className="btn btn-ghost">
          Read the litepaper
        </Link>
      </PageHead>

      <Section index="01" title="Build connected markets without giving up confidentiality" lede="Three properties every app on the layer inherits.">
        <Columns
          items={[
            { title: "Privacy that scales with the deal count", body: "Each record has its own salt and key, so a busy desk with thousands of settlements leaks no more than a quiet one." },
            { title: "Control stays with the parties", body: "Only named wallets can accept or withdraw. The app builder cannot settle on a user's behalf without that user's signature." },
            { title: "Composable with the chain", body: `Settlements reference real ${CHAIN.name} assets: USDG, WETH and the tokenized stocks. No wrapped copies, no bridge.` },
          ]}
        />
      </Section>

      <Section index="02" night title="Patterns you can build" lede="Each pattern maps to a use case page with the flow in detail.">
        <Rows items={PATTERNS} />
      </Section>

      <Section index="03" title="Where the build stands" lede="Builders deserve a clear picture before they commit time.">
        <div className="mb-6">
          <TargetTag>Contracts are planned, not deployed</TargetTag>
        </div>
        <Columns
          cols={2}
          items={[
            { title: "Available now", body: "The record format, the commitment function, the signed-ticket flow and a public tape API, all exercised by the practice desk." },
            { title: "Next", body: "An escrow contract for atomic delivery against payment, an issuance contract with holder allowlists, and an independent audit of both." },
          ]}
        />
      </Section>

      <CtaBand title="Start from the reference" body="The developer page documents every endpoint and the exact hashing rule.">
        <Link href="/developers" className="btn btn-accent">
          Open the developer reference <span className="arr">→</span>
        </Link>
      </CtaBand>
    </>
  );
}
