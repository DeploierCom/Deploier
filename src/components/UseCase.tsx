import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { USE_CASES } from "@/components/site";
import { Columns, CtaBand, PageHead, PracticeTag, Rows, Section } from "@/components/ui";
import { breadcrumbLd } from "@/lib/seo";

export type UseCaseContent = {
  path: string;
  crumb: string;
  kicker: string;
  title: React.ReactNode;
  lede: string;
  benefitsTitle: string;
  benefits: { title: string; body: string }[];
  flowTitle: string;
  flow: { title: string; body: string }[];
  scenarios: { title: string; body: string }[];
  scenariosTitle: string;
  today: string;
  extra?: React.ReactNode;
  extraTitle?: string;
  extraLede?: string;
};

/** Shared layout for the four use-case pages. */
export function UseCasePage({ c }: { c: UseCaseContent }) {
  const others = USE_CASES.filter((u) => u.href !== c.path);
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: c.crumb, path: c.path }])} />
      <PageHead kicker={c.kicker} title={c.title} lede={c.lede}>
        <Link href="/app" className="btn btn-accent">
          Try it on the practice desk <span className="arr">→</span>
        </Link>
      </PageHead>

      <Section index="01" title={c.benefitsTitle}>
        <Columns cols={c.benefits.length === 4 ? 2 : 3} items={c.benefits} />
      </Section>

      <Section index="02" night title={c.flowTitle}>
        <Rows items={c.flow} />
      </Section>

      <Section index="03" title={c.scenariosTitle}>
        <Columns cols={2} items={c.scenarios} />
      </Section>

      {c.extra ? (
        <Section index="04" title={c.extraTitle ?? ""} lede={c.extraLede}>
          {c.extra}
        </Section>
      ) : null}

      <Section index={c.extra ? "05" : "04"} title="What you can do today" lede={c.today}>
        <PracticeTag>Practice mode until audited contracts ship</PracticeTag>
        <div className="mt-10">
          <p className="eyebrow">Other use cases</p>
          <ul className="mt-3 border-t border-ink">
            {others.map((u) => (
              <li key={u.href} className="border-b border-line">
                <Link href={u.href} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 hover:text-stamp">
                  <span className="serif text-[24px]">{u.label}</span>
                  <span className="text-[14.5px] text-ink-3">{u.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <CtaBand title="Run this flow with two wallets" body="The desk records the agreement privately and puts only its hash on the public tape.">
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
