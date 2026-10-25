// One-off: prints SQL that imports content/posts/*.mdx into the D1 `posts` table as published posts.
// Usage: node scripts/import-mdx-posts.mjs > posts.sql && wrangler d1 execute personal-site-db --local --file posts.sql
// Re-running is safe: existing slugs are left untouched.
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/posts');
const quote = (value) => `'${String(value ?? '').replace(/'/g, "''")}'`;

const statements = fs
  .readdirSync(postsDirectory)
  .filter((fileName) => fileName.endsWith('.mdx'))
  .map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, '');
    const { data, content } = matter(fs.readFileSync(path.join(postsDirectory, fileName), 'utf8'));

    return (
      'INSERT INTO posts (slug, title, excerpt, body_md, status, published_at) VALUES (' +
      [slug, data.title, data.excerpt, content.trim() + '\n', 'published', data.date].map(quote).join(', ') +
      ') ON CONFLICT(slug) DO NOTHING;'
    );
  });

console.log(statements.join('\n'));
