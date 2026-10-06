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
    q: `Which contracts does ${BRAND.name} use?`,
    a: [
      "Three, with the source published: SettlementEscrow (delivery versus payment between two named wallets), CommitmentRegistry (a public tape of commitments) and AllowlistTokenFactory (tokens only allowlisted wallets can hold, managed by the wallet that issues them).",
      "None of them has an owner, an admin key, a pause switch, a fee or an upgrade path. Their addresses appear on the developers page once deployed; until then the desk runs in practice mode.",
    ],
  },
  {
    q: "What works today and what does not?",
    a: [
      "Working now: wallet connection, live Robinhood Chain data, live prices for the tokenized stocks, and the desk for private settlements and issuances with real wallet signatures.",
      "Written and tested: the escrow, registry and issuance contracts. Each switches its part of the desk to real transactions once deployed. Not built: the operator network, hidden amounts and any compliance integration.",
    ],
  },
  {
    q: "Is it really private in practice mode?",
    a: [
      "The public tape on the desk never shows parties, assets or amounts. Private records are stored by the site's server and opened only with their view key, whose hash is all the server keeps.",
      "Practice mode relies on that server for status. With the contracts deployed, status and commitments are read from the chain; the server keeps only the private terms, hash-locked by view key.",
    ],
  },
  {
    q: "Can institutions use it?",
    a: [
      "Banks, brokers, custodians, payment providers and asset issuers are the users the design targets. None use it today, and no institution has endorsed it. Regulated use would need legal review and compliance controls of each institution's own, which are not part of the contracts.",
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
