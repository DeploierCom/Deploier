import { BRAND, CHAIN } from "@/config/brand";
import { Hero, Prose } from "@/components/kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/terms",
  title: "Terms of Use for the Deploier Website | Deploier",
  description: "Terms of use for the Deploier website and practice desk on Robinhood Chain: practice mode moves no funds, nothing here is advice, and use is at your own risk.",
});

const P = [
  ["The site", `This website presents ${BRAND.name}, a ${BRAND.category} on ${CHAIN.name}, and a practice desk. By using it you accept these terms.`],
  ["Practice mode", "The desk records signed practice actions. It sends no transactions, moves no assets and creates no rights or obligations between wallets."],
  ["No advice", `Nothing on this site is financial, legal or tax advice, and nothing is an offer to sell or a solicitation to buy ${BRAND.symbol} or any other asset.`],
  ["Your wallet", "You control your wallet and keys. Only sign messages you have read. The site never needs your private key or seed phrase."],
  ["Third parties", `Live data comes from ${CHAIN.name} RPC endpoints, Chainlink feeds and public market APIs. They may be delayed or wrong; the site shows a reading as unavailable when it fails.`],
  ["Availability", "The site and the desk may change, pause or lose practice records at any time. Practice records carry no value."],
  ["Liability", "The site is provided as is. To the extent the law allows, the team is not liable for losses arising from its use."],
];

export default function TermsPage() {
  return (
    <>
      <Hero title="Terms of use" sub="Last updated 6 October 2026." />
      <section className="py-[60px] max-md:py-[40px]">
        <div className="ctn">
          <Prose>
            {P.map(([h, b]) => (
              <section key={h}>
                <h2>{h}</h2>
                <p>{b}</p>
              </section>
            ))}
          </Prose>
        </div>
      </section>
    </>
  );
}
