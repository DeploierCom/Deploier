/*
 * Illustrations drawn in code. The recurring idea: a settlement statement
 * whose sensitive lines are barred for the public and open for the parties.
 */

const ROWS: { label: string; value: string; barred: boolean }[] = [
  { label: "Counterparty", value: "0x8b41…c07e", barred: true },
  { label: "Delivers", value: "250,000.00 USDG", barred: true },
  { label: "Receives", value: "1,190 NVDA token", barred: true },
  { label: "Memo", value: "Q4 rebalance, desk 3", barred: true },
  { label: "Commitment", value: "0x5d2e…91af", barred: false },
  { label: "Status", value: "Settled · final", barred: false },
];

/** Hero statement. The bars slide away and return: the same record, seen by a party and by the public. */
export function StatementArt() {
  return (
    <figure className="relative">
      <div className="border border-ink bg-card shadow-[10px_10px_0_var(--color-ink)]">
        <div className="flex items-center justify-between gap-3 border-b border-ink px-4 py-3">
          <span className="num text-[12px] tracking-[0.06em] text-ink-3 uppercase">Settlement statement</span>
          <span className="chip">Example</span>
        </div>
        <dl className="px-4 py-1">
          {ROWS.map((row) => (
            <div key={row.label} className="grid grid-cols-[110px_minmax(0,1fr)] items-center gap-3 border-b border-line py-[8px] last:border-b-0 sm:grid-cols-[130px_minmax(0,1fr)]">
              <dt className="eyebrow text-[11px]">{row.label}</dt>
              <dd className="relative min-w-0 truncate font-mono text-[13.5px] text-ink">
                {row.value}
                {row.barred ? <span aria-hidden="true" className="bar-anim absolute inset-y-[3px] left-0 w-[92%] bg-ink" /> : null}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between gap-3 border-t border-ink bg-paper-2 px-4 py-2.5">
          <span className="text-[13px] text-ink-2">Public sees the bars. The two parties see the terms.</span>
          <span aria-hidden="true" className="size-2.5 shrink-0 bg-seal" />
        </div>
      </div>
      <figcaption className="sr-only">
        An example settlement statement. Counterparty, amounts and memo are hidden from the public; the commitment hash and the final status are visible to everyone.
      </figcaption>
    </figure>
  );
}

/** Flow of one private settlement across the two layers. */
export function LayerDiagram() {
  return (
    <figure className="scroll-x min-w-0">
      <svg viewBox="0 0 760 330" role="img" aria-labelledby="layer-title" className="h-auto w-full min-w-[620px]" fontFamily="var(--font-mono)">
        <title id="layer-title">Two wallets agree terms privately in Deploier; Robinhood Chain records only a commitment and the final state.</title>
        <rect x="1" y="1" width="758" height="150" fill="var(--color-card)" stroke="var(--color-ink)" />
        <text x="18" y="26" fontSize="12" fill="var(--color-ink-3)" letterSpacing="1">DEPLOIER · PRIVATE LAYER</text>
        <rect x="30" y="50" width="170" height="74" fill="var(--color-paper)" stroke="var(--color-ink)" />
        <text x="46" y="78" fontSize="14" fill="var(--color-ink)">Wallet A</text>
        <text x="46" y="102" fontSize="11" fill="var(--color-ink-3)">proposes terms</text>
        <rect x="560" y="50" width="170" height="74" fill="var(--color-paper)" stroke="var(--color-ink)" />
        <text x="576" y="78" fontSize="14" fill="var(--color-ink)">Wallet B</text>
        <text x="576" y="102" fontSize="11" fill="var(--color-ink-3)">accepts terms</text>
        <rect x="262" y="42" width="236" height="90" fill="var(--color-ink)" />
        <text x="380" y="70" fontSize="12" textAnchor="middle" fill="var(--color-paper)">PRIVATE RECORD</text>
        <rect x="292" y="84" width="176" height="8" fill="var(--color-paper)" opacity=".85" />
        <rect x="292" y="100" width="120" height="8" fill="var(--color-paper)" opacity=".85" />
        <rect x="420" y="100" width="48" height="8" fill="var(--color-seal)" />
        <path d="M200 87H262M498 87H560" stroke="var(--color-ink)" strokeWidth="1.5" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto">
            <path d="M0 0L8 4L0 8Z" fill="var(--color-ink)" />
          </marker>
        </defs>
        <path d="M380 132V200" stroke="var(--color-seal)" strokeWidth="2" strokeDasharray="5 4" markerEnd="url(#arrow)" />
        <text x="392" y="172" fontSize="11" fill="var(--color-seal)">commitment hash only</text>
        <rect x="1" y="210" width="758" height="118" fill="var(--color-stamp)" />
        <text x="18" y="236" fontSize="12" fill="#fff" letterSpacing="1" opacity=".8">ROBINHOOD CHAIN · PUBLIC LAYER</text>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            <rect x={30 + i * 120} y="256" width="100" height="50" fill="none" stroke="#fff" strokeOpacity=".55" />
            <text x={80 + i * 120} y="286" fontSize="11" textAnchor="middle" fill="#fff" opacity=".85">
              block
            </text>
          </g>
        ))}
        <rect x="270" y="256" width="100" height="50" fill="#fff" />
        <text x="320" y="279" fontSize="11" textAnchor="middle" fill="var(--color-stamp)">0x5d2e…</text>
        <text x="320" y="295" fontSize="10" textAnchor="middle" fill="var(--color-stamp)">final</text>
      </svg>
    </figure>
  );
}

/** Three overlapping frames: the path cards' small emblem. */
export function PathGlyph({ variant }: { variant: "connect" | "build" | "run" }) {
  return (
    <svg width="56" height="40" viewBox="0 0 56 40" aria-hidden="true" className="text-ink">
      {variant === "connect" ? (
        <>
          <rect x="1" y="9" width="22" height="22" fill="none" stroke="currentColor" />
          <rect x="33" y="9" width="22" height="22" fill="none" stroke="currentColor" />
          <path d="M23 20H33" stroke="var(--color-seal)" strokeWidth="2" />
        </>
      ) : variant === "build" ? (
        <>
          <rect x="1" y="27" width="54" height="12" fill="none" stroke="currentColor" />
          <rect x="9" y="14" width="38" height="12" fill="none" stroke="currentColor" />
          <rect x="17" y="1" width="22" height="12" fill="var(--color-seal)" />
        </>
      ) : (
        <>
          <circle cx="28" cy="20" r="18" fill="none" stroke="currentColor" />
          <circle cx="28" cy="20" r="9" fill="none" stroke="currentColor" />
          <rect x="24" y="16" width="8" height="8" fill="var(--color-seal)" />
        </>
      )}
    </svg>
  );
}
