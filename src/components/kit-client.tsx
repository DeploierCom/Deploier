"use client";

import { useEffect, useId, useState } from "react";
import { Check } from "lucide-react";
import { BRAND } from "@/config/brand";

/*
 * Interactive section modules. All text is rendered on the server as well;
 * script only switches which item is shown.
 */

export type Quote = { text: string; by: string; role: string };

/** Coral band with one statement at a time and round previous/next buttons. */
export function QuoteBand({ quotes }: { quotes: Quote[] }) {
  const [i, setI] = useState(0);
  const n = quotes.length;
  useEffect(() => {
    if (n < 2) return;
    const t = window.setInterval(() => document.visibilityState === "visible" && setI((v) => (v + 1) % n), 9000);
    return () => window.clearInterval(t);
  }, [n]);
  const go = (d: number) => setI((v) => (v + d + n) % n);
  return (
    <section className="py-[75px] max-md:py-[40px]">
      <div className="ctn">
        <div className="relative overflow-hidden rounded-[16px] bg-coral px-[100px] py-[50px] text-black max-lg:px-[64px] max-md:px-[20px] max-md:pb-[96px]" aria-roledescription="carousel">
          <div className="grid">
            {quotes.map((q, k) => (
              <figure
                key={q.text}
                aria-hidden={k !== i}
                className={`mx-auto max-w-[1080px] text-center transition-opacity duration-500 [grid-area:1/1] ${k === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <blockquote className="text-[32px] leading-[40px] font-normal max-md:text-[22px] max-md:leading-[30px]">“{q.text}”</blockquote>
                <figcaption className="mt-[30px]">
                  <span className="block text-[20px] leading-[20px] font-semibold">{q.by}</span>
                  <span className="block text-[20px] leading-[40px] max-md:text-[16px] max-md:leading-[28px]">{q.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          {n > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous statement"
                onClick={() => go(-1)}
                className="absolute top-1/2 left-[38px] grid size-[56px] -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 max-lg:left-[6px] max-md:top-auto max-md:bottom-[24px] max-md:left-[calc(50%-64px)] max-md:translate-y-0"
              >
                <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
                  <path d="M6 1.5L1.5 6 6 10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next statement"
                onClick={() => go(1)}
                className="absolute top-1/2 right-[38px] grid size-[56px] -translate-y-1/2 cursor-pointer place-items-center rounded-full bg-white text-black transition-transform hover:scale-105 max-lg:right-[6px] max-md:top-auto max-md:right-[calc(50%-64px)] max-md:bottom-[24px] max-md:translate-y-0"
              >
                <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
                  <path d="M2 1.5L6.5 6 2 10.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export type TabItem = { label: string; title: string; body: React.ReactNode; art: React.ReactNode; href?: string; cta?: string };

/** Left-bordered list of options; the dark panel on the right shows the chosen one. */
export function TabShowcase({ items }: { items: TabItem[] }) {
  const [i, setI] = useState(0);
  const id = useId();
  return (
    <div className="grid grid-cols-1 gap-x-[15px] gap-y-8 lg:grid-cols-2">
      <div role="tablist" aria-orientation="vertical" className="flex min-w-0 flex-col gap-[20px]">
        {items.map((t, k) => (
          <div key={t.label}>
            <button
              type="button"
              role="tab"
              id={`${id}-t${k}`}
              aria-selected={k === i}
              aria-controls={`${id}-p${k}`}
              onClick={() => setI(k)}
              className={`d-acc w-full cursor-pointer border-l-[3px] py-[15px] pl-[17px] text-left transition-colors ${k === i ? "border-violet text-black" : "border-[#e2dcff] text-black/75 hover:border-[#c4b5ff] hover:text-black"}`}
            >
              {t.label}
            </button>
          </div>
        ))}
      </div>
      <div className="grid min-w-0">
        {items.map((t, k) => (
          <div
            key={t.label}
            role="tabpanel"
            id={`${id}-p${k}`}
            aria-labelledby={`${id}-t${k}`}
            hidden={k !== i}
            className="on-dark night min-w-0 overflow-hidden rounded-[16px] bg-board text-white"
          >
            <div className="h-[260px] border-b border-white/10 max-md:h-[200px]">{t.art}</div>
            <div className="p-[30px] max-md:p-[22px]">
              <h3 className="d-h4 text-white">{t.title}</h3>
              <div className="t-body mt-3 text-white/90">{t.body}</div>
              {t.href ? (
                <a href={t.href} className="more mt-5">
                  {t.cta ?? "Read more"}
                  <svg width="8" height="12" viewBox="0 0 8 12" aria-hidden="true">
                    <path d="M1.5 1.5L6 6l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SEGMENTS = ["Bank or broker", "Custodian", "Exchange or trading venue", "Asset issuer or treasury", "Payment provider", "Crypto trading firm", "Builder or developer", "Press or research", "Other"];

/**
 * Mint contact card. The site has no form backend and keeps no submissions:
 * the message is assembled here, copied to the clipboard, and the official X
 * profile opens so it can be sent as a direct message.
 */
export function ContactForm({ topic = "general" }: { topic?: string }) {
  const id = useId();
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [text, setText] = useState("");
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    const lines = [
      `Hello ${BRAND.name} team,`,
      "",
      get("message") || "(no message)",
      "",
      `Name: ${[get("first"), get("last")].filter(Boolean).join(" ") || "-"}`,
      `Organisation: ${get("org") || "-"}`,
      `Role: ${get("role") || "-"}`,
      `Segment: ${get("segment") || "-"}`,
      `Topic: ${topic}`,
    ];
    const msg = lines.join("\n");
    setText(msg);
    try {
      await navigator.clipboard.writeText(msg);
      setState("copied");
    } catch {
      setState("manual");
    }
    window.open(BRAND.x, "_blank", "noopener,noreferrer");
  };
  const label = "mb-[6px] block text-[14px] leading-[24px] font-semibold text-black";
  const field = "w-full min-w-0 rounded-[5px] border border-[#1b1b1b] bg-transparent p-[10px] text-[14px] text-black placeholder:text-black/45 focus:border-[#000] focus:outline-none focus:ring-2 focus:ring-black/15";
  return (
    <form onSubmit={onSubmit} className="min-w-0 rounded-[16px] bg-accent-form p-[35px] text-black max-md:p-[22px]" aria-describedby={`${id}-note`}>
      <div className="grid grid-cols-1 gap-x-[15px] gap-y-[14px] sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor={`${id}-first`} className={label}>
            First name
          </label>
          <input id={`${id}-first`} name="first" autoComplete="given-name" className={field} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-last`} className={label}>
            Last name
          </label>
          <input id={`${id}-last`} name="last" autoComplete="family-name" className={field} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-org`} className={label}>
            Organisation
          </label>
          <input id={`${id}-org`} name="org" autoComplete="organization" className={field} />
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-role`} className={label}>
            Role
          </label>
          <input id={`${id}-role`} name="role" autoComplete="organization-title" className={field} />
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={`${id}-segment`} className={label}>
            What best describes you
          </label>
          <select id={`${id}-segment`} name="segment" defaultValue="" className={`${field} cursor-pointer`}>
            <option value="">Select…</option>
            {SEGMENTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={`${id}-message`} className={label}>
            Message
          </label>
          <textarea id={`${id}-message`} name="message" required rows={4} className={`${field} min-h-[100px] resize-y`} />
        </div>
      </div>
      <p id={`${id}-note`} className="mt-[18px] text-[12px] leading-[19px] text-black/80">
        This form sends nothing to our servers and stores nothing. Pressing the button copies your message and opens {BRAND.xHandle} on X,
        where you paste it into a direct message. The team will never ask for a seed phrase, a private key or a payment.
      </p>
      <div className="mt-[18px] flex flex-col items-center gap-3">
        <button type="submit" className="btn btn-ink min-h-[46px] text-center text-[14px] whitespace-normal">
          {state === "copied" ? (
            <>
              <Check className="size-4" strokeWidth={2.5} /> Copied, X opened
            </>
          ) : (
            "Copy message and open X"
          )}
        </button>
        {state === "manual" ? (
          <label className="w-full text-[12px] text-black/80">
            Your browser blocked the clipboard. Copy the message below:
            <textarea readOnly value={text} rows={5} className={`${field} mt-2 font-mono text-[12px]`} />
          </label>
        ) : null}
      </div>
    </form>
  );
}
