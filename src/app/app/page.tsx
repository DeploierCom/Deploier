import { BRAND, CHAIN } from "@/config/brand";
import { DeskApp } from "@/components/desk/DeskApp";
import { JsonLd } from "@/components/JsonLd";
import { PracticeTag } from "@/components/ui";
import { appLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/app",
  title: `Practice Desk: Private Settlement | ${BRAND.name}`,
  description: `The ${BRAND.name} practice desk on ${CHAIN.name}: propose and accept private settlements and record tokenized-asset issuances with free wallet signatures.`,
  noindex: true,
});

export default function AppPage() {
  return (
    <>
      <JsonLd data={appLd} />
      <section className="border-b border-ink">
        <div className="wrap wrap-wide py-10">
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow">Practice desk</p>
            <PracticeTag>Practice mode: no funds move</PracticeTag>
          </div>
          <h1 className="h-display mt-3 text-[40px] sm:text-[52px]">
            Settle privately. <em>Prove it publicly.</em>
          </h1>
          <p className="lede mt-4 max-w-[720px]">
            Propose a settlement to another wallet or draft a tokenized instrument. Each action is a free signature; the public tape on the
            right shows only its commitment hash, its status and the {CHAIN.name} block.
          </p>
        </div>
      </section>
      <div className="wrap wrap-wide py-10">
        <DeskApp />
      </div>
    </>
  );
}
