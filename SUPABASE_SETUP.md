# Supabase Setup Guide

This guide will help you set up Supabase for your newsletter subscription feature.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Project name**: Choose a name (e.g., "personal-landing")
   - **Database Password**: Create a strong password (save it somewhere safe)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for it to initialize (~2 minutes)

## Step 2: Create the Subscribers Table

1. In your Supabase project dashboard, click on the **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy and paste this SQL code:

```sql
-- Create subscribers table
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX idx_subscribers_email ON subscribers(email);

-- Enable Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts from anyone (for newsletter signup)
CREATE POLICY "Allow public inserts" ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow you to view all subscribers (when logged in to Supabase dashboard)
CREATE POLICY "Allow authenticated reads" ON subscribers
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see a success message

## Step 3: Get Your API Credentials

1. In your Supabase project dashboard, click on **Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **Project API keys** → **anon public**: Copy this key

## Step 4: Configure Your Local Environment

1. In your project root, create a `.env.local` file:

```bash
cp .env.example .env.local
```

2. Open `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with the ones you copied from Step 3.

## Step 5: Configure Railway Deployment

When deploying to Railway, you need to add these environment variables:

1. Go to your Railway project dashboard
2. Click on your service
3. Go to **Variables** tab
4. Add both variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 6: Test It Out

1. Start your development server:
```bash
npm run dev
```

2. Go to http://localhost:3000
3. Scroll to the newsletter section
4. Enter an email and click Subscribe
5. Check your Supabase dashboard:
   - Go to **Table Editor**
   - Click on **subscribers** table
   - You should see your test email!

## Managing Your Subscribers

### View All Subscribers

In the Supabase dashboard:
1. Go to **Table Editor**
2. Click on **subscribers**
3. You'll see all emails with their subscription dates

### Export Subscribers

1. In Table Editor, click on the **subscribers** table
2. Click the three dots menu (top right)
3. Select "Download as CSV"

### Delete a Subscriber

1. In Table Editor, find the subscriber
2. Click the three dots on their row
3. Select "Delete row"

## Security Notes

- The `anon` key is safe to use in your frontend code
- Row Level Security (RLS) ensures users can only insert emails, not read or modify existing ones
- Never share your `service_role` key publicly

## Optional: Email Notifications

To send confirmation emails when someone subscribes, you can integrate with:

- **Resend** - Modern email API, generous free tier
- **SendGrid** - Popular choice, free tier available
- **Mailchimp** - Full email marketing platform

Add email sending in `app/api/subscribe/route.ts` after the Supabase insert.

## Troubleshooting

### "Missing Supabase environment variables" Error

- Make sure you created `.env.local` and added both variables
- Restart your dev server after adding environment variables

### "Failed to subscribe" Error

- Check the browser console for detailed error messages
- Verify your Supabase credentials are correct
- Make sure the `subscribers` table was created successfully

### Need Help?

Check out the [Supabase Documentation](https://supabase.com/docs) or join their [Discord community](https://discord.supabase.com/).
