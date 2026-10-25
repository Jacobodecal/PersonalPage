import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="pt-24 pb-20">
        <p className="font-mono text-[13px] text-muted">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-strong">This page doesn&apos;t exist.</h1>
        <Link href="/" className="mt-6 inline-block text-accent hover:underline">
          ← Back home
        </Link>
      </section>
    </SiteShell>
  );
}
