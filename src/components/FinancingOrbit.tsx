import { ArrowLeftRight, Landmark } from "lucide-react";
import { CHAIN } from "@/config/brand";

/** Dark "liquidity" band for the financing page: collateral on one side, cash on the other. */
export function FinancingOrbit() {
  return (
    <section className="night on-dark overflow-hidden pt-[75px] max-md:pt-[50px]">
      <div className="ctn">
        <h2 className="d-h2 text-accent">Liquidity at any hour</h2>
        <div className="t-body mt-4 max-w-[915px] space-y-4 text-white">
          <p>
            A fund manager, an issuer or a trading desk can post tokenized collateral and receive dollars within one {CHAIN.name} block,
            then unwind the position the same way when the term ends.
          </p>
          <p>Redeploy idle cash, answer a funding need before markets open and keep the price of that funding to yourself.</p>
        </div>
      </div>
      <div className="relative mt-10 h-[520px] max-md:h-auto">
        <img src="/art/orbit.svg" alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover max-md:hidden" />
        <div className="ctn relative grid h-full grid-cols-1 items-center gap-10 py-10 md:grid-cols-2 md:gap-[120px] md:py-0">
          <div className="flex items-center justify-end gap-6 text-right max-md:flex-row-reverse max-md:justify-start max-md:text-left">
            <div className="min-w-0">
              <h3 className="font-display text-[18px] leading-[24px] font-medium text-accent">Collateral the desk can post</h3>
              <ul className="mt-3 space-y-2 text-[13px] leading-[18px] font-semibold text-white">
                <li>Stock tokens: AAPL, GOOGL, NVDA, TSLA</li>
                <li>Wrapped ether</li>
                <li>Practice-issued instruments</li>
              </ul>
            </div>
            <span className="grid size-[84px] shrink-0 place-items-center rounded-full bg-accent text-black max-md:size-16">
              <Landmark className="size-8" />
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="grid size-[84px] shrink-0 place-items-center rounded-full bg-accent text-black max-md:size-16">
              <ArrowLeftRight className="size-8" />
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-[18px] leading-[24px] font-medium text-accent">Cash and settlement</h3>
              <ul className="mt-3 space-y-2 text-[13px] leading-[18px] font-semibold text-white">
                <li>USDG, the dollar token on the chain</li>
                <li>Rate and term kept in the private memo</li>
                <li>Final status stamped on a {CHAIN.name} block</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
