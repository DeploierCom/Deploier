import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Mark, Wordmark } from "@/components/Mark";
import { Columns, Defs, PageHead, Section } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/brand",
  title: "Brand Kit: Logo, Colours and Name Use | Deploier",
  description: "The Deploier brand kit: download the mark and wordmark, the colour values, and the rules for writing the Deploier name and the $DEPLOIER ticker correctly.",
});

const COLORS = [
  ["Ink", "#10141A"],
  ["Bond paper", "#F3F2EE"],
  ["Settlement navy", "#1C3D6E"],
  ["Seal red", "#B6402A"],
  ["Night", "#0D1320"],
];

export default function BrandPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Brand kit", path: "/brand" }])} />
      <PageHead
        kicker="Brand kit"
        title={
          <>
            The mark, the name and <em>how to use them.</em>
          </>
        }
        lede={`Writing about ${BRAND.name} or building on it? Use the files and rules below so readers can tell the official project from imitations.`}
      />
      <Section index="01" title="Logo files">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <figure className="min-w-0 border border-ink">
            <div className="grid h-48 place-items-center bg-card">
              <Mark size={96} className="text-ink" />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-ink px-4 py-3 text-[14px]">
              Mark, ink <a href="/brand/deploier-mark.svg" download className="link">SVG</a>
            </figcaption>
          </figure>
          <figure className="min-w-0 border border-ink">
            <div className="grid h-48 place-items-center bg-card">
              <Mark size={96} plate />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-ink px-4 py-3 text-[14px]">
              Mark on plate <a href="/brand/deploier-mark.webp" download className="link">WebP</a>
            </figcaption>
          </figure>
          <figure className="night min-w-0 border border-ink">
            <div className="grid h-48 place-items-center">
              <Wordmark size={40} />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[14px]">
              Wordmark on night <a href="/icon.png" download className="link">PNG icon</a>
            </figcaption>
          </figure>
        </div>
      </Section>
      <Section index="02" night title="Colours">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {COLORS.map(([name, hex]) => (
            <div key={hex} className="min-w-0 border border-line-2">
              <div className="h-20" style={{ background: hex }} />
              <p className="px-3 pt-2 text-[14px]">{name}</p>
              <p className="num px-3 pb-3 text-[13px] text-ink-3">{hex}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section index="03" title="Name and ticker rules">
        <Defs
          items={[
            ["Project name", `${BRAND.name}, capital D, one word.`],
            ["Ticker", `${BRAND.symbol}, all capitals with the dollar sign.`],
            ["Describe it as", `A ${BRAND.category} on Robinhood Chain. Not a blockchain.`],
            ["Website", BRAND.domain],
            ["X", BRAND.xHandle],
          ]}
        />
        <div className="mt-10">
          <Columns
            cols={2}
            items={[
              { title: "Please do", body: "Use the files unchanged, keep clear space around the mark equal to the width of its bar, and link to the official site." },
              { title: "Please do not", body: "Recolour or stretch the mark, combine it with another logo as if endorsed, or use the name for a different token." },
            ]}
          />
        </div>
      </Section>
    </>
  );
}
