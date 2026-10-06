import Link from "next/link";
import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Accordion, Hero } from "@/components/kit";
import { FAQ } from "@/content/faq";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/faq",
  title: "Deploier FAQ: Privacy, Network, Token, Contracts | Deploier",
  description:
    "Plain answers about Deploier: what it is, how private settlement works, which network it runs on, how to buy $DEPLOIER and what the settlement contracts do.",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "FAQ", path: "/faq" }]), faqLd(FAQ.map((f) => ({ q: f.q, a: f.a.join(" ") })))]} />
      <Hero
        art={{ src: "/art/waves.svg", className: "top-[-40px] right-0 h-[calc(100%+40px)] w-[55%] object-cover object-left-top" }}
        title={`${BRAND.name} FAQs`}
        sub="The short version, including the parts that are not built yet."
      />
      <section className="py-[105px] max-md:py-[50px]">
        <div className="ctn">
          <div className="mx-auto max-w-[918px]">
            <Accordion
              open={null}
              size="md"
              items={FAQ.map((f) => ({
                q: f.q,
                a: (
                  <>
                    {f.a.map((p) => (
                      <p key={p.slice(0, 24)}>{p}</p>
                    ))}
                  </>
                ),
              }))}
            />
            <p className="mt-10 text-[15px] text-ink-2">
              Still have a question? The <Link href="/litepaper" className="link">litepaper</Link> covers the design in depth, and the team answers the
              rest through the <Link href="/contact" className="link">contact page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
