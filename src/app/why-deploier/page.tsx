import { BRAND, CHAIN } from "@/config/brand";
import { StatementArt } from "@/components/art";
import { JsonLd } from "@/components/JsonLd";
import { Band, Btn, Cards, FaqBlock, Hero, More } from "@/components/kit";
import { TargetTag } from "@/components/ui";
import { FAQ } from "@/content/faq";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/why-deploier",
  title: "Why Private Settlement Matters | Deploier",
  description:
    "Why Deploier exists: open ledgers expose every position and closed systems hide the rules. Deploier keeps rules public and books private on Robinhood Chain.",
});

const AUDIENCE = [
  { title: "Financial institutions", body: "Banks, brokers and custodians that need to settle client flows without publishing client positions." },
  { title: "Capital markets venues", body: "Exchanges and trading platforms that want on-chain finality for matched trades while order flow stays confidential." },
  { title: "Asset issuers", body: "Corporate treasuries and fund managers issuing tokenized bills, shares or receivables to an allowlisted set of holders." },
  { title: "Payment providers", body: "Stablecoin networks and processors that pay merchants and payroll without making every invoice public." },
  { title: "Crypto institutions", body: "Regulated exchanges and professional traders that post margin and move collateral around the clock." },
];

const WHY_FAQ = [FAQ[0], FAQ[1], FAQ[6], FAQ[7], FAQ[4]].map((f) => ({ q: f.q, a: f.a.map((p) => <p key={p.slice(0, 24)}>{p}</p>) }));

export default function WhyPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Why Deploier", path: "/why-deploier" }])} />
      <Hero
        art={{ src: "/art/mark-stack.svg", className: "top-[10px] right-[40px] w-[440px] max-[1199.98px]:w-[340px]" }}
        title="Markets moved on-chain, their discretion did not"
        sub={`Open ledgers settle in seconds and publish everything. Closed networks keep secrets and ask you to trust whoever runs them. ${BRAND.name} takes the speed of the first and the confidentiality of the second.`}
      >
        <Btn href="/settlement" small>
          See how settlement works
        </Btn>
      </Hero>

      <Band>
        <div className="grid grid-cols-1 items-center gap-x-[15px] gap-y-10 lg:grid-cols-2">
          <div className="min-w-0 lg:pr-[100px]">
            <h2 className="d-h5 font-medium text-black">Transparency became a trading signal</h2>
            <div className="mt-5 space-y-4 text-[14px] leading-[21px] text-black sm:text-[15px] sm:leading-[23px]">
              <p>
                On a fully public chain, a large holder cannot move without being watched. Wallet trackers flag the transfer, bots trade ahead
                of the rest of the order, and competitors reconstruct a strategy from a week of history.
              </p>
              <p>
                When an incoming settlement is visible before it is final, someone will trade against it, and the cost lands on the party that
                moved first. A broker&apos;s settlement wallet shows who it pays and how much; for a regulated firm that is a confidentiality
                breach, not only a privacy issue. And once a ledger has published a position, nothing recalls it.
              </p>
            </div>
            <div className="mt-[30px]">
              <Btn href="/litepaper" small>
                Read the litepaper
              </Btn>
            </div>
          </div>
          <StatementArt />
        </div>
      </Band>

      <Band className="!pt-[25px]">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <h2 className="d-h5 max-w-[640px] font-medium text-navy">Designed for the firms that move serious money</h2>
          <More href="/faq" className="!text-[#1c42d4]">
            Read the FAQ
          </More>
        </div>
        <p className="t-body mt-3 max-w-[760px] text-black">
          Institutional readiness is the goal the design is measured against. None of the groups below are users today, and no institution
          has endorsed {BRAND.name}.
        </p>
        <div className="mt-3">
          <TargetTag>Target users</TargetTag>
        </div>
        <ul className="mt-[30px] grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-5">
          {AUDIENCE.map((a) => (
            <li key={a.title} className="min-w-0 rounded-[16px] bg-[#f6f7fb] px-[22px] py-[26px] shadow-[inset_0_0_0_1px_#eceef5]">
              <h3 className="font-display text-[16px] leading-[22px] font-medium text-black">{a.title}</h3>
              <p className="mt-2 text-[14px] leading-[21px] text-black/80">{a.body}</p>
            </li>
          ))}
        </ul>
      </Band>

      <section className="night on-dark py-[75px] max-md:py-[50px]">
        <div className="ctn">
          <h2 className="d-h2 max-w-[915px] text-white">Closed networks fixed privacy by hiding the rules</h2>
          <p className="t-body mt-3 mb-[40px] max-w-[915px] text-white/85">
            Permissioned ledgers keep data inside a consortium. That solves exposure and creates a new problem: nobody outside can check that
            the rules were applied the same way to everyone, and every participant depends on the operator staying honest and online.
          </p>
          <Cards
            tone="outline"
            items={[
              { title: "One operator, one failure", body: "If the consortium's servers stop, settlement stops. If its admins change a rule, members find out afterwards.", links: [{ href: "/run", label: "More" }] },
              {
                title: "Islands that cannot meet",
                body: "Each private network is its own pool of assets. Moving collateral between them takes the same manual reconciliation the technology was meant to remove.",
                links: [{ href: "/use-cases/onchain-financing", label: "More" }],
              },
              { title: "Trust without proof", body: "A member can be told a trade settled, but cannot prove it to a third party without the operator's help.", links: [{ href: "/settlement", label: "More" }] },
            ]}
          />
        </div>
      </section>

      <Band>
        <h2 className="d-h2 max-w-[915px] text-black">The {BRAND.name} answer: public rules, private books</h2>
        <p className="t-body mt-3 mb-[30px] max-w-[915px] text-black">
          {BRAND.name} puts only commitments on the public tape and keeps the deal itself with the parties. The rules for forming, accepting and
          expiring a settlement are written down for anyone to read. Final states are stamped against {CHAIN.name} blocks, which no single
          company controls.
        </p>
        <Cards
          cols={2}
          minH={200}
          items={[
            {
              title: "Built on an existing chain, not a new one",
              body: `${CHAIN.name} already carries tokenized equities, a dollar token (USDG) and the wallets people use. Starting there means no new validator set to trust and no bridge to cross.`,
            },
            { title: "Disclosure is a choice, record by record", body: "A view key opens exactly one settlement. Handing it to a reviewer proves that deal without exposing any other." },
            { title: "Every agreement is signed", body: "Proposals and acceptances are wallet signatures over plain-language terms, so the record of consent is as strong as the keys behind it." },
            { title: "Honest about what is live", body: "Every screen says whether it is in practice mode or sending a real transaction, and the contracts state plainly what they do not hide: token amounts on chain are public." },
          ]}
        />
      </Band>

      <FaqBlock title="FAQs" items={WHY_FAQ} className="!pt-0" />
    </>
  );
}
