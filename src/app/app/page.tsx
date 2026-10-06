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
      <section className="night on-dark relative overflow-hidden bg-board text-white">
        <div className="ctn relative pt-[60px] pb-[60px] max-md:pt-[36px] max-md:pb-[40px]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[14px] font-semibold text-white/80">Practice desk</p>
            <PracticeTag>Practice mode: no funds move</PracticeTag>
          </div>
          <h1 className="d-h1 mt-3 max-w-[798px] text-white">
            Settle privately, prove it publicly
          </h1>
          <p className="t-sub mt-[10px] max-w-[720px] text-white">
            Propose a settlement to another wallet or draft a tokenized instrument. Each action is a free signature; the public tape shows only
            its commitment hash, its status and the {CHAIN.name} block.
          </p>
        </div>
      </section>
      <div className="ctn py-[50px] max-md:py-[30px]">
        <DeskApp />
      </div>
    </>
  );
}
