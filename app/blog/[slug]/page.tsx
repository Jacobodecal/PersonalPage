import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostBySlug, getAllPostSlugs, getAllPosts } from '@/lib/posts';
import BlogTerminal from '@/components/BlogTerminal';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
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
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return {
    title: `${post.title} | Jacobo De Cal`,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  let post;

  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  const date = new Date(post.date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const allPosts = getAllPosts();

  return (
    <BlogTerminal slug={slug} title={post.title} date={formattedDate} excerpt={post.excerpt} posts={allPosts}>
      <MDXRemote source={post.content} />
    </BlogTerminal>
  );
}
