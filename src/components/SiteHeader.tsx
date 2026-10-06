"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/config/brand";
import { CopyCaTag } from "@/components/CopyCa";
import { Wordmark } from "@/components/Mark";
import { NAV, isGroup, type NavGroup } from "@/components/site";
import { useChain } from "@/components/providers/ChainProvider";
import { NavWallet } from "@/components/wallet/WalletButton";

/** Latest Robinhood Chain block, read live. */
function ChainStatus() {
  const { facts, failed } = useChain();
  const live = Boolean(facts?.block) && !failed;
  return (
    <span
      className={`hidden items-center gap-2 font-mono text-[12px] whitespace-nowrap tabular-nums min-[1320px]:inline-flex ${failed ? "text-down" : "text-ink-3"}`}
      title={live ? "Reading Robinhood Chain live" : failed ? "Chain read failed, retrying" : "Connecting to Robinhood Chain"}
    >
      <span className={`size-1.5 ${live ? "pulse bg-up" : failed ? "bg-down" : "bg-ink-3"}`} />
      <span data-testid="tape-block">{failed ? "chain read failed" : facts?.block ? `#${facts.block.toLocaleString("en-US")}` : "connecting…"}</span>
    </span>
  );
}

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
  const active = group.items.some((i) => isActive(i.href));
  return (
    <div ref={ref} className="relative inline-flex" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setOpen(true)}
        className={`flex cursor-pointer items-center gap-1.5 border-b py-1 whitespace-nowrap transition-colors hover:text-ink ${active ? "border-ink text-ink" : "border-transparent text-ink-2"}`}
      >
        {group.label}
        <svg width="9" height="6" viewBox="0 0 9 6" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l3.5 3.5L8 1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
      {open ? <span className="absolute top-full right-[-16px] left-[-16px] h-[22px]" /> : null}
      {open ? (
        <div className="sheet absolute top-[calc(100%+14px)] left-[-16px] z-40 w-[300px] py-1">
          {group.items.map((item, i) => {
            const here = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={here ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`block px-4 py-2.5 text-ink transition-colors hover:bg-paper-2 ${i ? "border-t border-line" : ""}`}
              >
                <span className={`block text-[15px] leading-tight font-medium ${here ? "text-stamp" : ""}`}>{item.label}</span>
                {item.note ? <span className="mt-0.5 block text-[13px] text-ink-3">{item.note}</span> : null}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function MobileMenu({ isActive, onClose }: { isActive: (href: string) => boolean; onClose: () => void }) {
  return (
    <div className="absolute inset-x-0 top-full z-40 max-h-[calc(100dvh-64px)] overflow-y-auto border-b border-ink bg-paper">
      <nav aria-label="Mobile" className="wrap grid grid-cols-1 gap-x-8 gap-y-6 py-6 sm:grid-cols-2">
        {NAV.map((entry) =>
          isGroup(entry) ? (
            <div key={entry.label}>
              <p className="eyebrow">{entry.label}</p>
              <ul className="mt-2">
                {entry.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className={`block border-b border-line py-2 text-[16px] ${isActive(item.href) ? "text-stamp" : "text-ink"}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div key={entry.href}>
              <p className="eyebrow">Docs</p>
              <Link href={entry.href} onClick={onClose} className="mt-2 block border-b border-line py-2 text-[16px] text-ink">
                {entry.label}
              </Link>
              <Link href="/app" onClick={onClose} className="block border-b border-line py-2 text-[16px] text-ink">
                Practice desk
              </Link>
            </div>
          ),
        )}
      </nav>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menu, setMenu] = useState(false);
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  return (
    // No backdrop-filter here: it would trap fixed-position dialogs inside the header.
    <header className={`sticky top-0 z-30 border-b border-ink bg-[var(--nav-bg)] transition-shadow ${solid ? "shadow-[0_6px_24px_var(--shade)]" : ""}`}>
      <div data-testid="navrow" className="wrap wrap-wide flex h-16 items-center gap-6 max-[1180px]:gap-4 max-[560px]:gap-2">
        <Link href="/" aria-label={`${BRAND.name} home`} className="shrink-0">
          <Wordmark size={24} className="max-[400px]:[&>span]:!text-[23px]" />
        </Link>
        <nav aria-label="Main" className="ml-4 hidden items-center gap-6 text-[15px] min-[1080px]:flex max-[1180px]:ml-1 max-[1180px]:gap-4">
          {NAV.map((entry) =>
            isGroup(entry) ? (
              <Dropdown key={entry.label} group={entry} isActive={isActive} />
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={isActive(entry.href) ? "page" : undefined}
                className={`border-b py-1 whitespace-nowrap transition-colors hover:text-ink ${isActive(entry.href) ? "border-ink text-ink" : "border-transparent text-ink-2"}`}
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>
        <div className="ml-auto flex min-w-0 items-center gap-3 max-[1180px]:gap-2.5 max-[560px]:gap-1.5">
          <ChainStatus />
          <CopyCaTag compact />
          <Link href="/app" className="btn btn-ghost h-9 min-h-0 px-3 text-[14px] max-[1240px]:hidden">
            Practice desk
          </Link>
          <span className="hidden sm:block">
            <NavWallet />
          </span>
          <span className="sm:hidden">
            <NavWallet compact />
          </span>
          <button
            type="button"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((v) => !v)}
            className="grid size-9 shrink-0 cursor-pointer place-items-center border border-line-2 text-ink min-[1080px]:hidden"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
              {menu ? (
                <path d="M3 1l12 12M15 1L3 13" stroke="currentColor" strokeWidth="1.6" />
              ) : (
                <path d="M0 1h18M0 7h18M0 13h18" stroke="currentColor" strokeWidth="1.6" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {menu ? <MobileMenu isActive={isActive} onClose={() => setMenu(false)} /> : null}
    </header>
  );
}
