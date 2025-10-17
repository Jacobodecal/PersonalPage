# How to Add New Blog Posts

Your blog is now set up with MDX (Markdown + React). Adding new posts is super simple!

## Adding a New Post

1. **Create a new file** in the `content/posts` directory
2. **Name it** with a URL-friendly slug (e.g., `my-new-post.mdx`)
3. **Write your post** using Markdown

### Template

Here's a template for a new post:

```markdown
---
title: "Your Post Title"
date: "2025-01-20"
excerpt: "A brief summary of what this post is about. This appears on the homepage."
---

# Your Post Title

Your content goes here! You can use all standard Markdown features:

## Headings

Use ## for main sections and ### for subsections.

## Lists

- Bullet points work
- Just like this
- Easy!

Numbered lists too:

1. First item
2. Second item
3. Third item

## Emphasis

You can make text **bold** or *italic*.

## Links

[Link text](https://example.com)

## Code

Inline code: `const x = 42`

Code blocks:
```javascript
function hello() {
  console.log("Hello world!");
}
```

## Quotes

> This is a quote

That's it!

---

*Published on January 20, 2025*
```

## Important Notes

### Frontmatter (the part between ---)

Always include these three fields at the top:
- **title**: The post title (shows up as the page title)
- **date**: Format as `YYYY-MM-DD` (e.g., "2025-01-20")
- **excerpt**: A short summary (1-2 sentences)

### File Naming

The filename becomes the URL:
- `theres-no-ai-without-iot.mdx` → `jacobodecal.com/blog/theres-no-ai-without-iot`
- Use lowercase letters and hyphens (no spaces)
- Keep it short and descriptive

### Publishing

Once you've created your `.mdx` file:

1. Commit and push to GitHub:
```bash
git add content/posts/your-new-post.mdx
git commit -m "Add new blog post: Your Title"
git push
```

2. Railway will automatically rebuild and deploy
3. Your post will appear on the homepage and be accessible at `/blog/your-slug`

## Examples

Check out the existing posts in `content/posts/`:
- `beyond-the-hype-exploring-blockchains-lesser-known-benefits.mdx`
- `theres-no-ai-without-iot.mdx`
- `why-good-technologies-die.mdx`

You can copy any of these as a starting point for your own posts!

## Tips

1. **Write in any text editor**: VSCode, Notion, or even a simple text editor works
2. **Preview locally**: Run `npm run dev` to see your post before publishing
3. **Keep it simple**: Markdown is designed to be easy - don't overthink it
4. **Use headings**: They help readers scan your content
5. **Break up text**: Short paragraphs are easier to read

## Need Help?

If something doesn't work, check:
1. Did you include all three frontmatter fields?
2. Is the date in the correct format (YYYY-MM-DD)?
3. Did you close the frontmatter section with `---`?
4. Is the file extension `.mdx`?

That's it! You're ready to start writing. 🎉
