import Link from "next/link";

/*
 * Page primitives. Server components: every word they render is in the HTML
 * the crawler receives.
 */

export function PageHead({
  kicker,
  title,
  lede,
  children,
  art,
}: {
  kicker: string;
  title: React.ReactNode;
  lede: React.ReactNode;
  children?: React.ReactNode;
  art?: React.ReactNode;
}) {
  return (
    <section className="border-b border-ink">
      <div className={`wrap wrap-wide grid grid-cols-1 gap-10 py-14 md:py-20 ${art ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-center" : ""}`}>
        <div className="min-w-0">
          <p className="eyebrow">{kicker}</p>
          <h1 className="h-display mt-4 text-[44px] sm:text-[58px] lg:text-[68px]">{title}</h1>
          <div className="lede mt-6 max-w-[620px]">{lede}</div>
          {children ? <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div> : null}
        </div>
        {art ? <div className="min-w-0">{art}</div> : null}
      </div>
    </section>
  );
}

export function Section({
  id,
  index,
  title,
  lede,
  children,
  night = false,
  className = "",
}: {
  id?: string;
  index?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  children?: React.ReactNode;
  night?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={`border-b border-ink ${night ? "night" : ""} ${className}`}>
      <div className="wrap wrap-wide py-16 md:py-20">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[120px_minmax(0,1fr)]">
          <p className="num pt-2 text-[13px] text-ink-3">{index ?? ""}</p>
          <div className="min-w-0">
            <h2 className="h-display max-w-[860px] text-[34px] sm:text-[44px]">{title}</h2>
            {lede ? <div className="lede mt-5 max-w-[700px]">{lede}</div> : null}
            {children ? <div className="mt-10">{children}</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Stat({ label, value, note, testid }: { label: string; value: React.ReactNode; note?: React.ReactNode; testid?: string }) {
  return (
    <div className="min-w-0 border-t border-ink pt-3">
      <p className="eyebrow">{label}</p>
      <p className="num mt-2 text-[26px] leading-tight break-words text-ink" data-testid={testid}>
        {value}
      </p>
      {note ? <p className="mt-1 text-[13px] text-ink-3">{note}</p> : null}
    </div>
  );
}

export const LiveTag = ({ children = "Live from Robinhood Chain" }: { children?: React.ReactNode }) => <span className="chip chip-live">{children}</span>;
export const PracticeTag = ({ children = "Practice mode" }: { children?: React.ReactNode }) => <span className="chip chip-practice">{children}</span>;
export const TargetTag = ({ children = "Target, not live" }: { children?: React.ReactNode }) => <span className="chip chip-target">{children}</span>;

export function ArrowLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const external = href.startsWith("http");
  const cls = `group inline-flex items-center gap-1.5 border-b border-current pb-0.5 text-[15px] font-medium text-stamp hover:text-ink ${className}`;
  const body = (
    <>
      {children}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
        {external ? "↗" : "→"}
      </span>
    </>
  );
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {body}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {body}
    </Link>
  );
}

/** Numbered rows: term on the left, explanation on the right. */
export function Rows({ items }: { items: { title: string; body: React.ReactNode }[] }) {
  return (
    <ol className="border-t border-ink">
      {items.map((item, i) => (
        <li key={item.title} className="grid grid-cols-1 gap-2 border-b border-line py-6 md:grid-cols-[56px_minmax(0,1fr)_minmax(0,1.6fr)] md:gap-6">
          <span className="num text-[13px] text-ink-3">{String(i + 1).padStart(2, "0")}</span>
          <h3 className="serif text-[25px] leading-tight">{item.title}</h3>
          <div className="text-[16px] text-ink-2">{item.body}</div>
        </li>
      ))}
    </ol>
  );
}

/** Two or three columns of plain text blocks with a rule on top. */
export function Columns({ items, cols = 3 }: { items: { title: string; body: React.ReactNode }[]; cols?: 2 | 3 }) {
  return (
    <div className={`grid grid-cols-1 gap-x-10 gap-y-10 ${cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.title} className="min-w-0 border-t border-ink pt-4">
          <h3 className="text-[19px] leading-snug font-semibold">{item.title}</h3>
          <div className="mt-3 text-[15.5px] text-ink-2">{item.body}</div>
        </div>
      ))}
    </div>
  );
}

export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="border-t border-ink">
      {items.map((item) => (
        <details key={item.q} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 text-[18px] font-medium [&::-webkit-details-marker]:hidden">
            <h3 className="min-w-0">{item.q}</h3>
            <span aria-hidden="true" className="num mt-0.5 shrink-0 text-ink-3 transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <div className="prose-d max-w-[760px] pb-6 text-[16px]">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

/** Closing call to action used at the end of most pages. */
export function CtaBand({ title, body, children }: { title: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="night border-b border-ink">
      <div className="wrap wrap-wide grid grid-cols-1 gap-8 py-16 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-end md:py-20">
        <div className="min-w-0">
          <h2 className="h-display text-[36px] sm:text-[48px]">{title}</h2>
          <div className="lede mt-4 max-w-[620px]">{body}</div>
        </div>
        <div className="flex flex-wrap gap-3 md:justify-end">{children}</div>
      </div>
    </section>
  );
}

/** A short definition list: label, value. */
export function Defs({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 border-t border-ink sm:grid-cols-[200px_minmax(0,1fr)]">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="eyebrow border-b border-line py-3 sm:pr-4">{k}</dt>
          <dd className="min-w-0 border-b border-line py-3 text-[15px] break-words text-ink-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
