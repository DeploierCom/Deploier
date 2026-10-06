import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Columns, CtaBand, PageHead, Rows, Section, TargetTag } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/run",
  title: "Run a Settlement Desk on Deploier | Deploier",
  description:
    "The planned operator role in Deploier: watch commitments, relay final states and serve view-key holders on Robinhood Chain, without ever seeing private terms.",
});

export default function RunPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Run", path: "/run" }])} />
      <PageHead
        kicker="Run"
        title={
          <>
            Operate the layer. <em>Never</em> read the deals.
          </>
        }
        lede={`A settlement layer needs people who keep it running: relaying final states, serving records to the parties who hold their keys, and watching for anything that breaks the rules. ${BRAND.name} plans an operator role designed so that running the infrastructure gives no view into the business on it.`}
      >
        <TargetTag>Operator programme: planned</TargetTag>
      </PageHead>

      <Section index="01" title="What an operator would do" lede="These duties exist today inside the single practice server. The plan is to spread them across independent operators.">
        <Rows
          items={[
            { title: "Relay", body: `Pass signed proposals and acceptances to the settlement contract on ${CHAIN.name} and report the resulting block.` },
            { title: "Store sealed records", body: "Hold encrypted private records for parties who want redundancy, readable only with the view key." },
            { title: "Publish the tape", body: "Serve the public list of commitments and statuses so anyone can audit what the layer has settled." },
            { title: "Raise the alarm", body: "Flag a commitment that does not match the contract state, or a relay that stops answering." },
          ]}
        />
      </Section>

      <Section index="02" night title="What an operator can never do" lede="The design goal is that a dishonest operator can stall at worst, never steal or spy.">
        <Columns
          items={[
            { title: "Read terms", body: "Records are opened with view keys the operator never receives." },
            { title: "Forge consent", body: "Acceptances are wallet signatures. An operator cannot produce one." },
            { title: "Rewrite history", body: "Commitments and final states are anchored to chain blocks that no operator controls." },
          ]}
        />
      </Section>

      <Section index="03" title="Grow with the network" lede="How operators would be chosen and paid is still open. These are the principles the design starts from.">
        <Columns
          cols={2}
          items={[
            { title: "Earned by uptime, not by stake size alone", body: "Rewards should follow the work done, measured against public data anyone can check." },
            { title: "Neutral by rule", body: "Operators would serve every valid record in order. Choosing whose settlement to relay first would breach the role." },
            { title: `A place for ${BRAND.symbol}`, body: "The token is expected to play a part in operator bonding and fees. The exact design will be published before any operator joins." },
            { title: "Open to qualified firms", body: "Infrastructure providers and custodians are the natural first operators. Interest can be registered through the contact page." },
          ]}
        />
      </Section>

      <CtaBand title="Interested in running a desk?" body="Tell the team who you are and what infrastructure you operate today.">
        <Link href="/contact" className="btn btn-accent">
          Contact the team <span className="arr">→</span>
        </Link>
      </CtaBand>
    </>
  );
}
