"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/brand";
import { CopyCaTag } from "@/components/CopyCa";
import { Wordmark } from "@/components/Mark";
import { NAV, isGroup, type NavGroup } from "@/components/site";
import { NavWallet } from "@/components/wallet/WalletButton";
import { useWallet } from "@/components/wallet/WalletProvider";

function Caret({ open = false }: { open?: boolean }) {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="M1 1.5L5 5.5L9 1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Desktop dropdown: a lime panel of plain links under the label. */
function Dropdown({ group, isActive }: { group: NavGroup; isActive: (href: string) => boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(true)}
        className="flex cursor-pointer items-center gap-[10px] px-[15px] text-[16px] leading-[24px] font-bold whitespace-nowrap text-white transition-colors hover:text-accent"
      >
        {group.label}
        <Caret open={open} />
      </button>
      {open ? <span className="absolute top-full right-0 left-0 h-[30px]" /> : null}
      {open ? (
        <div className="absolute top-[calc(100%+28px)] left-[-62px] z-40 w-[330px] rounded-[16px] bg-accent px-[30px] py-[22px] shadow-[rgba(0,0,0,0.07)_0_0_80px_0]">
          <ul className="flex flex-col gap-[17px]">
            {group.items.map((item) => {
              const here = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={here ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={`block text-[16px] leading-[20px] text-black transition-opacity hover:opacity-70 ${here ? "font-semibold" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/** Full-screen phone menu: big rows, each group opens its own panel with a Back link. */
function MobileMenu({ isActive, onClose }: { isActive: (href: string) => boolean; onClose: () => void }) {
  const [panel, setPanel] = useState<NavGroup | null>(null);
  const row = "flex w-full items-center justify-between border-b border-[#333] py-[20px] text-left text-[24px] leading-[26px] font-bold text-white";
  return (
    <div role="dialog" aria-modal="true" aria-label="Menu" className="fixed inset-0 z-[60] overflow-y-auto bg-black text-white">
      <div className="ctn flex h-[var(--header-h)] items-center justify-between">
        <Link href="/" onClick={onClose} aria-label={`${BRAND.name} home`}>
          <Wordmark size={24} />
        </Link>
        <button type="button" aria-label="Close menu" onClick={onClose} className="grid size-10 cursor-pointer place-items-center text-white">
          <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
            <path d="M2 2l18 18M20 2L2 20" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </button>
      </div>
      <nav aria-label="Mobile" className="ctn pb-12">
        {panel ? (
          <div>
            <button type="button" onClick={() => setPanel(null)} className="flex cursor-pointer items-center gap-3 py-3 pl-1 text-[14px] font-bold">
              <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
                <path d="M7 1L1 7l6 6M1 7h16" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              Back
            </button>
            <ul className="pl-5">
              {panel.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block border-b border-[#333] py-[13px] text-[20px] leading-[24px] ${isActive(item.href) ? "text-accent" : "text-white"}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <>
            <ul className="border-t border-[#333]">
              {NAV.map((entry) =>
                isGroup(entry) ? (
                  <li key={entry.label}>
                    <button type="button" onClick={() => setPanel(entry)} className={`${row} cursor-pointer`}>
                      {entry.label}
                      <Caret />
                    </button>
                  </li>
                ) : (
                  <li key={entry.href}>
                    <Link href={entry.href} onClick={onClose} className={row}>
                      {entry.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
            <div className="mt-[46px] flex flex-col items-center gap-3">
              <Link href="/app" onClick={onClose} className="btn btn-accent btn-sm w-full max-w-[340px]">
                Open the practice desk
              </Link>
              <Link href="/contact" onClick={onClose} className="btn btn-ghost btn-sm w-full max-w-[340px] !border-white !text-white">
                Talk to the team
              </Link>
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const { address } = useWallet();
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menu]);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    // No backdrop-filter here: it would trap fixed-position dialogs inside the header.
    <header className="night sticky top-0 z-30 bg-board">
      <div data-testid="navrow" className="ctn flex h-[var(--header-h)] items-center gap-4 max-[560px]:gap-2">
        <Link href="/" aria-label={`${BRAND.name} home`} className="shrink-0">
          <Wordmark
            size={30}
            // Once a wallet chip sits in the bar, small phones keep the mark and drop the name to make room.
            className={`max-[1199.98px]:!text-[24px] max-[400px]:!text-[21px] ${address ? "max-[440px]:[&>span:last-child]:hidden" : ""}`}
          />
        </Link>
        <nav aria-label="Main" className="ml-auto hidden items-center min-[1200px]:flex">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <Dropdown key={entry.label} group={entry} isActive={isActive} />
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={isActive(entry.href) ? "page" : undefined}
                className="px-[10px] py-[5px] text-[16px] leading-[24px] font-bold whitespace-nowrap text-white transition-colors hover:text-accent"
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex min-w-0 items-center gap-[10px] max-[1199.98px]:ml-auto min-[1200px]:ml-[15px] max-[560px]:gap-1.5">
          <CopyCaTag compact />
          <span className="hidden sm:block">
            <NavWallet />
          </span>
          <span className="sm:hidden">
            <NavWallet compact />
          </span>
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menu}
            onClick={() => setMenu(true)}
            className="grid size-10 shrink-0 cursor-pointer place-items-center text-white min-[1200px]:hidden max-[400px]:-mr-1.5 max-[400px]:w-8"
          >
            <svg width="24" height="18" viewBox="0 0 24 18" aria-hidden="true">
              <path d="M0 1h24M0 9h24M0 17h24" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </div>
      {menu ? <MobileMenu isActive={isActive} onClose={() => setMenu(false)} /> : null}
    </header>
  );
}
