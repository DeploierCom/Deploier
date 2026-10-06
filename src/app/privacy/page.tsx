import { BRAND } from "@/config/brand";
import { Hero, Prose } from "@/components/kit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/privacy",
  title: "Privacy Policy for the Deploier Website | Deploier",
  description: "What the Deploier website stores: no accounts, no tracking cookies, wallet addresses only when you sign, and practice records opened only with their view key.",
});

const P = [
  ["No accounts, no trackers", "The site has no sign-up, sets no advertising or analytics cookies and loads no third-party tracking scripts."],
  ["Your browser", "Your connected wallet and the view keys of records you created are remembered in your browser's local storage. Clearing site data removes them."],
  ["Practice records", "When you sign a practice action, the server stores the record with your wallet address and the terms. Only the commitment, status and time are shown publicly. The full record opens only with its view key, of which the server keeps a hash."],
  ["Rate limiting", "To stop abuse, the server counts requests per network address for short windows. These counters expire on their own."],
  ["Chain data", "Balances and blocks are read from public Robinhood Chain endpoints. Anything you do on-chain is public by the nature of the chain."],
  ["Contact", `Questions about this policy can be sent to ${BRAND.xHandle} on X.`],
];

export default function PrivacyPage() {
  return (
    <>
      <Hero title="Privacy policy" sub="Last updated 6 October 2026." />
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
