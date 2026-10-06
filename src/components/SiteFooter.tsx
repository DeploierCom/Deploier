import Link from "next/link";
import { BRAND, CHAIN, hasGithub } from "@/config/brand";
import { CopyCaBlock } from "@/components/CopyCa";
import { Wordmark } from "@/components/Mark";
import { FOOTER, LEGAL } from "@/components/site";

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.2.8.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}

const heading = "font-display text-[20px] leading-[24px] font-semibold text-white";
const social = "grid size-[38px] place-items-center rounded-[8px] bg-white text-black transition-colors hover:bg-accent";

export function SiteFooter() {
  return (
    <footer className="night on-dark bg-board py-[70px] text-white">
      <div className="ctn">
        <div className="grid grid-cols-1 gap-x-[28px] gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[175px_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,1.3fr)_88px]">
          <Link href="/" aria-label={`${BRAND.name} home`} className="self-start">
            <Wordmark size={24} />
          </Link>
          {FOOTER.map((group) => (
            <div key={group.label} className="min-w-0">
              <h2 className={heading}>{group.label}</h2>
              <ul className="mt-[20px] space-y-[20px] text-[16px] leading-[24px] max-xl:space-y-[10px] max-sm:pl-3">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-white transition-colors hover:text-accent">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="min-w-0">
            <h2 className={heading}>Contact Us</h2>
            <Link href="/contact" className="btn btn-accent btn-sm mt-[20px]">
              Talk to the team
            </Link>
            <p className="mt-6 text-[14px] leading-[21px] text-white/70">{BRAND.symbol} contract</p>
            <CopyCaBlock className="mt-2" />
          </div>
          <div className="flex gap-[10px] xl:flex-col xl:items-end">
            <a href={BRAND.x} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on X`} className={social}>
              <XIcon />
            </a>
            {hasGithub ? (
              <a href={BRAND.github} target="_blank" rel="noreferrer" aria-label={`${BRAND.name} on GitHub`} className={social}>
                <GithubIcon />
              </a>
            ) : null}
          </div>
        </div>
        <div className="mt-[70px] flex flex-col gap-4 text-[12px] leading-[18px] lg:flex-row lg:items-end lg:justify-between max-md:mt-12">
          <p className="max-w-[560px] text-white/60">
            {BRAND.symbol} is a token on {CHAIN.name} (chain id {CHAIN.id}). Not an offer of securities. Settlement features run in practice
            mode until audited contracts ship.
          </p>
          <div className="flex flex-wrap items-center gap-x-[22px] gap-y-2 text-white">
            <span>
              © 2026 {BRAND.name}. All rights reserved <span className="mx-[6px] text-white/50">|</span>
            </span>
            {LEGAL.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
