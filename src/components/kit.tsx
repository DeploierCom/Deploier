import Link from "next/link";
import { MarkBadge } from "@/components/Mark";
import { ContactForm } from "@/components/kit-client";

/*
 * Section modules for every marketing page. Server components: every word
 * they render is in the HTML the crawler receives. Interactive pieces
 * (carousel, tabs, contact form) live in kit-client.tsx.
 */

export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true" className={className}>
      <path d="M1.5 1.5L6 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "Read >" link. Internal paths use next/link, external ones open a new tab. */
export function More({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const body = (
    <>
      {children}
      <Chevron />
    </>
  );
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noreferrer" className={`more ${className}`}>
      {body}
    </a>
  ) : (
    <Link href={href} className={`more ${className}`}>
      {body}
    </Link>
  );
}

/** Pill button link. */
export function Btn({
  href,
  children,
  tone = "accent",
  small = false,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "accent" | "ink" | "ghost";
  small?: boolean;
  className?: string;
}) {
  const cls = `btn btn-${tone} ${small ? "btn-sm" : ""} ${className}`;
  return href.startsWith("http") ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

export type Art = { src: string; className?: string; alt?: string };

/** Line art placed in a hero or a dark row. Decorative unless alt is given. */
export function ArtImg({ art, className = "" }: { art: Art; className?: string }) {
  return (
     
    <img src={art.src} alt={art.alt ?? ""} aria-hidden={art.alt ? undefined : true} className={`pointer-events-none select-none ${art.className ?? ""} ${className}`} />
  );
}

/**
 * Dark page hero: title, a light sub-line, optional actions and line art on
 * the right. `home` uses the larger sub-line of the home page.
 */
export function Hero({
  title,
  sub,
  children,
  art,
  mesh = false,
  home = false,
  after,
}: {
  title: React.ReactNode;
  sub?: React.ReactNode;
  children?: React.ReactNode;
  art?: Art;
  mesh?: boolean;
  home?: boolean;
  after?: React.ReactNode;
}) {
  return (
    <section className="night on-dark relative overflow-hidden bg-board text-white">
      {mesh ? <ArtImg art={{ src: "/art/wave-mesh.svg" }} className="absolute inset-0 h-full w-full object-cover" /> : null}
      {art ? <ArtImg art={art} className="absolute max-md:hidden" /> : null}
      <div className="ctn relative pt-[106px] pb-[100px] max-[1199.98px]:pt-[90px] max-md:pt-[44px] max-md:pb-[50px]">
        <div className="max-w-[798px] min-w-0">
          <h1 className="d-h1 text-white">{title}</h1>
          {sub ? (
            home ? (
              <p className="mt-[78px] max-w-[600px] text-[32px] leading-[38.4px] font-light max-md:mt-10 max-md:text-[20px] max-md:leading-[24px]">{sub}</p>
            ) : (
              <p className="t-sub mt-[10px] max-w-[570px]">{sub}</p>
            )
          ) : null}
          {after}
          {children ? <div className="mt-[30px] flex flex-wrap items-center gap-[10px]">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

/** White section wrapper with the reference's vertical rhythm (75px). */
export function Band({
  children,
  className = "",
  dark = false,
  id,
  tight = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section id={id} className={`${dark ? "night on-dark" : ""} ${tight ? "py-10" : "py-[75px] max-md:py-[50px]"} ${className}`}>
      <div className="ctn">{children}</div>
    </section>
  );
}

/** Large light intro paragraph that follows a hero. */
export function Intro({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`pt-10 ${className}`}>
      <div className="ctn">
        <div className="t-sub max-w-[915px] text-black">{children}</div>
      </div>
    </section>
  );
}

export type CardItem = { title: React.ReactNode; body: React.ReactNode; links?: { href: string; label: string }[]; kicker?: React.ReactNode };

/** Rounded card grid: grey cards on white, near-black cards with lime links. */
export function Cards({
  items,
  cols = 3,
  tone = "gray",
  titleTone = "ink",
  minH,
  className = "",
}: {
  items: CardItem[];
  cols?: 2 | 3 | 4;
  tone?: "gray" | "dark" | "outline";
  titleTone?: "ink" | "violet";
  minH?: number;
  className?: string;
}) {
  const grid = cols === 4 ? "md:grid-cols-2 xl:grid-cols-4" : cols === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
  const box =
    tone === "dark"
      ? "on-dark bg-board text-white"
      : tone === "outline"
        ? "on-dark border border-[rgba(163,255,209,0.55)] bg-transparent text-white"
        : "bg-paper-2 text-black";
  return (
    <div className={`grid grid-cols-1 gap-[15px] ${grid} ${className}`}>
      {items.map((c, i) => (
        <div key={i} className={`flex min-w-0 flex-col rounded-[16px] px-[30px] pt-[35px] pb-[35px] max-md:px-[25px] ${box}`} style={minH ? { minHeight: minH } : undefined}>
          {c.kicker ? <div className="mb-[10px]">{c.kicker}</div> : null}
          <h3 className={titleTone === "violet" ? "d-h5 font-medium text-violet" : "d-h4"}>{c.title}</h3>
          <div className={`mt-[15px] ${titleTone === "violet" ? "text-[18px] leading-[24px] font-normal" : "t-body"} ${tone === "gray" ? "text-black" : "text-white/90"}`}>{c.body}</div>
          {c.links?.length ? (
            <div className="mt-auto flex flex-col items-start gap-[12px] pt-[30px]">
              {c.links.map((l) => (
                <More key={l.href + l.label} href={l.href}>
                  {l.label}
                </More>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/** Numbered dark cards: "01" heading, lime sub-title, text, link. */
export function NumberCards({ items }: { items: { title: string; body: React.ReactNode; href: string; cta: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-4">
      {items.map((c, i) => (
        <div key={c.title} className="on-dark flex min-w-0 flex-col rounded-[16px] bg-board px-[30px] pt-[35px] pb-[35px] text-white">
          <p className="d-h4">{String(i + 1).padStart(2, "0")}</p>
          <h3 className="mt-[10px] text-[18px] leading-[32px] font-light text-accent">{c.title}</h3>
          <div className="t-body mt-[6px] text-white/90">{c.body}</div>
          <div className="mt-auto pt-[30px]">
            <More href={c.href}>{c.cta}</More>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Title on the left, copy and an action on the right. */
export function Split({ title, children, className = "" }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-x-[15px] gap-y-6 lg:grid-cols-2 ${className}`}>
      <h2 className="d-h2 min-w-0 text-[#1b1b1b]">{title}</h2>
      <div className="min-w-0 max-w-[560px] space-y-[10px] text-[16px] leading-[24px] text-[#1b1b1b]">{children}</div>
    </div>
  );
}

/** Dark two-column row with line art, alternating sides. */
export function DarkRow({
  title,
  children,
  art,
  reverse = false,
  id,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  art: Art;
  reverse?: boolean;
  id?: string;
}) {
  return (
    <section id={id} className="night on-dark">
      <div className="ctn">
        <div className={`grid grid-cols-1 items-center gap-x-[15px] lg:grid-cols-2 ${reverse ? "" : ""}`}>
          <div className={`min-w-0 py-[75px] max-md:py-[45px] ${reverse ? "lg:order-2 lg:pl-[115px] max-[1399px]:lg:pl-10" : "lg:pr-[115px] max-[1399px]:lg:pr-10"}`}>
            <h2 className="d-h2s text-white">{title}</h2>
            <div className="t-body mt-5 space-y-4 text-white">{children}</div>
          </div>
          <div className={`min-w-0 max-lg:hidden ${reverse ? "lg:order-1" : ""}`}>
            <ArtImg art={art} className="block h-auto w-full rounded-[16px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pale blue call-to-action band, centred. */
export function SkyBand({ title, children, action }: { title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="py-[75px] max-md:py-[40px]">
      <div className="ctn">
        <div className="rounded-[16px] bg-sky px-[50px] py-[50px] text-center text-black max-md:px-[25px]">
          <div className="mx-auto max-w-[768px]">
            <h2 className="d-h5 text-black">{title}</h2>
            {children ? <div className="t-body mt-[10px] space-y-3 text-black">{children}</div> : null}
            {action ? <div className="mt-[20px] flex flex-wrap justify-center gap-[10px]">{action}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Accordion list built on details/summary, so answers are in the HTML and work without script. */
export function Accordion({
  items,
  open = 0,
  group,
  size = "lg",
}: {
  items: { q: React.ReactNode; a: React.ReactNode; id?: string }[];
  open?: number | null;
  group?: string;
  size?: "lg" | "md";
}) {
  return (
    <div>
      {items.map((item, i) => (
        <details key={i} id={item.id} name={group} open={open === i} className="acc">
          <summary>
            <h3 className={`min-w-0 text-black ${size === "lg" ? "d-acc" : "font-display text-[16px] leading-[22px] font-normal sm:text-[17px]"}`}>{item.q}</h3>
            <span className="acc-toggle" aria-hidden="true">
              <svg width="10" height="7" viewBox="0 0 10 7">
                <path d="M1 1.5L5 5.5L9 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </summary>
          <div className="t-body max-w-[640px] space-y-3 px-[12.5px] pb-[30px] text-black">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Grey "learn more" link cards with a byline at the bottom. */
export function LearnCards({ title = "Learn more", items }: { title?: string; items: { href: string; title: string; by?: string }[] }) {
  return (
    <Band>
      <h2 className="d-h2 text-black">{title}</h2>
      <div className="mt-[10px] grid grid-cols-1 gap-[15px] md:grid-cols-3">
        {items.map((c) => (
          <Link key={c.href} href={c.href} className="group flex min-h-[300px] min-w-0 flex-col rounded-[16px] bg-paper-2 px-[30px] pt-[30px] pb-[40px] transition-colors hover:bg-[#ececec] max-md:min-h-[220px]">
            <h3 className="d-h4n text-black">{c.title}</h3>
            <span className="mt-auto flex items-center gap-3 pt-10 text-[14px] leading-[17px] font-semibold text-navy">
              <MarkBadge size={36} />
              {c.by ?? "Deploier"}
            </span>
          </Link>
        ))}
      </div>
    </Band>
  );
}

/** Dark strip of asset wordmarks under a gradient heading. Text only, no third-party logos. */
export function AssetStrip({ title, note, assets }: { title: string; note: React.ReactNode; assets: { symbol: string; name: string }[] }) {
  return (
    <section className="night on-dark pt-[75px] max-md:pt-[50px]">
      <div className="ctn">
        <div className="border-b border-[rgba(13,33,107,0.2)] pb-[60px]">
          <h2 className="d-h2 grad-text max-w-[682px]">{title}</h2>
          <p className="t-body mt-3 max-w-[682px] text-white/80">{note}</p>
          <ul className="mt-[40px] grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-7">
            {assets.map((a) => (
              <li key={a.symbol} className="min-w-0">
                <span className="block font-display text-[26px] leading-none font-medium tracking-[0.02em] text-white">{a.symbol}</span>
                <span className="mt-2 block text-[13px] text-white/60">{a.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** Left-bordered list rows (static), as used beside a dark panel. */
export function BarList({ items }: { items: { title: string; body?: React.ReactNode }[] }) {
  return (
    <ul className="space-y-[20px]">
      {items.map((i) => (
        <li key={i.title} className="border-l-[3px] border-[#d9cfff] pl-[17px]">
          <h3 className="d-acc py-[6px] text-black">{i.title}</h3>
          {i.body ? <div className="t-body pb-1 text-black">{i.body}</div> : null}
        </li>
      ))}
    </ul>
  );
}

/** Long-form text block used by the legal pages and the litepaper. */
export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[915px] text-[16px] leading-[24px] font-light text-black [&_h2]:mt-[30px] [&_h2]:font-display [&_h2]:text-[40px] [&_h2]:leading-[48px] [&_h2]:font-medium [&_h2]:text-black max-md:[&_h2]:text-[30px] max-md:[&_h2]:leading-[36px] [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mt-[14px] [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  );
}

/** Heading, a sub-line and a short list on the left; the lime contact card on the right. */
export function FormSection({
  title,
  tagline,
  children,
  dark = false,
  topic,
  id = "get-started",
}: {
  title: React.ReactNode;
  tagline?: React.ReactNode;
  children?: React.ReactNode;
  dark?: boolean;
  topic?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${dark ? "night on-dark" : "bg-white"} pt-[50px] pb-[100px] max-md:pb-[60px]`}>
      <div className="ctn">
        <div className="grid grid-cols-1 items-center gap-x-[15px] gap-y-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-x-12 xl:grid-cols-[minmax(0,682px)_minmax(0,1fr)] min-[1400px]:gap-x-[130px]">
          <div className="min-w-0">
            <h2 className={`d-h2 max-w-[682px] ${dark ? "text-white" : "text-black"}`}>{title}</h2>
            {tagline ? <p className={`t-sub mt-[10px] max-w-[580px] ${dark ? "text-white" : "text-black"}`}>{tagline}</p> : null}
            {children ? (
              <div className={`mt-[30px] max-w-[580px] text-[16px] leading-[24px] [&_li]:mt-1 [&_ul]:list-disc [&_ul]:pl-5 ${dark ? "text-white" : "text-black"}`}>{children}</div>
            ) : null}
          </div>
          <ContactForm topic={topic} />
        </div>
      </div>
    </section>
  );
}

/** Centred FAQ list under a display heading. */
export function FaqBlock({ title, items, className = "" }: { title: React.ReactNode; items: { q: string; a: React.ReactNode }[]; className?: string }) {
  return (
    <section className={`py-[75px] max-md:py-[50px] ${className}`}>
      <div className="ctn">
        <h2 className="d-h2 text-center text-black">{title}</h2>
        <div className="mx-auto mt-[30px] max-w-[918px]">
          <Accordion items={items} open={null} size="md" />
        </div>
      </div>
    </section>
  );
}
