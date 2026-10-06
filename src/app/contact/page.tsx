import Link from "next/link";
import { BRAND } from "@/config/brand";
import { JsonLd } from "@/components/JsonLd";
import { FormSection, Hero } from "@/components/kit";
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
      <Hero
        art={{ src: "/art/planes-wide.svg", className: "top-[30px] right-[-80px] w-[900px] max-[1199.98px]:w-[620px]" }}
        title="Talk to the people building private settlement"
        sub={`The fastest way to reach the ${BRAND.name} team is a direct message on X at ${BRAND.xHandle}.`}
      />
      <FormSection title="Get in touch" topic="contact" id="contact-form">
        <ul className="space-y-4">
          <li>
            Building on the layer? Say what you are building, which assets it settles and what the contract interface must support. The{" "}
            <Link href="/developers" className="text-stamp hover:underline">
              developer reference
            </Link>{" "}
            is a good first read.
          </li>
          <li>Running a desk? Describe the infrastructure you operate today and where it is hosted. The operator programme is in design and early input shapes it.</li>
          <li>Institution or press? Name your organisation and the question. We answer honestly about what is and is not live.</li>
        </ul>
        <p className="mt-6">
          The form on this page prepares your message and opens X. The team will never ask for a seed phrase, a private key or a payment to
          unlock access; anyone who does is not {BRAND.name}. Quick answers live in the{" "}
          <Link href="/faq" className="text-stamp hover:underline">
            FAQ
          </Link>
          .
        </p>
      </FormSection>
    </>
  );
}
