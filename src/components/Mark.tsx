import { BRAND } from "@/config/brand";

/*
 * The Deploier mark: the owner's striped lime D. The files in public/brand are
 * made by referensi/tools/make-brand.mjs from the owner's originals:
 *   deploier-mark.webp        lime, trimmed, for dark grounds
 *   deploier-mark-ink.webp    near-black, for white and light grounds (lime on white does not read)
 *   deploier-mark-white.webp  white, for coloured grounds
 *   deploier-mark-plate.webp  lime on its #1b1b1b plate, square, for avatars
 * The trimmed mark is 433x536 (ratio 0.81). `size` is the square box it sits in,
 * so layouts sized for the earlier square mark keep their spacing.
 */

type Tone = "accent" | "ink" | "white";

const SRC: Record<Tone, string> = {
  accent: "/brand/deploier-mark.webp",
  ink: "/brand/deploier-mark-ink.webp",
  white: "/brand/deploier-mark-white.webp",
};
const RATIO = 433 / 536;

export function Mark({ size = 28, className = "", plate = false, tone = "accent" }: { size?: number; className?: string; plate?: boolean; tone?: Tone }) {
  if (plate) {
    return <img src="/brand/deploier-mark-plate.webp" alt="" aria-hidden="true" width={size} height={size} className={`shrink-0 rounded-[18%] ${className}`} />;
  }
  const h = Math.round(size * 0.72);
  return (
    <span aria-hidden="true" className={`inline-grid shrink-0 place-items-center ${className}`} style={{ width: size, height: size }}>
      <img src={SRC[tone]} alt="" width={Math.round(h * RATIO)} height={h} style={{ width: Math.round(h * RATIO), height: h }} />
    </span>
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
