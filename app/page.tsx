import SiteShell from "@/components/site/SiteShell";
import SubscribeForm from "@/components/site/SubscribeForm";
import PostList from "@/components/site/PostList";
import SectionLabel from "@/components/site/SectionLabel";
import { getAllPosts } from "@/lib/posts";
import { BIO_INTRO, BIO_NOW, NEWSLETTER_TAGLINE } from "@/lib/site";

// The writing list is read from D1 on each request
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <SiteShell>
      <section className="pt-20 pb-14 sm:pt-24">
        <p className="mb-8 text-xl leading-[1.5] tracking-[-0.01em] text-strong sm:text-[22px]">
          {BIO_INTRO} <span className="text-muted">{BIO_NOW}</span>
        </p>
        <SubscribeForm note={NEWSLETTER_TAGLINE} />
      </section>

      <section className="border-t border-line py-10">
        <SectionLabel>Writing</SectionLabel>
        <PostList posts={posts} />
      </section>
    </SiteShell>
  );
}
