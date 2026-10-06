import { BRAND } from "@/config/brand";

/*
 * The Deploier mark: a D whose counter holds one redaction bar, the record the
 * public never reads. Drawn inline so it is crisp at any size. The same
 * geometry is rasterised for the icons and the share card by
 * referensi/tools/make-brand.mjs.
 */

export const MARK_PATH = "M14 10H32C44.15 10 54 19.85 54 32C54 44.15 44.15 54 32 54H14Z M23 19V45H32C39.18 45 45 39.18 45 32C45 24.82 39.18 19 32 19Z";
export const MARK_BAR = { x: 23, y: 28.5, w: 17, h: 7 };

type Tone = "accent" | "ink" | "white";

const TONES: Record<Tone, { d: string; bar: string }> = {
  // On dark grounds: mint letter, white bar.
  accent: { d: "var(--color-accent)", bar: "#ffffff" },
  // On white: near-black letter, violet bar.
  ink: { d: "#1b1b1b", bar: "#6d38ff" },
  white: { d: "#ffffff", bar: "var(--color-accent)" },
};

export function Mark({ size = 28, className = "", plate = false, tone = "accent" }: { size?: number; className?: string; plate?: boolean; tone?: Tone }) {
  const t = TONES[tone];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 ${className}`}>
      {plate ? <rect width="64" height="64" rx="12" fill="#1b1b1b" /> : null}
      <path d={MARK_PATH} fillRule="evenodd" fill={plate ? "var(--color-accent)" : t.d} />
      <rect x={MARK_BAR.x} y={MARK_BAR.y} width={MARK_BAR.w} height={MARK_BAR.h} fill={plate ? "#ffffff" : t.bar} />
    </svg>
  );
}

/** Square badge: the mark on its own dark plate, used as an avatar. */
export function MarkBadge({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <Mark size={size} plate className={className} />;
}

/** Mark plus name, set in the display face. White text for dark grounds unless tone is "ink". */
export function Wordmark({ className = "", size = 26, tone = "accent" }: { className?: string; size?: number; tone?: Tone }) {
  return (
    <span className={`inline-flex items-center gap-[0.3em] ${className}`} style={{ fontSize: size }}>
      <Mark size={Math.round(size * 1.45)} tone={tone} />
      <span className={`font-display leading-none font-normal tracking-[-0.01em] ${tone === "ink" ? "text-[#1b1b1b]" : "text-white"}`}>{BRAND.name}</span>
    </span>
  );
}
