# Email Notifications Setup with Resend

This guide will help you set up email notifications for your blog subscribers using Resend.

## Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address
3. You'll get **3,000 free emails per month** on the free tier

## Step 2: Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Personal Landing Page")
4. Copy the API key (you'll only see this once!)

## Step 3: Add Domain (Optional but Recommended)

**For testing**, you can use `onboarding@resend.dev` as the sender.

**For production**, you should add your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `jacobodecal.com`)
4. Add the DNS records shown to your domain provider
5. Wait for verification (usually takes a few minutes)
6. Once verified, you can send from `hello@jacobodecal.com` or any address at your domain

## Step 4: Configure Environment Variables

Add these to your `.env.local` file:

```env
# Resend API Key from Step 2
RESEND_API_KEY=re_your_api_key_here

# Your verified sender email
# For testing: onboarding@resend.dev
# For production: hello@jacobodecal.com
RESEND_FROM_EMAIL=onboarding@resend.dev

# Your site URL (for email links)
NEXT_PUBLIC_SITE_URL=https://jacobodecal.com

# Admin dashboard password
ADMIN_PASSWORD=choose-a-secure-password
```

## Step 5: How to Send Notifications

You have two options to send email notifications:

### Option 1: Admin Dashboard (Recommended - Easy!)

1. Go to `/admin` on your site (e.g., `http://localhost:3000/admin`)
2. Login with your admin password (set in `.env.local` as `ADMIN_PASSWORD`)
3. Click "Send Email" next to any post
4. Confirm and done!

### Option 2: Using curl (Terminal):

```bash
curl -X POST http://localhost:3000/api/notify-subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "postTitle": "Your Post Title",
    "postExcerpt": "A brief summary of your post",
    "postSlug": "your-post-slug"
  }'
```

### Example curl command:

```bash
# For "There's no AI without IoT"
curl -X POST http://localhost:3000/api/notify-subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "postTitle": "There'\''s no AI without IoT",
    "postExcerpt": "AIoT startups will reshape our economy enabling AI with IoT data capture",
    "postSlug": "theres-no-ai-without-iot"
  }'
```

## Step 6: Testing

1. Subscribe to your own newsletter with a test email
2. Publish a test post
3. Go to `/admin` and send the email notification
4. Check your email!

**Alternative**: Use the curl command if you prefer terminal-based workflow.

## Important Notes

- **Free Tier Limit**: 3,000 emails/month, 100 emails/day
- **Rate Limiting**: Don't send too many emails at once
- The API will send to ALL subscribers, so be careful when testing
- Emails include an unsubscribe link (you'll need to implement that endpoint separately)

## Troubleshooting

### Error: "Missing API key"
- Make sure `RESEND_API_KEY` is set in `.env.local`
- Restart your dev server after adding the variable

### Error: "From email not verified"
- Use `onboarding@resend.dev` for testing
- Or verify your custom domain in Resend first

### Emails not arriving
- Check spam folder
- Verify the email address is in your Supabase subscribers table
- Check Resend dashboard logs for delivery status

## Admin Dashboard Features

Your admin dashboard at `/admin` includes:
- ✅ Password protected access
- ✅ List of all your blog posts
- ✅ One-click email sending
- ✅ Success/error notifications
- ✅ Clean, simple interface

## Security Notes

- The admin dashboard is password-protected
- Password is stored in environment variables (never commit to git)
- Authentication state is stored in browser localStorage
- For production, consider implementing more robust authentication (e.g., NextAuth)
