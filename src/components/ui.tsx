/*
 * Small shared primitives: data tiles, status tags and a definition list.
 * Section-level modules live in kit.tsx.
 */

export function Stat({ label, value, note, testid }: { label: string; value: React.ReactNode; note?: React.ReactNode; testid?: string }) {
  return (
    <div className="min-w-0 rounded-[16px] bg-paper-2 px-[25px] py-[22px]">
      <p className="text-[14px] leading-[21px] font-semibold text-ink-3">{label}</p>
      <p className="mt-2 font-display text-[24px] leading-tight break-words text-ink" data-testid={testid}>
        {value}
      </p>
      {note ? <p className="mt-1 text-[13px] text-ink-3">{note}</p> : null}
    </div>
  );
}

export const LiveTag = ({ children = "Live from Robinhood Chain" }: { children?: React.ReactNode }) => <span className="chip chip-live">{children}</span>;
export const PracticeTag = ({ children = "Practice mode" }: { children?: React.ReactNode }) => <span className="chip chip-practice">{children}</span>;
export const TargetTag = ({ children = "Target, not live" }: { children?: React.ReactNode }) => <span className="chip chip-target">{children}</span>;

/** A short definition list: label, value. */
export function Defs({ items }: { items: [React.ReactNode, React.ReactNode][] }) {
  return (
    <dl className="grid grid-cols-1 border-t border-line sm:grid-cols-[220px_minmax(0,1fr)]">
      {items.map(([k, v], i) => (
        <div key={i} className="contents">
          <dt className="border-b border-line py-3 text-[14px] font-semibold text-ink sm:pr-4">{k}</dt>
          <dd className="min-w-0 border-b border-line py-3 text-[15px] break-words text-ink-2">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
