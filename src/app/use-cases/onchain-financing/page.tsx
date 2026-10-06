import { UseCasePage, type UseCaseContent } from "@/components/UseCase";
import { FinancingOrbit } from "@/components/FinancingOrbit";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/use-cases/onchain-financing",
  title: "Round-the-Clock On-Chain Financing and Repo | Deploier",
  description:
    "Deploier for on-chain financing: open and close repo-style deals against tokenized stocks on Robinhood Chain at any hour, with terms and rates kept private.",
});

const c: UseCaseContent = {
  path: "/use-cases/onchain-financing",
  crumb: "Around-the-clock financing",
  title: "Cash for collateral, whatever the day",
  art: { src: "/art/tunnel.svg", className: "top-[60px] right-[-40px] w-[700px] max-[1199.98px]:w-[520px] opacity-90" },
  lede: "Short-term financing still waits for business hours and settlement windows. Tokenized assets on Robinhood Chain do not. Deploier pairs cash and collateral as the two legs of a private settlement, so a treasury can raise or place cash on a Saturday without telling the market its rate or its size.",
  benefitsTitle: "Financing that keeps pace with tokenized assets",
  benefitsLede:
    "Whether you run a fund, an issuer's treasury or a trading desk, raise or place cash against tokenized collateral the moment you need to, with the price kept between the two sides.",
  benefits: [
    { title: "Instant liquidity", body: "Raise USDG against stock tokens the moment you need it, not at the next settlement cycle." },
    { title: "Private pricing", body: "The rate and haircut live in the private record. Competing lenders cannot read your terms off the chain." },
    { title: "Balance sheet control", body: "Treasurers can move idle cash into short deals and back without exposing their cash position." },
    { title: "Proof for the auditor", body: "Two view keys, one for each leg, prove the full round trip to an auditor without opening any other deal." },
  ],
  flowTitle: "A repo-style deal in two settlements",
  flow: [
    { title: "Open leg", body: "The borrower delivers 300 NVDA stock tokens and receives 85,000 USDG. The memo records the agreed rate and term." },
    { title: "Public trace", body: "The tape shows one settled commitment. Size, rate and the two firms remain private." },
    { title: "Close leg", body: "At term, a second settlement returns the stock tokens against the cash plus interest." },
    { title: "Audit", body: "Either party shares the two view keys with its auditor to prove the round trip." },
  ],
  scenarios: [
    { title: "Weekend liquidity", body: "A desk that needs dollars before Monday's open borrows against equity tokens it already holds." },
    { title: "Treasury cash management", body: "A corporate treasury lends surplus USDG overnight to known counterparties at a private rate." },
  ],
  extra: <FinancingOrbit />,
  today: "The desk records both legs of a financing deal as practice settlements and shows how the two commitments appear on the tape. Interest and term enforcement belong to the planned contracts.",
};

export default function Page() {
  return <UseCasePage c={c} />;
}
