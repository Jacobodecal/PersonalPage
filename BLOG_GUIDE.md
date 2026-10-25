# Blog Guide

Posts are written in the admin at `/admin` and stored in D1. Publishing goes live immediately, no git or deploy needed.

## Writing a post

1. Go to `jacobodecal.com/admin` and log in.
2. **Ideas**: jot anything in the ideas box (⌘↵ saves). When one is ready, click **Turn into draft**: the first line becomes the title, the rest the body.
3. **New draft** starts an empty post.
4. In the editor:
   - **Title**: the slug (`/blog/your-slug`) follows the title until you edit it by hand or publish.
   - **Excerpt**: one or two sentences; shown in the essays list and link previews.
   - **Body**: markdown, with a live preview (side by side on desktop, **Write / Preview** tabs on mobile).
   - Everything autosaves (or ⌘S). The top bar shows *Saved / Saving… / Not saved*.
5. **Publish** puts it on the homepage and at `/blog/your-slug`. The publish date is set the first time you publish.
6. **Unpublish** takes it off the site (it goes back to Drafts, keeping its original date).
7. **Delete** (drafts only) removes a draft for good. Unpublish a post first to delete it.

Editing a published post doesn't touch the live page: your edits autosave as *Unpublished changes*. **Update** makes them live; **Discard changes** throws them away.

## Markdown cheatsheet

```markdown
## Section heading
### Subsection

**bold**, *italic*, `inline code`, [a link](https://example.com)

- bullet
1. numbered

> a quote

---
```

Raw HTML is shown as text, not rendered.

## Sending it to subscribers

On a published post, **Email subscribers** sends the title, excerpt and a link to every subscriber. See [ADMIN_GUIDE.md](./ADMIN_GUIDE.md).
