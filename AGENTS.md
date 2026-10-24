# personal-site

Jacob's personal landing page and blog. Next.js 15 (App Router), TypeScript, Tailwind v4, Supabase (newsletter), Resend (emails).

## Commands
- `npm install` then `npm run dev` (port 3000)
- `npm run lint` and `npm run build` before calling a change done

## Rules
- Secrets live in `.env` / `.env.local` (see `.env.example`). Never print or commit them.
- Never trigger a Resend send or write to the production Supabase project without Jacob's yes in the current message.
- Remote: `Jacobodecal/PersonalPage`. Never push or deploy without explicit confirmation.
