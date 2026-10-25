# Personal Landing Page

A modern, responsive personal landing page built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- Minimal, content-focused design
- Fully responsive (mobile, tablet, desktop)
- Hero section with bio
- Blog posts showcase
- Newsletter subscription stored in Cloudflare D1
- Email notifications to subscribers (via Resend)
- Contact section with social links
- Optimized for performance and SEO

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **Cloudflare Workers** (via OpenNext) - Hosting
- **Cloudflare D1** - Database for newsletter subscribers
- **Resend** - Email notifications for new posts
- **Google Fonts** - Inter & Playfair Display

## Getting Started

### Prerequisites

1. **Node.js** 18 or higher
2. **Cloudflare account** with `jacobodecal.com` (run `npx wrangler login`)
3. **Resend account** (optional, for email notifications): see [RESEND_SETUP.md](./RESEND_SETUP.md)

### Setup

1. Install dependencies and create the local D1 database:
```bash
npm install
npm run db:migrate:local
npm run posts:import:local   # optional: load the legacy posts
```

2. Add local secrets to `.env.local`:
```env
ADMIN_PASSWORD=local-password
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=hello@yourdomain.com
```

3. Run the development server and open [http://localhost:3000](http://localhost:3000):
```bash
npm run dev
```

To run the real Worker runtime locally (closer to production), use `npm run preview` (port 8787).

## Deployment (Cloudflare Workers)

```bash
npm run deploy
```

Builds with OpenNext and deploys the `personal-site` Worker. `wrangler.jsonc` routes `jacobodecal.com/*` and `www.jacobodecal.com/*` (www redirects to the apex). Pushing to GitHub does **not** deploy.

- **Secrets**: `npx wrangler secret put RESEND_API_KEY` (also `RESEND_FROM_EMAIL`, `ADMIN_PASSWORD`)
- **Database migrations**: add a file to `migrations/`, then `npm run db:migrate:remote`
- **Test URL**: https://personal-site.jacobodecal.workers.dev

Blog posts live in D1 and are written in `/admin` (see [BLOG_GUIDE.md](./BLOG_GUIDE.md)); publishing needs no deploy.

## Customization

### Update Personal Information

Edit the following files to customize with your information:

- `app/layout.tsx` - Update metadata (title, description)
- `components/Hero.tsx` - Your name and bio
- `components/Writing.tsx` - Your blog posts
- `components/Contact.tsx` - Your email and social links
- `components/Navigation.tsx` - Your name in the header

### Styling

The color scheme and fonts can be customized in:
- `app/globals.css` - CSS variables and theme colors

## Project Structure

```
personal-landing/
├── app/
│   ├── api/
│   │   ├── subscribe/
│   │   │   └── route.ts         # Newsletter subscription API
│   │   └── notify-subscribers/
│   │       └── route.ts         # Email notification API
│   ├── layout.tsx               # Root layout with fonts and metadata
│   ├── page.tsx                 # Main page
│   └── globals.css              # Global styles
├── components/
│   ├── Navigation.tsx           # Navigation bar
│   ├── Hero.tsx                 # Hero section with bio and newsletter
│   ├── Writing.tsx              # Blog posts listing
│   ├── Contact.tsx              # Contact section
│   └── EmailTemplate.tsx        # Email notification template
├── lib/
│   ├── db.ts                    # D1 database access
│   ├── adminSession.ts          # Signed admin session cookie
│   ├── markdown.ts              # Markdown rendering (marked, no eval)
│   └── posts.ts                 # Posts and ideas (D1)
├── migrations/                  # D1 schema migrations
├── scripts/
│   └── import-mdx-posts.mjs     # One-off import of legacy content/posts into D1
├── content/
│   └── posts/                   # Blog posts in MDX format
└── public/                      # Static assets
```

## License

MIT
