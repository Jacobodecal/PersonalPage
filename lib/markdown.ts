// Markdown -> HTML for posts, shared by the public blog and the /admin preview.
// Uses `marked` (no eval, so it runs on Workers). Raw HTML in posts is escaped, not rendered.
import { Marked } from 'marked';

const escapeHtml = (html: string) =>
  html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const marked = new Marked({
  gfm: true,
  async: false,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

export function renderMarkdown(markdown: string): string {
  return marked.parse(markdown) as string;
}
