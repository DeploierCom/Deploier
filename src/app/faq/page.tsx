import Link from "next/link";
import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { FAQ } from "@/content/faq";
import { CtaBand, Faq, PageHead } from "@/components/ui";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/faq",
  title: "Deploier FAQ: Privacy, Network, Token, Audit | Deploier",
  description:
    "Plain answers about Deploier: what it is, how private settlement works, which network it runs on, how to buy $DEPLOIER and whether it is audited (not yet).",
});

export default function FaqPage() {
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: "FAQ", path: "/faq" }]), faqLd(FAQ.map((f) => ({ q: f.q, a: f.a.join(" ") })))]} />
      <PageHead
        kicker="FAQ"
        title={
          <>
            Questions, answered <em>plainly.</em>
          </>
        }
        lede={`The short version of ${BRAND.name}, including the parts that are not built yet. If something here is unclear, the litepaper has the long version.`}
      />
      <section className="border-b border-ink">
        <div className="wrap wrap-wide py-14">
          <Faq
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
        </div>
      </section>
      <CtaBand title="Still have a question?" body="The litepaper covers the design in depth. The team answers the rest.">
        <Link href="/litepaper" className="btn btn-accent">
          Read the litepaper <span className="arr">→</span>
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          Contact
        </Link>
      </CtaBand>
    </>
  );
}
