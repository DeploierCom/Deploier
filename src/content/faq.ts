import { BRAND, CHAIN } from "@/config/brand";

/** Plain-text questions and answers. The FAQ page renders them and its FAQPage data reuses the same text. */
export const FAQ: { q: string; a: string[] }[] = [
  {
    q: `What is ${BRAND.name}?`,
    a: [
      `${BRAND.name} is a ${BRAND.category} on ${CHAIN.name}. It lets two parties settle a trade, a payment or a tokenized asset while the counterparties, assets and amounts stay private, and only a commitment hash and the final status are public.`,
      `It is a token (${BRAND.symbol}) and an application on ${CHAIN.name}, not a separate blockchain.`,
    ],
  },
  {
    q: `How does ${BRAND.name} work?`,
    a: [
      "A maker proposes terms to one named counterparty and signs them with a wallet. The terms and a random salt are hashed into a commitment that goes on a public tape with the current Robinhood Chain block.",
      "The counterparty receives a view key for that one record, reads the terms and signs to accept. The public tape then shows the commitment as settled. Anyone holding the terms and salt can recompute the hash to check it.",
    ],
  },
  {
    q: `Which network is ${BRAND.name} on?`,
    a: [`${CHAIN.name}, chain id ${CHAIN.id}. Gas is paid in ETH. Connecting a wallet on this site adds the network if the wallet does not have it yet.`],
  },
  {
    q: `How do I buy ${BRAND.symbol}?`,
    a: [
      `${BRAND.symbol} has not launched yet. At launch, its contract address will be published on the token page and in the site header, and the swap page will quote ETH to ${BRAND.symbol} through the Pons launchpad on ${CHAIN.name}.`,
      `Until then, any token calling itself ${BRAND.symbol} is not ours. Follow ${BRAND.xHandle} on X for the launch announcement.`,
    ],
  },
  {
    q: `Is ${BRAND.name} audited?`,
    a: [
      "Not yet. No settlement contract has been deployed, so there is nothing to audit on-chain today. The practice desk runs off-chain and moves no funds.",
      "An independent audit is a precondition for deploying the settlement and issuance contracts. Its report will be linked from this page when it exists.",
    ],
  },
  {
    q: "What works today and what does not?",
    a: [
      "Working now: wallet connection, live Robinhood Chain data, live prices for the tokenized stocks, and the practice desk for private settlements and practice issuances with real wallet signatures.",
      "Not built yet: contracts that move assets, on-chain commitments, the operator network and any compliance integration.",
    ],
  },
  {
    q: "Is it really private in practice mode?",
    a: [
      "The public tape on the desk never shows parties, assets or amounts. Private records are stored by the site's server and opened only with their view key, whose hash is all the server keeps.",
      "Practice mode still relies on that server. The audited release is designed to remove that dependency by anchoring commitments in a contract.",
    ],
  },
  {
    q: "Can institutions use it?",
    a: [
      "Banks, brokers, custodians, payment providers and asset issuers are the users the design targets. None use it today, and no institution has endorsed it. Regulated use would need the audited contracts, legal review and compliance controls that are still on the roadmap.",
    ],
  },
  {
    q: "Which assets can a settlement name?",
    a: [
      "USDG, WETH and the tokenized stocks verified on Robinhood Chain (Apple, Alphabet, NVIDIA and Tesla). Issued practice instruments describe treasuries, equities, ETFs, money market shares and receivables.",
    ],
  },
  {
    q: "Does connecting a wallet cost anything?",
    a: ["No. Connecting shares your address, and every practice action is a free signature. The site never asks for token approvals or transactions on the desk."],
  },
];
