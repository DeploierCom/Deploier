import { UseCasePage, type UseCaseContent } from "@/components/UseCase";
import { StockBoard } from "@/components/live";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/use-cases/rwa-tokenization",
  title: "RWA Tokenization: Treasuries, Equities, ETFs | Deploier",
  description:
    "Deploier for RWA tokenization: issue treasury bills, fund shares and equities on Robinhood Chain to allowlisted holders, with private cap tables.",
});

const c: UseCaseContent = {
  path: "/use-cases/rwa-tokenization",
  crumb: "RWA tokenization",
  kicker: "Use case · real-world assets",
  title: (
    <>
      Treasuries, equities and funds, <em>on-chain and discreet.</em>
    </>
  ),
  lede: "Tokenizing a real-world asset should not mean publishing who owns it. Deploier treats an issuance as a private record with a public commitment: the instrument, its size and its eligible holders stay with the issuer, and anyone can still verify that the issuance happened and has not been altered.",
  benefitsTitle: "Tokenization with mobility and control",
  benefits: [
    { title: "Allowlisted holders", body: "Every instrument carries the list of addresses allowed to hold it. Transfers outside the list are refused by rule." },
    { title: "Private cap table", body: "Who holds how much stays in the issuer's record, available to a regulator through a single view key." },
    { title: "Settles against real assets", body: "Issued instruments can be delivered against USDG or the stock tokens already live on Robinhood Chain." },
  ],
  flowTitle: "Issuing a tokenized treasury bill",
  flow: [
    { title: "Describe", body: "The issuer names the bill, its symbol, units, face value per unit and maturity date." },
    { title: "Restrict", body: "It lists the eligible holder addresses, up to five in practice mode." },
    { title: "Sign", body: "The issuer signs the issuance in plain words. A commitment and the current block go on the public tape." },
    { title: "Distribute", body: "Holders buy units through private settlements, each one a separate sealed record." },
  ],
  scenariosTitle: "Where it fits",
  scenarios: [
    { title: "Treasury departments", body: "Corporates issuing short-dated paper to known investors without disclosing the book." },
    { title: "Fund managers", body: "Money market and ETF-style share classes offered to an allowlist, with settlement at any hour." },
  ],
  extraTitle: "Tokenized stocks already live on Robinhood Chain",
  extraLede: "These are real tokens issued by Robinhood, not by Deploier, with live Chainlink prices. They are the first assets a Deploier settlement can name.",
  extra: <StockBoard />,
  today: "Draft an instrument on the practice desk, set its allowlist and record a signed practice issuance. No token is minted until the issuance contract is audited and deployed.",
};

export default function Page() {
  return <UseCasePage c={c} />;
}
