import { CHAIN, USDG } from "@/config/brand";
import { STOCKS } from "@/config/stocks";
import { JsonLd } from "@/components/JsonLd";
import { Accordion, AssetStrip, Band, Btn, Cards, FormSection, Hero, LearnCards, SkyBand, type Art } from "@/components/kit";
import { QuoteBand } from "@/components/kit-client";
import { USE_CASES } from "@/components/site";
import { PracticeTag } from "@/components/ui";
import { PRINCIPLES } from "@/content/quotes";
import { breadcrumbLd } from "@/lib/seo";

export type UseCaseContent = {
  path: string;
  crumb: string;
  title: React.ReactNode;
  lede: string;
  art: Art;
  benefitsTitle: string;
  benefitsLede: string;
  benefits: { title: string; body: string }[];
  flowTitle: string;
  flow: { title: string; body: string }[];
  scenarios: { title: string; body: string }[];
  today: string;
  /** Optional extra block placed after the benefits (for example the financing orbit). */
  extra?: React.ReactNode;
};

const ASSETS = [
  { symbol: "ETH", name: "Gas asset" },
  { symbol: "WETH", name: "Wrapped ether" },
  { symbol: USDG.symbol, name: USDG.name },
  ...STOCKS.map((s) => ({ symbol: s.symbol, name: s.name })),
];

/** Shared layout for the use-case pages. */
export function UseCasePage({ c }: { c: UseCaseContent }) {
  const others = USE_CASES.filter((u) => u.href !== c.path);
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: c.crumb, path: c.path }])} />
      <Hero art={c.art} title={c.title} sub={c.lede}>
        <Btn href="/app" small>
          Try it on the practice desk
        </Btn>
      </Hero>

      <Band>
        <h2 className="d-h2 max-w-[682px] text-black">{c.benefitsTitle}</h2>
        <p className="mt-[10px] mb-[24px] max-w-[682px] text-[16px] leading-[24px] text-ink-2">{c.benefitsLede}</p>
        <Cards cols={2} titleTone="violet" minH={210} items={c.benefits} />
      </Band>

      {c.extra}

      <Band>
        <div className="grid grid-cols-1 gap-x-[15px] gap-y-8 lg:grid-cols-2">
          <h2 className="d-h2 max-w-[524px] text-black lg:pt-2">{c.flowTitle}</h2>
          <div className="min-w-0">
            <Accordion group={`flow-${c.path}`} items={c.flow.map((f, i) => ({ q: `${i + 1}. ${f.title}`, a: <p>{f.body}</p> }))} />
          </div>
        </div>
      </Band>

      <SkyBand title={`Get started on ${CHAIN.name} today`} action={<Btn href="/app" tone="ink">Open the practice desk</Btn>}>
        <p>{c.today}</p>
        <p>
          <PracticeTag>Practice mode until audited contracts ship</PracticeTag>
        </p>
      </SkyBand>

      <AssetStrip
        title={`Settles against assets on ${CHAIN.name}`}
        note="Real assets a settlement can name today. They are issued by others; none of their issuers is a partner of this project."
        assets={ASSETS}
      />

      <FormSection dark title="Ready to try it?" tagline="Run this flow with two wallets on the practice desk." topic={c.crumb} id="try">
        <p className="mb-4">Where it fits:</p>
        <ul>
          {c.scenarios.map((s) => (
            <li key={s.title}>
              <strong className="font-semibold">{s.title}.</strong> {s.body}
            </li>
          ))}
        </ul>
      </FormSection>

      <QuoteBand quotes={PRINCIPLES} />

      <LearnCards
        items={[
          ...others.slice(0, 2).map((u) => ({ href: u.href, title: `${u.label}: ${u.note}` })),
          { href: "/litepaper", title: "The litepaper: private settlement in one read" },
        ]}
      />
    </>
  );
}
