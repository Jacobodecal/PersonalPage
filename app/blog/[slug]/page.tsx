import { cache } from 'react';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/lib/posts';
import { renderMarkdown } from '@/lib/markdown';
import Link from 'next/link';

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

  // Format date
  const date = new Date(post.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation back home */}
      <nav className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link
            href="/"
            className="text-2xl font-bold text-foreground hover:text-primary transition-colors"
          >
            ← Jacobo De Cal
          </Link>
        </div>
      </nav>

      {/* Blog post content */}
      <article className="pt-16 pb-20">
        <div className="max-w-5xl mx-auto px-6">
          {/* Post header */}
          <header className="mb-12">
            <time className="text-sm text-text-light mb-4 block">
              {formattedDate}
            </time>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Post content (markdown) */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
          />

          {/* Back to home link */}
          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/#writing"
              className="text-primary hover:text-primary-dark font-medium transition-colors"
            >
              ← Back to all posts
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
