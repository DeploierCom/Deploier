import { UseCasePage, type UseCaseContent } from "@/components/UseCase";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/use-cases/crypto-derivatives",
  title: "Private Margin for Crypto Derivatives | Deploier",
  description:
    "Deploier for crypto derivatives: post and recall margin at any hour on Robinhood Chain without revealing positions, collateral size or counterparties.",
});

const c: UseCaseContent = {
  path: "/use-cases/crypto-derivatives",
  crumb: "Crypto derivatives",
  kicker: "Use case · crypto derivatives",
  title: (
    <>
      Margin that moves at midnight, <em>quietly.</em>
    </>
  ),
  lede: "Derivatives desks post and recall collateral all day and all night. On a public chain, every margin call becomes a public signal of stress. Deploier lets the call, the collateral and the counterparty stay between the two desks while the transfer itself is final and verifiable.",
  benefitsTitle: "Confidential collateral at derivatives speed",
  benefits: [
    { title: "Calls without a headline", body: "A large margin top-up reads on the tape as one more commitment hash. Nobody can tell which desk is under pressure." },
    { title: "Settles any hour", body: "Robinhood Chain produces blocks continuously, so margin can move on a weekend when traditional rails are shut." },
    { title: "Mixed collateral", body: "Post USDG, WETH or stock tokens as one leg, with the other leg naming the exposure being covered." },
    { title: "One record per call", body: "Each call has its own view key, so a dispute about one call does not open the whole relationship." },
  ],
  flowTitle: "A margin call as a private settlement",
  flow: [
    { title: "Exposure moves", body: "A bilateral position swings and the in-the-money desk computes the margin due." },
    { title: "Call proposed", body: "The receiving desk proposes a settlement: the counterparty delivers 400,000 USDG, the proposer delivers nothing but a receipt leg." },
    { title: "Accepted and stamped", body: "The posting desk signs acceptance. The tape shows a settled commitment at a given block and nothing more." },
    { title: "Recall later", body: "When exposure falls, the reverse settlement returns the collateral the same way." },
  ],
  scenariosTitle: "Where it fits",
  scenarios: [
    { title: "Bilateral swaps and options", body: "Two professional counterparties exchanging variation margin directly, with an auditable record each can show its own risk team." },
    { title: "Venue margin accounts", body: "A trading venue collecting margin from members without broadcasting which member just topped up." },
  ],
  today: "On the desk you can propose a margin-style settlement between two of your wallets, accept it and verify the commitment. Collateral does not move in practice mode.",
};

export default function Page() {
  return <UseCasePage c={c} />;
}
