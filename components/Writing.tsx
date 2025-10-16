import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function Writing() {
  const posts = getAllPosts();

  // Format date helper
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  return (
    <section id="writing" className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-bold text-foreground mb-12">
          Writing
        </h2>
        <div className="space-y-12">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-b border-border pb-10 last:border-0"
            >
              <div className="text-sm text-text-light mb-2">
                {formatDate(post.date)}
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-3 leading-tight">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
