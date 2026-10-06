import Link from "next/link";
import { BRAND, CHAIN, PONS, TOKEN, isAddress } from "@/config/brand";
import { CopyCaBlock } from "@/components/CopyCa";
import { JsonLd } from "@/components/JsonLd";
import { TokenFacts } from "@/components/TokenFacts";
import { Columns, CtaBand, PageHead, Section } from "@/components/ui";
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
      <PageHead
        kicker={`${BRAND.symbol} · ${CHAIN.name}`}
        title={
          <>
            {BRAND.name} ({BRAND.symbol}) <em>token</em>
          </>
        }
        lede={`${BRAND.symbol} is the token of the ${BRAND.name} settlement layer on ${CHAIN.name}. This page is the one official source for its contract address.`}
      >
        <Link href="/swap" className="btn btn-accent">
          Swap page <span className="arr">→</span>
        </Link>
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn btn-ghost">
          Launch news on X
        </a>
      </PageHead>

      <Section index="01" title="Official contract address" lede={live ? `Copy it from here or from the site header. Check it on the explorer before you trade.` : "Contract address coming soon. It is published here and in the site header at launch, and nowhere else."}>
        <CopyCaBlock />
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
          {live && TOKEN.explorerUrl ? (
            <a href={TOKEN.explorerUrl} target="_blank" rel="noreferrer" className="link">
              View on the Robinhood Chain explorer
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
      </Section>

      <Section index="02" night title="On-chain facts" lede="Read directly from the token contract once it exists. Nothing here is typed in by hand.">
        <TokenFacts />
      </Section>

      <Section index="03" title="What the token is for" lede="Intended roles, tied to parts of the system that are still being built.">
        <Columns
          items={[
            { title: "Operator bonding", body: "Operators who relay settlements would bond tokens as a guarantee of good behaviour. Planned with the operator programme." },
            { title: "Settlement fees", body: "Fees on settled records could be paid or discounted in the token. Planned with the audited contracts." },
            { title: "Community", body: "The token gives early supporters a stake in the project's direction while the layer is built in public." },
          ]}
        />
        <p className="mt-8 max-w-[760px] text-[14.5px] text-ink-3">
          {BRAND.symbol} carries no claim on revenue, assets or profits and is not an offer of securities. Crypto tokens are volatile and
          can lose all value.
        </p>
      </Section>

      <CtaBand title="Get ready for launch" body={`Connect a wallet and add ${CHAIN.name} now, so you are set when the address goes live.`}>
        <Link href="/connect" className="btn btn-accent">
          Connect a wallet <span className="arr">→</span>
        </Link>
      </CtaBand>
    </>
  );
}
