import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Cards, FormSection, Hero, Intro, NumberCards, Split } from "@/components/kit";
import { QuoteBand } from "@/components/kit-client";
import { PracticeTag } from "@/components/ui";
import { AccessButton } from "@/components/wallet/WalletButton";
import { PRINCIPLES } from "@/content/quotes";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/connect",
  title: "Connect a Wallet to Private Settlement | Deploier",
  description:
    "Connect an EVM wallet to Deploier on Robinhood Chain, add the network in one click and run your first private settlement on the practice desk in two signatures.",
});

export default function ConnectPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Connect", path: "/connect" }])} />
      <Hero
        art={{ src: "/art/waves.svg", className: "top-0 right-0 h-full w-[52%] object-cover object-left opacity-80" }}
        title="Bring a wallet, leave with a private settlement"
        sub={`Point the wallet you already use at ${CHAIN.name} and settle with a counterparty while the terms stay between you.`}
      />

      <Intro>
        There is no account to create and no email to hand over. Your wallet address is your identity, and every action on {BRAND.name} is a
        signature you can read before you approve it.
      </Intro>

      <Band className="!pt-[40px]">
        <Cards
          minH={222}
          items={[
            {
              title: "Browser wallets",
              body: "MetaMask, Rabby, OKX Wallet, Coinbase Wallet, Brave and other wallets that announce themselves over EIP-6963 are listed automatically when installed.",
            },
            {
              title: "Phone wallets",
              body: "On a phone, the connect dialog opens this site inside your wallet's own browser. WalletConnect pairing is offered once the site operator enables it.",
            },
            {
              title: "The network is added for you",
              body: `If your wallet does not know ${CHAIN.name} yet, connecting asks it to add chain id ${CHAIN.id} with the public RPC and explorer. You approve that in the wallet.`,
            },
          ]}
        />
      </Band>

      <Band>
        <Split title={`Connect on ${BRAND.name}`}>
          <p>
            Connecting takes the wallet you already use and points it at {CHAIN.name}. From there you can propose a settlement, accept one,
            or draft a tokenized instrument, all in practice mode while the audited contracts are prepared.
          </p>
          <p>
            Phantom lists itself as an EVM wallet but cannot add custom networks, so it appears in the dialog as not supported. Every other
            wallet that can add a network works, on a laptop or inside a phone wallet&apos;s browser.
          </p>
          <div className="pt-[26px]">
            <AccessButton />
          </div>
        </Split>
      </Band>

      <Band>
        <h2 className="d-h2 max-w-[915px] text-navy">Your first private settlement</h2>
        <p className="t-sub mt-[2px] max-w-[915px] text-black">
          You need two wallets you control, or a colleague with one. Signing is free and sends no transaction; the public tape only ever
          learns a hash, a status and a block number.
        </p>
        <div className="mt-4 mb-[40px]">
          <PracticeTag>Practice mode: no funds move</PracticeTag>
        </div>
        <NumberCards
          items={[
            {
              title: "Connect wallet A",
              body: "Open the practice desk and connect. Check that the chip in the header turns green for the right network.",
              href: "/app",
              cta: "Open the desk",
            },
            {
              title: "Write and sign the terms",
              body: "Paste wallet B's address, choose what A delivers and what A receives, add a memo, then sign the plain-language message.",
              href: "/settlement",
              cta: "How a proposal works",
            },
            {
              title: "Send the private link",
              body: "The desk gives you a link carrying this record's view key. Send it to wallet B through a channel you already trust.",
              href: "/developers",
              cta: "What the link contains",
            },
            {
              title: "Accept from wallet B",
              body: "Open the link, connect wallet B and sign the acceptance. The public tape flips to settled with the current block.",
              href: "/app",
              cta: "Try it now",
            },
          ]}
        />
      </Band>

      <QuoteBand quotes={PRINCIPLES} />

      <FormSection
        title="What connecting never does"
        tagline="A settlement layer built on discretion should be just as careful with its own users."
        topic="connect"
      >
        <ul>
          <li>No approvals, no spending: the practice desk never asks for a token approval or a transaction. If a site claiming to be {BRAND.name} does, close it.</li>
          <li>No tracking of balances: your ETH and USDG balances are read from the public chain for display in your own browser only.</li>
          <li>No keys leave the wallet: signatures are produced inside your wallet; the site receives the signature, never the key.</li>
          <li>One official address: the {BRAND.symbol} contract will be published on the token page and in the header. Trust no other source.</li>
        </ul>
        <div className="mt-[30px]">
          <Btn href="/app">
            Go to the desk <span className="arr">→</span>
          </Btn>
        </div>
      </FormSection>
    </>
  );
}
