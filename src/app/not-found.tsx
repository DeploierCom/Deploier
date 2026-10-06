import { Btn, Hero } from "@/components/kit";

export default function NotFound() {
  return (
    <Hero mesh title="This page was never settled" sub="The address you followed does not match any page on this site.">
      <Btn href="/" small>
        Back to the home page
      </Btn>
      <Btn href="/faq" tone="ghost" small>
        Read the FAQ
      </Btn>
    </Hero>
  );
}
