import Link from "next/link";
import { BRAND, CHAIN, hasGithub } from "@/config/brand";
import { CopyCaBlock } from "@/components/CopyCa";
import { Wordmark } from "@/components/Mark";
import { FOOTER } from "@/components/site";

function XIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="night mt-0 border-t border-ink">
      <div className="wrap wrap-wide py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <div className="min-w-0">
            <Link href="/" aria-label={`${BRAND.name} home`}>
              <Wordmark size={26} />
            </Link>
            <p className="mt-4 max-w-[360px] text-[15px] text-ink-2">
              {BRAND.slogan} A {BRAND.category} on {CHAIN.name}: public rules, private books.
            </p>
            <CopyCaBlock className="mt-6" />
            <div className="mt-5 flex items-center gap-2">
              <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className="grid size-9 place-items-center border border-line-2 text-ink transition-colors hover:border-ink">
                <XIcon />
              </a>
              {hasGithub ? (
                <a href={BRAND.github} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on GitHub`} className="grid size-9 place-items-center border border-line-2 text-ink transition-colors hover:border-ink">
                  <GithubIcon />
                </a>
              ) : null}
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {FOOTER.map((group) => (
              <div key={group.label} className="min-w-0">
                <p className="eyebrow">{group.label}</p>
                <ul className="mt-3 space-y-2 text-[14.5px]">
                  {group.items.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className="text-ink-2 transition-colors hover:text-ink">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line pt-5 text-[13px] text-ink-3">
          <p>
            © 2026 {BRAND.name}. {BRAND.symbol} is a token on {CHAIN.name} (chain id {CHAIN.id}). Not an offer of securities.
          </p>
          <p className="font-mono text-[12px]">Settlement features run in practice mode until audited contracts ship.</p>
        </div>
      </div>
    </footer>
  );
}
