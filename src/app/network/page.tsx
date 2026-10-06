import Link from "next/link";
import { BRAND, CHAIN, PONS, USDG, WETH, explorerAddress } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { LiveStrip, StockBoard } from "@/components/live";
import { CtaBand, Defs, LiveTag, PageHead, Section } from "@/components/ui";
import { AccessButton } from "@/components/wallet/WalletButton";
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
      <PageHead
        kicker="Live network"
        title={
          <>
            {CHAIN.name}, <em>as it is</em> right now.
          </>
        }
        lede={`Everything ${BRAND.name} settles against is already on ${CHAIN.name}. This page reads it live: blocks, gas, the dollar token and the tokenized stocks, each linked to the public explorer so you can check the source yourself.`}
      >
        <AccessButton />
      </PageHead>

      <Section index="01" title="Chain readings" lede="Polled every few seconds from the public RPC. If a read fails, the tile says so instead of guessing.">
        <div className="mb-8">
          <LiveTag />
        </div>
        <LiveStrip />
      </Section>

      <Section
        index="02"
        title="Tokenized stocks on the chain"
        lede="Each token below was verified on-chain as an official stock token: its contract points at the issuer's beacon, its symbol matches and its name says so. Prices come from Chainlink."
      >
        <StockBoard />
      </Section>

      <Section index="03" night title="Network facts and contract addresses" lede="The fixed facts the site is built on. Add the network to your wallet with the button above, or by hand with these values.">
        <Defs
          items={[
            ["Network", CHAIN.name],
            ["Chain id", `${CHAIN.id} (${CHAIN.hex})`],
            ["Gas asset", `${CHAIN.nativeSymbol} (18 decimals)`],
            ["Public RPC", <span key="rpc" className="num text-[13.5px] break-all">{CHAIN.publicRpc}</span>],
            ["Explorer", <a key="exp" href={CHAIN.explorer} target="_blank" rel="noreferrer" className="link">{CHAIN.explorer.replace("https://", "")}</a>],
            [`${USDG.symbol} (${USDG.name})`, addr(USDG.address)],
            ["WETH", addr(WETH)],
            ["Pons launch factory", addr(PONS.factory)],
            [`${BRAND.symbol}`, <span key="ca">Contract address coming soon. It will appear here and on the token page at launch.</span>],
          ]}
        />
      </Section>

      <CtaBand title="Put these assets through a private settlement" body="Pick USDG, WETH or any stock token above as a leg on the practice desk.">
        <Link href="/app" className="btn btn-accent">
          Open the practice desk <span className="arr">→</span>
        </Link>
      </CtaBand>
    </>
  );
}
