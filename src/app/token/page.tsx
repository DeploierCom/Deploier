import { BRAND, CHAIN, PONS, TOKEN, isAddress } from "@/config/brand";
import { CopyCaBlock } from "@/components/CopyCa";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Cards, Hero, SkyBand } from "@/components/kit";
import { TokenFacts } from "@/components/TokenFacts";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/token",
  title: `${BRAND.name} (${BRAND.symbol}) Token on Robinhood Chain`,
  description: `The ${BRAND.name} token, ${BRAND.symbol}, on Robinhood Chain: the official contract address, live on-chain facts, where it trades and what the token is meant to do.`,
});

export default function TokenPage() {
  const live = TOKEN.isLive;
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: `${BRAND.symbol} token`, path: "/token" }])} />
      <Hero
        art={{ src: "/art/mark-stack.svg", className: "top-[10px] right-[40px] w-[440px] max-[1199.98px]:w-[340px]" }}
        title={`${BRAND.name} (${BRAND.symbol}) token`}
        sub={`${BRAND.symbol} is the token of the ${BRAND.name} settlement layer on ${CHAIN.name}. This page is the one official source for its contract address.`}
      >
        <Btn href="/swap" small>
          Swap page
        </Btn>
        <Btn href={BRAND.x} tone="ghost" small>
          Launch news on X
        </Btn>
      </Hero>

      <Band>
        <div className="grid grid-cols-1 gap-x-[15px] gap-y-6 lg:grid-cols-2">
          <div className="min-w-0">
            <h2 className="d-h2 text-black">Official contract address</h2>
            <p className="mt-[10px] max-w-[540px] text-[16px] leading-[24px] text-black">
              {live
                ? "Copy it from here or from the site header. Check it on the explorer before you trade."
                : "Contract address coming soon. It is published here and in the site header at launch, and nowhere else."}
            </p>
          </div>
          <div className="min-w-0">
            <CopyCaBlock />
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
              {live && TOKEN.explorerUrl ? (
                <a href={TOKEN.explorerUrl} target="_blank" rel="noreferrer" className="link">
                  View on the {CHAIN.name} explorer
                </a>
              ) : (
                <span className="text-ink-3">Explorer link at launch</span>
              )}
              {live && isAddress(BRAND.ca) ? (
                <a href={PONS.page(BRAND.ca)} target="_blank" rel="noreferrer" className="link">
                  Launch page on Pons
                </a>
              ) : (
                <span className="text-ink-3">Pons launch page at launch</span>
              )}
            </div>
          </div>
        </div>
      </Band>

      <section className="night on-dark py-[75px] max-md:py-[50px]">
        <div className="ctn">
          <h2 className="d-h2 text-white">On-chain facts</h2>
          <p className="t-body mt-3 mb-[30px] max-w-[760px] text-white/85">Read directly from the token contract once it exists. Nothing here is typed in by hand.</p>
          <TokenFacts />
        </div>
      </section>

      <Band>
        <h2 className="d-h2 text-black">What the token is for</h2>
        <p className="t-body mt-3 mb-[30px] max-w-[760px] text-black">Intended roles, tied to parts of the system that are still being built.</p>
        <Cards
          minH={200}
          items={[
            { title: "Operator bonding", body: "Operators who relay settlements would bond tokens as a guarantee of good behaviour. Planned with the operator programme." },
            { title: "Settlement fees", body: "Fees on settled records could be paid or discounted in the token. Not part of the settlement contracts: they charge no fee today." },
            { title: "Community", body: "The token gives early supporters a stake in the project's direction while the layer is built in public." },
          ]}
        />
        <p className="mt-8 max-w-[760px] text-[14px] text-ink-3">
          {BRAND.symbol} carries no claim on revenue, assets or profits and is not an offer of securities. Crypto tokens are volatile and can
          lose all value.
        </p>
      </Band>

      <SkyBand title="Get ready for launch" action={<Btn href="/connect" tone="ink">Connect a wallet</Btn>}>
        <p>Connect a wallet and add {CHAIN.name} now, so you are set when the address goes live.</p>
      </SkyBand>
    </>
  );
}
