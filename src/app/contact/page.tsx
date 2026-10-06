import Link from "next/link";
import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { Columns, PageHead, Section } from "@/components/ui";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/contact",
  title: "Contact the Deploier Team | Deploier",
  description: "Contact the Deploier team about private settlement on Robinhood Chain: building on the layer, running a desk, partnerships and press, via the official X.",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Contact", path: "/contact" }])} />
      <PageHead
        kicker="Contact"
        title={
          <>
            Talk to the people <em>building it.</em>
          </>
        }
        lede={`The fastest way to reach the ${BRAND.name} team is a direct message on X. Tell us who you are, what you want to settle or build, and how to reach you back.`}
      >
        <a href={BRAND.x} target="_blank" rel="noreferrer" className="btn btn-accent">
          Message {BRAND.xHandle} on X <span className="arr">↗</span>
        </a>
      </PageHead>
      <Section index="01" title="What to include in your message">
        <Columns
          items={[
            { title: "Building on the layer", body: "What you are building, which assets it settles and what the contract interface must support. See the developer reference first." },
            { title: "Running a desk", body: "The infrastructure you operate today and where it is hosted. The operator programme is in design; early input shapes it." },
            { title: "Institutions and press", body: "Your organisation and the question. We answer honestly about what is and is not live." },
          ]}
        />
        <p className="mt-10 max-w-[760px] text-[15px] text-ink-2">
          The team will never ask for a seed phrase, a private key or a payment to unlock access. Anyone who does is not {BRAND.name}. See
          also the <Link href="/faq" className="link">FAQ</Link>.
        </p>
      </Section>
    </>
  );
}
