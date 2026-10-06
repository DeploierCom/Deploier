import { UseCasePage, type UseCaseContent } from "@/components/UseCase";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/use-cases/stablecoin-payments",
  title: "Private Stablecoin Payments on Robinhood Chain | Deploier",
  description:
    "Deploier for stablecoin payments: pay suppliers, partners and payroll in USDG on Robinhood Chain with final settlement, while invoices and amounts stay private.",
});

const c: UseCaseContent = {
  path: "/use-cases/stablecoin-payments",
  crumb: "Confidential USDG payments",
  title: "Pay in dollars without publishing the ledger",
  art: { src: "/art/planes.svg", className: "top-[20px] right-[-40px] w-[620px] max-[1199.98px]:w-[460px]" },
  lede: "Stablecoins made payments fast and cheap, and turned every company's accounts payable into public reading. Deploier keeps the speed and finality of a USDG transfer on Robinhood Chain while the payer, the payee, the amount and the invoice reference stay in a private record.",
  benefitsTitle: "Payments upgraded for businesses",
  benefitsLede:
    "A payment run should not double as a public report on your suppliers and staff. Each USDG payment becomes one sealed record with a public proof that it closed.",
  benefits: [
    { title: "Payroll stays private", body: "Salaries paid on-chain should not be readable by colleagues or competitors. Each payment is one sealed record." },
    { title: "Supplier terms stay private", body: "What you pay a supplier is a negotiating position. The tape shows that a payment settled, not what it was worth." },
    { title: "Around the clock", body: "Payments clear on Robinhood Chain blocks at any hour, with a final status both sides can verify." },
    { title: "Proof on request", body: "Hand the view key of one payment to an accountant or a tax authority and prove it without exposing the rest." },
  ],
  flowTitle: "An invoice paid privately",
  flow: [
    { title: "Invoice", body: "The supplier proposes: it delivers a receipt token leg, the buyer delivers 12,400 USDG, memo carries the invoice number." },
    { title: "Pay", body: "The buyer accepts. The settlement is stamped at the current block." },
    { title: "Reconcile", body: "Both sides keep the private record with the memo, which matches the payment to the invoice in their books." },
  ],
  scenarios: [
    { title: "Issuer and processor networks", body: "Stablecoin payment providers settling merchant batches without exposing merchant volumes." },
    { title: "Cross-border business payments", body: "Firms paying overseas partners at any hour, with a record each side can hand to its bank." },
  ],
  today: "Run an invoice-and-payment pair on the practice desk with USDG as the payment leg. In practice mode no USDG moves; with the escrow deployed the same pair settles USDG for real, and the amount is public on chain.",
};

export default function Page() {
  return <UseCasePage c={c} />;
}
