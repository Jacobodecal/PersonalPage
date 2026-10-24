// Bundles content/posts/*.mdx into lib/posts.generated.json at build time.
// Cloudflare Workers have no filesystem, so posts can't be read at runtime.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const outputFile = path.join(process.cwd(), 'lib/posts.generated.json');

const posts = fs
  .readdirSync(postsDirectory)
  .filter((fileName) => fileName.endsWith('.mdx'))
  .map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '');
    const fileContents = fs.readFileSync(path.join(postsDirectory, fileName), 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      content,
    };
  });

fs.writeFileSync(outputFile, JSON.stringify(posts, null, 2) + '\n');
console.log(`Generated ${posts.length} posts -> lib/posts.generated.json`);
