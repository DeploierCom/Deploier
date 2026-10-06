import { BRAND } from "@/config/brand";
import { PageHead } from "@/components/ui";
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
      <PageHead kicker="Legal" title="Privacy policy" lede="Last updated 6 October 2026." />
      <div className="wrap wrap-wide py-14">
        <div className="max-w-[760px]">
          {P.map(([h, b]) => (
            <section key={h} className="border-t border-ink pt-5 pb-8">
              <h2 className="serif text-[26px]">{h}</h2>
              <p className="mt-2 text-[16px] text-ink-2">{b}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
