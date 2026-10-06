import { BRAND } from "@/config/brand";

/*
 * The Deploier mark: a D whose counter holds one redaction bar, the record the
 * public never reads. Drawn inline so it is crisp at any size and follows the
 * current ink colour. The same geometry is rasterised for the icons and the
 * share card by referensi/tools/make-brand.mjs.
 */

export const MARK_PATH = "M14 10H32C44.15 10 54 19.85 54 32C54 44.15 44.15 54 32 54H14Z M23 19V45H32C39.18 45 45 39.18 45 32C45 24.82 39.18 19 32 19Z";
export const MARK_BAR = { x: 23, y: 28.5, w: 17, h: 7 };

export function Mark({ size = 28, className = "", plate = false }: { size?: number; className?: string; plate?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className={`shrink-0 ${className}`}>
      {plate ? <rect width="64" height="64" rx="8" fill="var(--color-stamp)" /> : null}
      <path d={MARK_PATH} fillRule="evenodd" fill={plate ? "#fff" : "currentColor"} />
      <rect x={MARK_BAR.x} y={MARK_BAR.y} width={MARK_BAR.w} height={MARK_BAR.h} fill={plate ? "#fff" : "var(--color-seal)"} />
    </svg>
  );
}

/** Square badge: the mark on its own plate, used as an avatar. */
export function MarkBadge({ size = 36, className = "" }: { size?: number; className?: string }) {
  return <Mark size={size} plate className={className} />;
}

export function Wordmark({ className = "", size = 26 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Mark size={size} />
      <span className="serif relative top-[1px] leading-none tracking-[-0.01em]" style={{ fontSize: size * 1.12 }}>
        {BRAND.name}
      </span>
    </span>
  );
}
