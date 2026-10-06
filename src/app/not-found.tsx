import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap wrap-wide py-20 sm:py-28">
      <p className="eyebrow">404 · no matching record</p>
      <h1 className="h-display mt-4 text-[44px] sm:text-[64px]">
        This page was never <em>settled.</em>
      </h1>
      <p className="lede mt-5 max-w-[36em]">The address you followed does not match any page on this site.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-ink">
          Back to the home page
        </Link>
        <Link href="/faq" className="btn btn-ghost">
          Read the FAQ
        </Link>
      </div>
    </section>
  );
}
