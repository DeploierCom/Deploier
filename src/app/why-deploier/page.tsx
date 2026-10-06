import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Columns, CtaBand, PageHead, Rows, Section, TargetTag } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/why-deploier",
  title: "Why Private Settlement Matters | Deploier",
  description:
    "Why Deploier exists: open ledgers expose every position and closed systems hide the rules. Deploier keeps rules public and books private on Robinhood Chain.",
});

export default function WhyPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Why Deploier", path: "/why-deploier" }])} />
      <PageHead
        kicker="Why Deploier"
        title={
          <>
            Markets moved on-chain. Their <em>discretion</em> did not.
          </>
        }
        lede={
          <>
            {BRAND.name} exists because the two settlement models on offer both fail serious money. Open ledgers settle in seconds and
            publish everything. Closed networks keep secrets and ask you to trust whoever runs them. A {BRAND.category} on {CHAIN.name}{" "}
            takes the speed and verifiability of the first and the confidentiality of the second.
          </>
        }
      >
        <Link href="/settlement" className="btn btn-accent">
          See how settlement works <span className="arr">→</span>
        </Link>
        <Link href="/faq" className="btn btn-ghost">
          Read the FAQ
        </Link>
      </PageHead>

      <Section
        index="01"
        title="Transparency became a trading signal"
        lede="On a fully public chain, a large holder cannot move without being watched. Wallet trackers flag the transfer, bots trade ahead of the rest of the order, and competitors reconstruct a strategy from a week of history."
      >
        <Columns
          items={[
            {
              title: "Front-running is a business model",
              body: "When an incoming settlement is visible before it is final, someone will trade against it. The cost lands on the party that moved first.",
            },
            {
              title: "Balances are a client list",
              body: "A broker's settlement wallet shows who it pays and how much. For a regulated firm that is not a privacy issue only, it is a confidentiality breach.",
            },
            {
              title: "History cannot be recalled",
              body: "Once a ledger has published a position, nothing undoes it. Privacy has to be built in before the first settlement, not added after the leak.",
            },
          ]}
        />
      </Section>

      <Section
        index="02"
        night
        title="Closed networks fixed privacy by hiding the rules"
        lede="Permissioned ledgers keep data inside a consortium. That solves exposure and creates a new problem: nobody outside can check that the rules were applied the same way to everyone, and every participant depends on the operator staying honest and online."
      >
        <Rows
          items={[
            { title: "One operator, one failure", body: "If the consortium's servers stop, settlement stops. If its admins change a rule, members find out afterwards." },
            { title: "Islands that cannot meet", body: "Each private network is its own pool of assets. Moving collateral between them takes the same manual reconciliation the technology was meant to remove." },
            { title: "Trust without proof", body: "A member can be told a trade settled, but cannot prove it to a third party without the operator's help." },
          ]}
        />
      </Section>

      <Section
        index="03"
        title="The Deploier answer: public rules, private books"
        lede={
          <>
            {BRAND.name} puts only commitments on the public tape and keeps the deal itself with the parties. The rules for forming,
            accepting and expiring a settlement are written down for anyone to read. Final states are stamped against {CHAIN.name}{" "}
            blocks, which no single company controls.
          </>
        }
      >
        <Columns
          cols={2}
          items={[
            {
              title: "Built on an existing chain, not a new one",
              body: `${CHAIN.name} already carries tokenized equities, a dollar token (USDG) and the wallets people use. Starting there means no new validator set to trust and no bridge to cross.`,
            },
            {
              title: "Disclosure is a choice, record by record",
              body: "A view key opens exactly one settlement. Handing it to an auditor proves that deal without exposing any other.",
            },
            {
              title: "Every agreement is signed",
              body: "Proposals and acceptances are wallet signatures over plain-language terms, so the record of consent is as strong as the keys behind it.",
            },
            {
              title: "Honest about what is live",
              body: "Today the desk runs in practice mode. Audited settlement contracts are the next milestone, and the site will say so plainly until they ship.",
            },
          ]}
        />
      </Section>

      <Section
        index="04"
        title="Who Deploier is designed for"
        lede="Institutional readiness is the goal the design is measured against. None of the groups below are users today, and no institution has endorsed Deploier."
      >
        <div className="mb-6">
          <TargetTag>Target users</TargetTag>
        </div>
        <Rows
          items={[
            { title: "Financial institutions", body: "Banks, brokers and custodians that need to settle client flows without publishing client positions." },
            { title: "Capital markets venues", body: "Exchanges and trading platforms that want on-chain finality for matched trades while keeping order flow confidential." },
            { title: "Asset issuers", body: "Corporate treasuries and fund managers issuing tokenized bills, shares or receivables to an allowlisted set of holders." },
            { title: "Payment providers", body: "Stablecoin networks and processors that pay merchants and payroll without making every invoice public." },
            { title: "Crypto institutions", body: "Regulated exchanges and professional traders that post margin and move collateral around the clock." },
          ]}
        />
      </Section>

      <CtaBand title="See the trade-off disappear in practice" body="Run a private settlement between two of your own wallets and compare what the public tape shows with what you see.">
        <Link href="/app" className="btn btn-accent">
          Open the practice desk <span className="arr">→</span>
        </Link>
      </CtaBand>
    </>
  );
}
