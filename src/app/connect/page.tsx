import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Columns, CtaBand, PageHead, PracticeTag, Rows, Section } from "@/components/ui";
import { AccessButton } from "@/components/wallet/WalletButton";
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
      <PageHead
        kicker="Connect"
        title={
          <>
            Bring a wallet. Leave with a <em>private</em> settlement.
          </>
        }
        lede={`Connecting to ${BRAND.name} takes the wallet you already use and points it at ${CHAIN.name}. From there you can propose a settlement, accept one, or draft a tokenized instrument, all in practice mode while the audited contracts are prepared.`}
      >
        <AccessButton />
        <Link href="/app" className="btn btn-ghost">
          Go to the desk
        </Link>
      </PageHead>

      <Section
        index="01"
        title="Connect on your terms"
        lede="There is no account to create and no email to hand over. Your wallet address is your identity, and every action is a signature you can read before you approve it."
      >
        <Columns
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
        <p className="mt-8 text-[15px] text-ink-2">
          Phantom lists itself as an EVM wallet but cannot add custom networks, so it appears in the dialog as not supported.
        </p>
      </Section>

      <Section index="02" night title="Your first private settlement, step by step" lede="You need two wallets you control, or a colleague with one.">
        <div className="mb-6">
          <PracticeTag>Practice mode: no funds move</PracticeTag>
        </div>
        <Rows
          items={[
            { title: "Connect wallet A", body: "Open the practice desk and connect. Check the chip in the header turns green for the right network." },
            { title: "Write the terms", body: "Paste wallet B's address, choose what A delivers and what A receives, and add a memo if you like." },
            { title: "Sign the proposal", body: "Your wallet shows the terms in plain words. Signing is free and sends no transaction." },
            { title: "Copy the private link", body: "The desk gives you a link containing the record's view key. Send it to wallet B privately." },
            { title: "Accept from wallet B", body: "Open the link, connect wallet B and sign the acceptance. The public tape flips to settled with the current block." },
          ]}
        />
      </Section>

      <Section
        index="03"
        title="What connecting never does"
        lede="A settlement layer built on discretion should be just as careful with its own users."
      >
        <Columns
          cols={2}
          items={[
            { title: "No approvals, no spending", body: "The practice desk never asks for a token approval or a transaction. If a site claiming to be Deploier does, close it." },
            { title: "No tracking of your balances", body: "Your ETH and USDG balances are read from the public chain for display in your own browser only." },
            { title: "No keys leave the wallet", body: "Signatures are produced inside your wallet. The site receives the signature, never the key." },
            { title: "One official address", body: `The ${BRAND.symbol} contract address will be published on the token page and in the header. Trust no other source.` },
          ]}
        />
      </Section>

      <CtaBand title="Ready to try it?" body="Two signatures, one private settlement, and a public tape that learns nothing about the deal.">
        <AccessButton />
      </CtaBand>
    </>
  );
}
