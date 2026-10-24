// Posts are bundled at build time by scripts/generate-posts.mjs
// (Cloudflare Workers have no filesystem to read content/posts from at runtime)
import generatedPosts from './posts.generated.json';

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

export interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

const posts: Post[] = generatedPosts;

// Get all posts metadata (for listing)
export function getAllPosts(): PostMetadata[] {
  const allPostsData = posts.map(({ slug, title, date, excerpt }) => ({
    slug,
    title,
    date,
    excerpt,
  }));

  // Sort posts by date (most recent first)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// Get a single post by slug (for individual post page)
export function getPostBySlug(slug: string): Post {
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    throw new Error(`Post not found: ${slug}`);
  }

  return post;
}

// Get all post slugs (for generating static paths)
export function getAllPostSlugs(): string[] {
  return posts.map((post) => post.slug);
}
