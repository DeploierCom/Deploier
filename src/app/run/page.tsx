import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Band, BarList, Btn, Cards, FormSection, Hero, Split } from "@/components/kit";
import { QuoteBand } from "@/components/kit-client";
import { TargetTag } from "@/components/ui";
import { PRINCIPLES } from "@/content/quotes";
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
      <Hero
        art={{ src: "/art/waves.svg", className: "top-[-40px] right-0 h-[calc(100%+40px)] w-[55%] object-cover object-left-top" }}
        title="Operate the layer, never read the deals"
        sub="A settlement layer needs people who keep it running. The operator role is designed so that running the infrastructure gives no view into the business on it."
      >
        <TargetTag>Operator programme: planned</TargetTag>
      </Hero>

      <Band>
        <p className="d-h2s max-w-[1100px] text-black">
          Relay final states, serve sealed records to the parties who hold their keys and keep the public tape honest, on a layer built so
          that operators never see what was agreed.
        </p>
      </Band>

      <Band className="!pt-[25px]">
        <Split title="Grow with the network">
          <p>
            How operators would be chosen and paid is still open. The design starts from a few principles: rewards should follow the work
            done, measured against public data anyone can check; operators serve every valid record in order, because choosing whose
            settlement to relay first would breach the role.
          </p>
          <p>
            The {BRAND.symbol} token is expected to play a part in operator bonding and fees. The exact design will be published before any
            operator joins. Infrastructure providers and custodians are the natural first operators, and interest can be registered today.
          </p>
          <div className="pt-[26px]">
            <Btn href="/litepaper">Read the litepaper</Btn>
          </div>
        </Split>
      </Band>

      <section className="night on-dark py-[75px] max-md:py-[50px]">
        <div className="ctn grid grid-cols-1 gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0 lg:pr-[100px]">
            <h2 className="d-h2s text-white">What an operator would do</h2>
            <p className="t-body mt-5 text-white">
              These duties exist today inside the single practice server. The plan is to spread them across independent operators, each
              anchored to {CHAIN.name} blocks that no operator controls.
            </p>
            <div className="mt-[30px] flex flex-wrap gap-[10px]">
              <Btn href="/settlement" small>
                Settlement layer
              </Btn>
              <Btn href="/contact" small>
                Register interest
              </Btn>
            </div>
          </div>
          <div className="min-w-0">
            <ul className="space-y-[20px]">
              {[
                ["Relay", `Pass signed proposals and acceptances to the settlement contract on ${CHAIN.name} and report the resulting block.`],
                ["Store sealed records", "Hold encrypted private records for parties who want redundancy, readable only with the view key."],
                ["Publish the tape", "Serve the public list of commitments and statuses so anyone can audit what the layer has settled."],
                ["Raise the alarm", "Flag a commitment that does not match the contract state, or a relay that stops answering."],
              ].map(([t, b]) => (
                <li key={t} className="border-l-[3px] border-accent pl-[17px]">
                  <h3 className="d-acc text-white">{t}</h3>
                  <p className="t-body mt-1 text-white/85">{b}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <QuoteBand quotes={PRINCIPLES} />

      <section className="night on-dark py-[75px] max-md:py-[50px]">
        <div className="ctn">
          <div className="mx-auto max-w-[960px]">
            <h2 className="d-h2 text-center text-white">What an operator can never do</h2>
            <p className="t-body mx-auto mt-3 max-w-[640px] text-center text-white/85">
              The design goal is that a dishonest operator can stall at worst, never steal or spy.
            </p>
            <Cards
              className="mt-[40px]"
              tone="outline"
              items={[
                { title: "Read terms", body: "Records are opened with view keys the operator never receives." },
                { title: "Forge consent", body: "Acceptances are wallet signatures. An operator cannot produce one." },
                { title: "Rewrite history", body: "Commitments and final states are anchored to chain blocks that no operator controls." },
              ]}
            />
          </div>
        </div>
      </section>

      <FormSection title="Interested in running a desk?" tagline="Tell the team who you are and what infrastructure you operate today." topic="run">
        <BarList
          items={[
            { title: "Earned by uptime", body: "Rewards follow measurable work, not stake size alone." },
            { title: "Neutral by rule", body: "Every valid record is served in order." },
            { title: "Open to qualified firms", body: "Infrastructure providers and custodians first." },
          ]}
        />
      </FormSection>
    </>
  );
}
