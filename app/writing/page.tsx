import SiteShell from "@/components/site/SiteShell";
import SubscribeForm from "@/components/site/SubscribeForm";
import PostList from "@/components/site/PostList";
import SectionLabel from "@/components/site/SectionLabel";
import { getAllPosts } from "@/lib/posts";
import { NEWSLETTER_TAGLINE } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Writing | Jacobo De Cal",
  description: NEWSLETTER_TAGLINE,
};

export default async function WritingPage() {
  const posts = await getAllPosts();

  return (
    <SiteShell>
      <section className="pt-20 pb-10 sm:pt-24">
        <SectionLabel>Writing</SectionLabel>
        <PostList posts={posts} />
      </section>

      <section className="border-t border-line py-10">
        <SectionLabel>Newsletter</SectionLabel>
        <SubscribeForm note={NEWSLETTER_TAGLINE} />
      </section>
    </SiteShell>
  );
}
