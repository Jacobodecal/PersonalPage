import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs.map((slug) => ({
    slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const post = getPostBySlug(params.slug);

  return {
    title: `${post.title} | Jacobo De Cal`,
    description: post.excerpt,
  };
}

export default function BlogPost({ params }: PageProps) {
  let post;

  try {
    post = getPostBySlug(params.slug);
  } catch (error) {
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
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            ← Jacobo De Cal
          </Link>
        </div>
      </nav>

      {/* Blog post content */}
      <article className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
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

          {/* MDX content */}
          <div className="prose prose-lg max-w-none">
            <MDXRemote source={post.content} />
          </div>

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
