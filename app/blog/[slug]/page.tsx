import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import { formatLongDate, NEWSLETTER_TAGLINE } from '@/lib/site';
import SiteShell from '@/components/site/SiteShell';
import SubscribeForm from '@/components/site/SubscribeForm';

// Posts are read from D1 on each request, so publishing in /admin needs no deploy
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Shared by generateMetadata and the page so each request queries D1 once
const getPost = cache(getPostBySlug);

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Jacobo De Cal`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <SiteShell>
      <article className="pt-16 pb-14 sm:pt-20">
        <Link href="/writing" className="text-sm text-muted transition-colors hover:text-foreground">
          ← Writing
        </Link>

        <header className="mt-10 mb-10">
          <time className="font-mono text-[13px] text-muted">{formatLongDate(post.date)}</time>
          <h1 className="mt-3 text-[28px] leading-[1.2] font-semibold tracking-[-0.02em] text-strong sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-4 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
        </header>

        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }} />
      </article>

      <section className="border-t border-line py-10">
        <p className="mb-5 text-strong">Enjoyed this? Get the next one by email.</p>
        <SubscribeForm note={NEWSLETTER_TAGLINE} />
      </section>
    </SiteShell>
  );
}
