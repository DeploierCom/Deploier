export type NavLink = { href: string; label: string; note?: string };
export type NavGroup = { label: string; items: NavLink[] };

export const USE_CASES: NavLink[] = [
  { href: "/use-cases/crypto-derivatives", label: "Crypto derivatives", note: "margin that moves without showing the book" },
  { href: "/use-cases/onchain-financing", label: "Around-the-clock financing", note: "repo and lending that never wait for Monday" },
  { href: "/use-cases/stablecoin-payments", label: "Confidential USDG payments", note: "pay suppliers without publishing payroll" },
  { href: "/use-cases/rwa-tokenization", label: "RWA tokenization", note: "treasuries, equities and funds as tokens" },
];

export const NAV: (NavLink | NavGroup)[] = [
  {
    label: "Network",
    items: [
      { href: "/why-deploier", label: "Why Deploier", note: "the case for private settlement" },
      { href: "/settlement", label: "The settlement layer", note: "how it sits on Robinhood Chain" },
      { href: "/network", label: "Live network", note: "blocks, gas and assets read now" },
      { href: "/connect", label: "Connect", note: "wallets, desks and first steps" },
      { href: "/build", label: "Build", note: "apps on the settlement layer" },
      { href: "/run", label: "Run", note: "operate a settlement desk" },
    ],
  },
  { href: "/developers", label: "Developers" },
  { label: "Use cases", items: USE_CASES },
  {
    label: "Learn",
    items: [
      { href: "/faq", label: "FAQ", note: "plain answers, including what is not built" },
      { href: "/litepaper", label: "Litepaper", note: "the design in one read" },
      { href: "/token", label: "$DEPLOIER token", note: "contract, supply and where it trades" },
      { href: "/brand", label: "Brand kit", note: "logo files and naming rules" },
      { href: "/contact", label: "Contact", note: "talk to the team" },
    ],
  },
];

export const FOOTER: NavGroup[] = [
  {
    label: "Network",
    items: [
      { href: "/connect", label: "Connect" },
      { href: "/build", label: "Build" },
      { href: "/run", label: "Run" },
      { href: "/why-deploier", label: "Why Deploier" },
      { href: "/settlement", label: "Settlement layer" },
      { href: "/network", label: "Live network" },
      { href: "/developers", label: "Developers" },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/faq", label: "FAQ" },
      { href: "/litepaper", label: "Litepaper" },
      { href: "/token", label: "Token" },
      { href: "/swap", label: "Swap" },
      { href: "/app", label: "Practice desk" },
      { href: "/brand", label: "Brand kit" },
    ],
  },
  { label: "Use cases", items: USE_CASES.map(({ href, label }) => ({ href, label })) },
  {
    label: "Company",
    items: [
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export const isGroup = (x: NavLink | NavGroup): x is NavGroup => "items" in x;
