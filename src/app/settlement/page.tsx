import { BRAND, CHAIN } from "@/config/brand";
import { LayerStack } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { Band, BarList, Cards, Hero } from "@/components/kit";
import { LiveStrip } from "@/components/live";
import { LiveTag, PracticeTag } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/settlement",
  title: "The Settlement Layer on Robinhood Chain | Deploier",
  description:
    "How the Deploier settlement layer works: private records for the parties, commitment hashes on a public tape, final states stamped on Robinhood Chain blocks.",
});

const STEPS = [
  {
    tone: "bg-gradient-to-br from-[#d9cfff] to-[#a98bff]",
    title: "Propose and commit",
    items: [
      "The maker names one counterparty wallet and two legs, for example 50,000 USDG against 150 AAPL stock tokens, and signs the terms in plain words.",
      `The terms and a fresh 16-byte salt are hashed with keccak256. The hash, the status proposed and the current ${CHAIN.name} block go on the public tape. Nothing else does.`,
    ],
  },
  {
    tone: "bg-gradient-to-br from-[#e6e0d8] to-[#b9ad9f]",
    title: "Share and accept",
    items: [
      "The maker receives a view key for this one record and passes it to the counterparty through whatever channel they already trust.",
      "Only the named counterparty's wallet can accept. Its signature flips the status to settled and stamps the block at which that happened.",
    ],
  },
  {
    tone: "bg-accent",
    title: "Verify",
    items: [
      "Either party, or an auditor given the key, recomputes the hash from the terms and salt and checks it against the public entry.",
      "If one character of the terms had been changed later, the hash would no longer match.",
    ],
  },
];

export default function SettlementPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Settlement layer", path: "/settlement" }])} />
      <Hero
        title="One deal, two layers, no leak"
        sub={`A private record only the parties can open, and a public commitment anyone can verify on ${CHAIN.name}.`}
      />

      <section className="pt-10">
        <div className="ctn">
          <p className="max-w-[915px] text-[16px] leading-[24px] text-black">
            The {BRAND.name} settlement layer splits every deal into two parts. {CHAIN.name} supplies the clock, the finality and the assets.{" "}
            {BRAND.name} supplies the discipline that keeps the private and public layers consistent: five steps, each one a signature or a
            public fact. This is exactly what the practice desk does today, minus the asset transfer that the audited contracts will add.
          </p>
          <div className="mt-4">
            <PracticeTag>Runs in practice mode today</PracticeTag>
          </div>
        </div>
      </section>

      <Band>
        <div className="grid grid-cols-1 gap-x-[20px] gap-y-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          <LayerStack />
          <div className="grid grid-cols-1 gap-[15px] md:grid-cols-3 xl:grid-cols-1">
            {STEPS.map((s) => (
              <div key={s.title} className={`min-w-0 rounded-[16px] p-[20px] text-black ${s.tone}`}>
                <h3 className="font-display text-[22px] leading-[26px] font-medium">{s.title}</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-[19px] font-medium">
                  {s.items.map((i) => (
                    <li key={i.slice(0, 20)}>{i}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Band>

      <Band className="!pt-[25px]">
        <h2 className="d-h2 max-w-[915px] text-black">Rules that hold for every participant</h2>
        <p className="t-body mt-3 mb-[30px] max-w-[915px] text-black">
          The layer is useful only if its rules are the same for everyone and can be read by anyone. These are the rules the practice desk
          enforces now and the contracts will enforce later.
        </p>
        <Cards
          cols={2}
          items={[
            {
              title: "Consent",
              body: (
                <ul className="list-disc space-y-2 pl-5">
                  <li>A proposal names exactly one wallet. No one else can accept it, and it cannot be accepted twice.</li>
                  <li>Until acceptance, the proposing wallet can withdraw. After acceptance, the record is final.</li>
                  <li>Wallets sign readable text that states the action, the amounts and the chain id, with a one-time nonce.</li>
                </ul>
              ),
            },
            {
              title: "Data",
              body: (
                <ul className="list-disc space-y-2 pl-5">
                  <li>An unaccepted proposal lapses after 24 hours, so stale terms cannot be picked up days later at an old price.</li>
                  <li>A settlement exchanges one asset for another. Same-asset legs are refused as meaningless.</li>
                  <li>The server keeps only a SHA-256 of each view key, so a database leak does not open the private records.</li>
                </ul>
              ),
            },
          ]}
        />
      </Band>

      <Band>
        <h2 className="d-h2 max-w-[915px] text-black">What changes when the contracts ship</h2>
        <p className="t-body mt-3 mb-[30px] max-w-[915px] text-black">
          Practice mode records the agreement. The audited release is meant to move the assets too, atomically: both legs settle in one
          transaction or neither does.
        </p>
        <Cards
          tone="dark"
          minH={260}
          items={[
            {
              title: "Atomic delivery against payment",
              body: "An escrow contract would hold both legs and release them together once the counterparty accepts, removing the risk that one side delivers and the other does not.",
            },
            { title: "Commitments on-chain", body: "The commitment hash would be written to the contract itself, so the public tape is the chain and not a server." },
            {
              title: "An honest limit",
              body: `Token transfers on ${CHAIN.name} are visible to everyone. The first contracts keep terms and memos private; hiding amounts on-chain needs a shielded design that is planned separately.`,
              links: [{ href: "/litepaper#contracts", label: "The contract plan" }],
            },
          ]}
        />
      </Band>

      <Band className="!pt-[25px]">
        <div className="grid grid-cols-1 items-start gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="d-h2s mb-[30px] text-black">What the public layer carries</h2>
            <BarList
              items={[
                { title: "Decentralized clock", body: `Every status is stamped with a ${CHAIN.name} block number, which no single company controls.` },
                { title: "Readable rules", body: "Formation, acceptance and expiry are documented on this site and in the litepaper." },
                { title: "Open verification", body: "Any holder of the terms and salt can recompute a commitment without asking anyone." },
              ]}
            />
          </div>
          <div className="min-w-0">
            <div className="mb-4">
              <LiveTag />
            </div>
            <LiveStrip cols={2} />
          </div>
        </div>
      </Band>

      <Band className="!pt-0">
        <Cards
          tone="dark"
          minH={240}
          items={[
            { title: "Connect", body: "Open the practice desk and watch the public tape and your private record side by side on one screen.", links: [{ href: "/connect", label: "Get connected" }] },
            { title: "Build", body: "Use the commitment rule and the signed-ticket flow to design an application that settles privately.", links: [{ href: "/build", label: "Start building" }] },
            { title: "Run", body: "Read the planned operator role: relay final states and serve sealed records without reading them.", links: [{ href: "/run", label: "Run the infrastructure" }] },
          ]}
        />
      </Band>
    </>
  );
}
