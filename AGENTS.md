# personal-site

Jacob's personal landing page and blog. Next.js 15 (App Router), TypeScript, Tailwind v4, Cloudflare Workers via OpenNext, D1 (newsletter subscribers), Resend (emails).

## Commands
- `npm install` then `npm run dev` (port 3000)
- `npm run lint` and `npm run build` before calling a change done
- `npm run preview` runs the real Worker locally (workerd + local D1); `npm run db:migrate:local` once first
- `npm run deploy` builds and deploys to Cloudflare (`jacobodecal.com` + `www` redirect). Pushing to GitHub does not deploy

## Rules
- Local secrets live in `.env.local`; production secrets are Worker secrets (`wrangler secret`). Never print or commit them.
- Never trigger a Resend send or write to the production D1 database (`--remote`) without Jacob's yes in the current message.
- Remote: `Jacobodecal/PersonalPage`. Never push or deploy without explicit confirmation.
- Posts live in D1 (`posts` table) and are written in `/admin` (ideas inbox, drafts with autosave, publish). Publishing needs no deploy.
- Edits to a published post are stored in `posts.pending_changes` (JSON) and only go live on "Update"; drafts are edited in place.
- Site copy and links (bio, newsletter tagline, social links) live in `lib/site.ts`. Design tokens are in `app/globals.css`.
- Post bodies are markdown rendered with `marked` (`lib/markdown.ts`). Never use MDX/`eval`-based renderers: Workers block `eval` at runtime.
- `/admin` and `/api/admin/*` are guarded by the signed `admin_session` cookie (`lib/adminSession.ts`).
- `content/posts/*.mdx` are the legacy source, kept only for `npm run posts:import:local` (and a one-off prod import).
