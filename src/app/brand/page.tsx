import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Mark, Wordmark } from "@/components/Mark";
import { Band, Btn, Hero, Split } from "@/components/kit";
import { Defs } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/brand",
  title: "Brand Kit: Logo, Colours and Name Use | Deploier",
  description: "The Deploier brand kit: download the mark and wordmark, the colour values, and the rules for writing the Deploier name and the $DEPLOIER ticker correctly.",
});

const COLORS = [
  ["Night", "#1B1B1B"],
  ["Mint", "#A3FFD1"],
  ["Paper", "#FFFFFF"],
  ["Mist", "#F5F5F5"],
  ["Violet", "#6D38FF"],
  ["Sky", "#A8E2FA"],
];

const LOGOS = [
  { name: "Mark on night", file: "/brand/deploier-mark.svg", label: "SVG", dark: true, node: <Mark size={96} /> },
  { name: "Mark on paper", file: "/brand/deploier-mark.svg", label: "SVG", dark: false, node: <Mark size={96} tone="ink" /> },
  { name: "Mark on plate", file: "/brand/deploier-mark.webp", label: "WebP", dark: false, node: <Mark size={96} plate /> },
  { name: "Wordmark on night", file: "/icon.png", label: "PNG icon", dark: true, node: <Wordmark size={30} /> },
];

export default function BrandPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Brand kit", path: "/brand" }])} />
      <Hero
        mesh
        art={{ src: "/art/mark-stack.svg", className: "top-[10px] right-[40px] w-[440px] max-[1199.98px]:w-[340px]" }}
        title="Brand kit and name use"
        sub={`Writing about ${BRAND.name} or building on it? Use the files and rules below so readers can tell the official project from imitations.`}
      />

      <Band>
        <h2 className="d-h2 text-black">Name and ticker guidelines</h2>
        <p className="d-h2s mt-[30px] max-w-[915px] text-black">
          In short: use the name and the mark to point at the official project, never to name your own product, token or domain.
        </p>
        <div className="mt-[30px] max-w-[915px]">
          <Defs
            items={[
              ["Project name", `${BRAND.name}, capital D, one word.`],
              ["Ticker", `${BRAND.symbol}, all capitals with the dollar sign.`],
              ["Describe it as", `A ${BRAND.category} on Robinhood Chain. Not a blockchain.`],
              ["Website", BRAND.domain],
              ["X", BRAND.xHandle],
            ]}
          />
          <div className="mt-8 grid grid-cols-1 gap-8 text-[16px] leading-[24px] font-light text-black md:grid-cols-2">
            <div>
              <h3 className="font-semibold">Please do</h3>
              <p className="mt-2">Use the files unchanged, keep clear space around the mark equal to the width of its bar, and link to the official site.</p>
            </div>
            <div>
              <h3 className="font-semibold">Please do not</h3>
              <p className="mt-2">Recolour or stretch the mark, combine it with another logo as if endorsed, or use the name for a different token.</p>
            </div>
          </div>
        </div>
      </Band>

      <Band>
        <Split title={`${BRAND.name} colour guide`}>
          <p>For press, partners and builders. The palette below is the whole system: one night tone, one mint accent, white and a soft grey, with violet for links.</p>
          <div className="pt-[20px]">
            <Btn href="/brand/deploier-mark.svg" small>
              Download the mark
            </Btn>
          </div>
        </Split>
        <ul className="mt-[40px] grid grid-cols-2 gap-[15px] sm:grid-cols-3 lg:grid-cols-6">
          {COLORS.map(([name, hex]) => (
            <li key={hex} className="min-w-0 overflow-hidden rounded-[16px] bg-paper-2">
              <div className="h-24 border-b border-black/5" style={{ background: hex }} />
              <p className="px-4 pt-3 text-[14px] font-semibold text-black">{name}</p>
              <p className="num px-4 pb-4 text-[13px] text-ink-3">{hex}</p>
            </li>
          ))}
        </ul>
      </Band>

      <Band className="!pt-0">
        <h2 className="d-h2 text-black">{BRAND.name} logos</h2>
        <ul className="mt-[20px] grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
          {LOGOS.map((l) => (
            <li key={l.name} className="min-w-0">
              <div className={`grid aspect-square place-items-center rounded-[16px] ${l.dark ? "bg-board" : "bg-paper-2"}`}>{l.node}</div>
              <p className="mt-3 text-[16px] text-black">{l.name}</p>
              <a href={l.file} download className="text-[13px] font-semibold text-stamp hover:underline">
                Download {l.label} ↓
              </a>
            </li>
          ))}
        </ul>
      </Band>
    </>
  );
}
