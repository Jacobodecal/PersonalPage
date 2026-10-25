import SiteShell from "@/components/site/SiteShell";
import SubscribeForm from "@/components/site/SubscribeForm";
import SectionLabel from "@/components/site/SectionLabel";
import { BIO, NEWSLETTER_TAGLINE } from "@/lib/site";

export const metadata = {
  title: "About | Jacobo De Cal",
  description: BIO,
};

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="pt-20 pb-14 sm:pt-24">
        <SectionLabel>About</SectionLabel>
        <div className="space-y-5 text-[17px] leading-[1.75] text-[#d4d4d4]">
          <p>Born in Spain, raised in Brazil. Computer Engineering at POLI-USP.</p>
          <p>
            At 20 I joined BTG Pactual as an intern on a brand-new project: building a digital bank for
            Brazilian businesses. Three months later I was a software engineer.
          </p>
          <p>Then venture capital at Indicator, a VC based in the Bay Area and São Paulo.</p>
          <p>
            I co-led Lumx&apos;s seed round and sat on its board in the early days, then joined full time,
            first as CRO and now as COO.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-10">
        <SectionLabel>Newsletter</SectionLabel>
        <SubscribeForm note={NEWSLETTER_TAGLINE} />
      </section>
    </SiteShell>
  );
}
