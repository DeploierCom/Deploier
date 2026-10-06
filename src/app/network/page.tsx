import { BRAND, CHAIN, PONS, USDG, WETH, explorerAddress } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { AssetStrip, Band, Btn, Hero, Intro, SkyBand, Split } from "@/components/kit";
import { LiveStrip, StockBoard } from "@/components/live";
import { Defs, LiveTag } from "@/components/ui";
import { AccessButton } from "@/components/wallet/WalletButton";
import { STOCKS } from "@/config/stocks";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/network",
  title: "Live Robinhood Chain Network Data | Deploier",
  description:
    "Live data behind Deploier: the latest Robinhood Chain block, gas, ETH price, USDG supply and Chainlink prices for the tokenized stocks it settles against.",
});

const addr = (a: string) => (
  <a href={explorerAddress(a)} target="_blank" rel="noreferrer" className="link num text-[13.5px] break-all">
    {a}
  </a>
);

export default function NetworkPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Live network", path: "/network" }])} />
      <Hero
        art={{ src: "/art/planes.svg", className: "top-[30px] right-[-60px] w-[640px] max-[1199.98px]:w-[460px]" }}
        title={`${CHAIN.name}, as it is right now`}
        sub="Blocks, gas, the dollar token and the tokenized stocks, read live and linked to the public explorer so you can check every source."
      >
        <AccessButton className="btn-sm" />
      </Hero>

      <Intro>
        Everything {BRAND.name} settles against is already on {CHAIN.name}. Readings are polled every few seconds from the public RPC; if a
        read fails, the tile says so instead of guessing.
      </Intro>

      <Band className="!pt-[40px]">
        <div className="mb-4">
          <LiveTag />
        </div>
        <LiveStrip />
      </Band>

      <Band className="!pt-0">
        <h2 className="d-h2 max-w-[915px] text-black">Tokenized stocks on the chain</h2>
        <p className="t-body mt-3 mb-[30px] max-w-[915px] text-black">
          Each token below was verified on-chain as an official stock token: its contract points at the issuer&apos;s beacon, its symbol matches
          and its name says so. Prices come from Chainlink.
        </p>
        <StockBoard />
      </Band>

      <AssetStrip
        title={`Assets live on ${CHAIN.name}`}
        note={`The assets a ${BRAND.name} settlement can name. They are issued by others, not by ${BRAND.name}, and none of their issuers is a partner.`}
        assets={[
          { symbol: "ETH", name: "Gas asset" },
          { symbol: "WETH", name: "Wrapped ether" },
          { symbol: USDG.symbol, name: USDG.name },
          ...STOCKS.map((s) => ({ symbol: s.symbol, name: s.name })),
        ]}
      />

      <Band>
        <Split title="Network facts and contract addresses">
          <p>The fixed facts the site is built on. Add the network to your wallet with the button above, or by hand with these values.</p>
          <div className="pt-4">
            <Defs
              items={[
                ["Network", CHAIN.name],
                ["Chain id", `${CHAIN.id} (${CHAIN.hex})`],
                ["Gas asset", `${CHAIN.nativeSymbol} (18 decimals)`],
                ["Public RPC", <span key="rpc" className="num text-[13.5px] break-all">{CHAIN.publicRpc}</span>],
                [
                  "Explorer",
                  <a key="exp" href={CHAIN.explorer} target="_blank" rel="noreferrer" className="link">
                    {CHAIN.explorer.replace("https://", "")}
                  </a>,
                ],
                [`${USDG.symbol} (${USDG.name})`, addr(USDG.address)],
                ["WETH", addr(WETH)],
                ["Pons launch factory", addr(PONS.factory)],
                [`${BRAND.symbol}`, <span key="ca">Contract address coming soon. It will appear here and on the token page at launch.</span>],
              ]}
            />
          </div>
        </Split>
      </Band>

      <SkyBand title="Put these assets through a private settlement" action={<Btn href="/app" tone="ink">Open the practice desk</Btn>}>
        <p>Pick USDG, WETH or any stock token above as a leg on the practice desk. Nothing moves; you sign two messages and compare the public and private views.</p>
      </SkyBand>
    </>
  );
}
