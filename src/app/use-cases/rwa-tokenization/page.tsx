import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { ArtImg, Band, Btn, FormSection, Hero, More } from "@/components/kit";
import { StockBoard } from "@/components/live";
import { PracticeTag } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/use-cases/rwa-tokenization",
  title: "RWA Tokenization: Treasuries, Equities, ETFs | Deploier",
  description:
    "Deploier for RWA tokenization: issue treasury bills, fund shares and equities on Robinhood Chain to allowlisted holders, with private cap tables.",
});

const PARTS = [
  {
    id: "issuing",
    title: "Issuing a tokenized treasury bill",
    body: "Describe the instrument, restrict who may hold it, sign once and distribute through private settlements.",
  },
  {
    id: "live-stocks",
    title: "Stock tokens already on the chain",
    body: "Apple, Alphabet, NVIDIA and Tesla tokens are live with Chainlink prices: the first assets a settlement can name.",
  },
  {
    id: "where-it-fits",
    title: "Where tokenization fits",
    body: "Treasury departments and fund managers that need an allowlist, a private book and settlement at any hour.",
  },
];

export default function Page() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "RWA tokenization", path: "/use-cases/rwa-tokenization" }])} />
      <Hero
        art={{ src: "/art/planes-wide.svg", className: "top-[120px] right-[-80px] w-[860px] max-[1199.98px]:w-[600px] opacity-90" }}
        title="Treasuries, equities and funds, on-chain and discreet"
        sub="Tokenizing a real-world asset should not mean publishing who owns it."
      />

      <section className="pt-[30px]">
        <div className="ctn space-y-3 text-[16px] leading-[24px] font-light text-black">
          <p>
            {BRAND.name} treats an issuance as a private record with a public commitment: the instrument, its size and its eligible holders stay
            with the issuer, and anyone can still verify that the issuance happened and has not been altered.
          </p>
          <p>
            Every instrument carries the list of addresses allowed to hold it, transfers outside the list are refused by rule, and issued units
            can be delivered against USDG or the stock tokens already live on {CHAIN.name}. Read on for the flow, the live assets and where it
            fits.
          </p>
        </div>
      </section>

      <Band>
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-3">
          {PARTS.map((p) => (
            <div key={p.id} className="flex min-w-0 flex-col rounded-[16px] bg-[#fafbf2] px-[30px] pt-[35px] pb-[30px] shadow-[inset_0_0_0_1px_#eef0e2]">
              <h2 className="d-h4 text-black">{p.title}</h2>
              <p className="t-body mt-3 text-black">{p.body}</p>
              <More href={`#${p.id}`} className="mt-auto pt-6">
                Jump to section
              </More>
            </div>
          ))}
        </div>
      </Band>

      <section id="issuing" className="night on-dark scroll-mt-24 py-[75px] max-md:py-[50px]">
        <div className="ctn grid grid-cols-1 items-center gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0 max-lg:order-2">
            <ArtImg art={{ src: "/art/ingots.svg" }} className="mx-auto block h-auto w-full max-w-[520px]" />
          </div>
          <div className="min-w-0 lg:pl-[40px]">
            <h2 className="d-h2s text-white">Issuing a tokenized treasury bill</h2>
            <p className="mt-4 text-[14px] font-semibold text-white">Four steps, one signature, a private cap table</p>
            <ol className="t-body mt-5 list-decimal space-y-3 pl-5 text-white">
              <li>
                <strong className="font-semibold">Describe.</strong> The issuer names the bill, its symbol, units, face value per unit and
                maturity date.
              </li>
              <li>
                <strong className="font-semibold">Restrict.</strong> It lists the eligible holder addresses, up to five in practice mode.
              </li>
              <li>
                <strong className="font-semibold">Sign.</strong> The issuer signs the issuance in plain words. A commitment and the current block
                go on the public tape.
              </li>
              <li>
                <strong className="font-semibold">Distribute.</strong> Holders buy units through private settlements, each one a separate sealed
                record. A regulator can be shown the cap table through a single view key.
              </li>
            </ol>
            <div className="mt-[30px] flex flex-wrap items-center gap-3">
              <Btn href="/app" small>
                Draft an instrument
              </Btn>
              <PracticeTag>No token is minted in practice mode</PracticeTag>
            </div>
          </div>
        </div>
      </section>

      <section id="live-stocks" className="night on-dark scroll-mt-24 py-[75px] max-md:py-[50px]">
        <div className="ctn grid grid-cols-1 items-start gap-x-[15px] gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="min-w-0 lg:pr-[60px]">
            <h2 className="d-h2s text-white">Tokenized stocks already live on {CHAIN.name}</h2>
            <p className="mt-4 text-[14px] font-semibold text-white">Real tokens, real feeds, not issued by {BRAND.name}</p>
            <p className="t-body mt-5 text-white">
              These are real tokens issued by Robinhood, with live Chainlink prices. They are the first assets a {BRAND.name} settlement can
              name, and the natural other leg for an issued bill or fund share.
            </p>
            <div className="mt-[30px]">
              <Btn href="/network" small>
                Live network data
              </Btn>
            </div>
          </div>
          <StockBoard />
        </div>
      </section>

      <FormSection
        id="where-it-fits"
        title="Where tokenization fits"
        tagline="Draft an instrument on the practice desk, set its allowlist and record a signed practice issuance."
        topic="rwa-tokenization"
      >
        <ul>
          <li>
            <strong className="font-semibold">Treasury departments.</strong> Corporates issuing short-dated paper to known investors without
            disclosing the book.
          </li>
          <li>
            <strong className="font-semibold">Fund managers.</strong> Money market and ETF-style share classes offered to an allowlist, with
            settlement at any hour.
          </li>
          <li>
            <strong className="font-semibold">Equity settlement.</strong> Delivery of stock tokens against USDG between two known desks, with
            the size and price kept private.
          </li>
        </ul>
        <p className="mt-4 text-[14px] text-black/75">No token is minted until the issuance contract is audited and deployed.</p>
      </FormSection>
    </>
  );
}
