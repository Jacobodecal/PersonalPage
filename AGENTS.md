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
- Blog posts are bundled at build time (`scripts/generate-posts.mjs`); Workers have no filesystem, so don't read `content/` at runtime.
- Blog pages must stay prerendered: `next-mdx-remote` compiles with `eval`, which Workers block at runtime.
