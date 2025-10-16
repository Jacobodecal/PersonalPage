# Personal Landing Page

A modern, responsive personal landing page built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- Minimal, content-focused design
- Fully responsive (mobile, tablet, desktop)
- Hero section with bio
- Blog posts showcase
- Newsletter subscription with Supabase
- Contact section with social links
- Optimized for performance and SEO

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **Supabase** - Database for newsletter subscribers
- **Google Fonts** - Inter & Playfair Display

## Getting Started

### Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher

### Setup

1. Install dependencies:
```bash
npm install
```

2. **Set up Supabase** (required for newsletter):
   - Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create a Supabase project and subscribers table
   - Get your API credentials

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Then add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

## Deployment on Railway

1. Push your code to a Git repository (GitHub, GitLab, etc.)

2. Go to [Railway](https://railway.app) and create a new project

3. Connect your repository

4. Add environment variables in Railway:
   - Go to your service's **Variables** tab
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Railway will automatically detect Next.js and deploy it

6. Your site will be live at the Railway-provided URL

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
│   │   └── subscribe/
│   │       └── route.ts       # Newsletter subscription API
│   ├── layout.tsx             # Root layout with fonts and metadata
│   ├── page.tsx               # Main page
│   └── globals.css            # Global styles
├── components/
│   ├── Navigation.tsx         # Navigation bar
│   ├── Hero.tsx               # Hero section with bio
│   ├── Writing.tsx            # Blog posts listing
│   ├── Newsletter.tsx         # Newsletter subscription form
│   └── Contact.tsx            # Contact section
├── lib/
│   └── supabase.ts            # Supabase client configuration
└── public/                    # Static assets
```

## License

MIT
