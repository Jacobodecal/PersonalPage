# Admin Dashboard Guide

The admin at `/admin` is where you write (ideas, drafts, publishing) and email subscribers. Writing is covered in [BLOG_GUIDE.md](./BLOG_GUIDE.md).

## Quick Start

### 1. Set Your Admin Password

Add this to your `.env.local` file:

```env
ADMIN_PASSWORD=your-secure-password-here
```

Choose a strong password that you'll remember!

### 2. Log in

Go to `http://localhost:3000/admin` (or `https://jacobodecal.com/admin`). Without a session you are sent to `/admin/login`.

### 3. Send Notifications

- Open a published post in the editor
- Click **Email subscribers** and confirm
- Every subscriber gets an email with the post title, excerpt and a link

## Security

### Password Protection

- The dashboard requires a password to access
- Password is stored securely in environment variables
- Never commit your `.env.local` file to git

### Session Management

- Logging in sets a signed, HttpOnly `admin_session` cookie (7 days)
- `/admin` pages and every `/api/admin/*` route check it on the server
- Click "Logout" to end your session; changing `ADMIN_PASSWORD` ends all sessions

## Tips

### Best Practices

1. **Test first**: Subscribe with your own email before sending to all subscribers
2. **Double-check**: Review post title and excerpt before sending
3. **Timing**: Send emails when your audience is most active
4. **Don't spam**: Only send notifications for new, valuable content

### Common Workflow

1. Write and publish a new blog post
2. Deploy your site (or verify locally)
3. Go to `/admin`
4. Find your new post
5. Click "Send Email"
6. Confirm
7. Done!

## Troubleshooting

### "Invalid password"
- Check that `ADMIN_PASSWORD` is set in `.env.local`
- Make sure you're typing the correct password
- Restart your dev server after adding the variable

### "Failed to send emails"
- Verify your Resend API key is correct
- Check that you have subscribers in D1 (see README)
- Review the Resend dashboard for error logs

### "No subscribers to notify"
- Add test subscribers to your local D1 database (`npm run db:migrate:local` creates the table)
- Verify the `subscribers` table exists and has email addresses

### Can't access /admin
- Make sure your dev server is running
- Check that the page was created correctly
- Try clearing your browser cache

## Production Deployment

### Environment Variables

Production runs on Cloudflare Workers. Set the password as a Worker secret:

```bash
npx wrangler secret put ADMIN_PASSWORD
```

Logging in sets an HttpOnly session cookie (7 days); `/api/notify-subscribers` rejects requests without it. Changing the password invalidates all sessions.

Make sure to use a DIFFERENT password than your development password!

### URL

Access your admin panel at:
```
https://jacobodecal.com/admin
```

## Future Improvements

Want to enhance the admin dashboard? Consider:

- Email preview before sending
- Schedule emails for later
- View subscriber list
- Email analytics (open rates, clicks)
- Batch operations
- More robust authentication (NextAuth, Clerk, etc.)

Let me know if you'd like any of these features added!
