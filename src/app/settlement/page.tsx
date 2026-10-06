import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { LayerDiagram } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { LiveStrip } from "@/components/live";
import { Columns, CtaBand, LiveTag, PageHead, PracticeTag, Rows, Section } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/settlement",
  title: "The Settlement Layer on Robinhood Chain | Deploier",
  description:
    "How the Deploier settlement layer works: private records for the parties, commitment hashes on a public tape, final states stamped on Robinhood Chain blocks.",
});

export default function SettlementPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Settlement layer", path: "/settlement" }])} />
      <PageHead
        kicker="The settlement layer"
        title={
          <>
            One deal, two layers, <em>no leak.</em>
          </>
        }
        lede={
          <>
            The {BRAND.name} settlement layer splits every deal into a private record that only the parties can open and a public
            commitment that anyone can verify. {CHAIN.name} supplies the clock, the finality and the assets. {BRAND.name} supplies the
            discipline that keeps the two layers consistent.
          </>
        }
        art={<LayerDiagram />}
      >
        <PracticeTag>Runs in practice mode today</PracticeTag>
      </PageHead>

      <Section
        index="01"
        title="Life of a private settlement"
        lede="Five steps, each one a signature or a public fact. This is exactly what the practice desk does today, minus the asset transfer that the audited contracts will add."
      >
        <Rows
          items={[
            {
              title: "Propose",
              body: "The maker names a counterparty wallet and two legs, for example 50,000 USDG against 150 AAPL stock tokens, and signs the terms in plain words.",
            },
            {
              title: "Commit",
              body: "The terms and a fresh 16-byte salt are hashed with keccak256. The hash, a status of proposed and the current Robinhood Chain block go on the public tape. Nothing else does.",
            },
            {
              title: "Share the view key",
              body: "The maker receives a view key for this one record and passes it to the counterparty through whatever channel they already trust.",
            },
            {
              title: "Accept",
              body: "Only the named counterparty's wallet can accept. Its signature flips the status to settled and stamps the block at which that happened.",
            },
            {
              title: "Verify",
              body: "Either party, or an auditor given the key, recomputes the hash from the terms and salt and checks it against the public entry.",
            },
          ]}
        />
      </Section>

      <Section
        index="02"
        night
        title="What the public layer carries"
        lede={`Every public fact the layer depends on is read from ${CHAIN.name} itself. The figures below are live.`}
      >
        <div className="mb-8">
          <LiveTag />
        </div>
        <LiveStrip />
      </Section>

      <Section
        index="03"
        title="Rules that hold for every participant"
        lede="The layer is useful only if its rules are the same for everyone and can be read by anyone. These are the rules the practice desk enforces now and the contracts will enforce later."
      >
        <Columns
          items={[
            { title: "One counterparty, one acceptance", body: "A proposal names exactly one wallet. No one else can accept it, and it cannot be accepted twice." },
            { title: "Proposals expire", body: "An unaccepted proposal lapses after 24 hours. Stale terms cannot be picked up days later at an old price." },
            { title: "The maker can withdraw", body: "Until acceptance, the proposing wallet can cancel. After acceptance, the record is final." },
            { title: "Different assets on each leg", body: "A settlement exchanges one asset for another. Same-asset legs are refused as meaningless." },
            { title: "Signatures over plain words", body: "Wallets sign readable text that states the action, the amounts and the chain id, with a one-time nonce." },
            { title: "Keys are never stored in clear", body: "The server keeps only a SHA-256 of each view key, so a database leak does not open the private records." },
          ]}
        />
      </Section>

      <Section
        index="04"
        title="What changes when the contracts ship"
        lede="Practice mode records the agreement. The audited release is meant to move the assets too, atomically: both legs settle in one transaction or neither does."
      >
        <Columns
          items={[
            { title: "Atomic delivery against payment", body: "An escrow contract would hold both legs and release them together once the counterparty accepts, removing the risk that one side delivers and the other does not." },
            { title: "Commitments on-chain", body: "The commitment hash would be written to the contract itself, so the public tape is the chain and not a server." },
            { title: "An honest limit", body: "Token transfers on Robinhood Chain are visible to everyone. The first contracts keep terms and memos private; hiding amounts on-chain needs a shielded design that is planned separately." },
          ]}
        />
        <p className="mt-8 text-[15px] text-ink-2">
          The contract plan, its risks and the audit requirement are covered in the <Link href="/litepaper" className="link">litepaper</Link>.
        </p>
      </Section>

      <CtaBand title="Watch the two layers side by side" body="The practice desk shows the public tape and your private record on one screen.">
        <Link href="/app" className="btn btn-accent">
          Open the practice desk <span className="arr">→</span>
        </Link>
        <Link href="/network" className="btn btn-ghost">
          Live network
        </Link>
      </CtaBand>
    </>
  );
}
