import Link from 'next/link';
import type { PostMetadata } from '@/lib/posts';
import { formatMonthYear } from '@/lib/site';

export default function PostList({ posts }: { posts: PostMetadata[] }) {
  if (posts.length === 0) {
    return <p className="text-muted">Nothing here yet.</p>;
  }

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group flex items-baseline justify-between gap-6 py-2.5"
          >
            <span className="min-w-0 text-foreground transition-colors group-hover:text-accent">
              {post.title}
            </span>
            <span className="shrink-0 font-mono text-[13px] text-muted">
              {formatMonthYear(post.date)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
