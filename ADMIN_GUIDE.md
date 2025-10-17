# Admin Dashboard Guide

A simple, secure admin panel to send email notifications to your subscribers.

## Quick Start

### 1. Set Your Admin Password

Add this to your `.env.local` file:

```env
ADMIN_PASSWORD=your-secure-password-here
```

Choose a strong password that you'll remember!

### 2. Access the Dashboard

Go to: `http://localhost:3000/admin` (or `https://yourdomain.com/admin` in production)

### 3. Login

Enter your admin password and click "Login"

### 4. Send Notifications

- You'll see a list of all your blog posts
- Click "Send Email" next to any post
- Confirm the action
- All subscribers will receive an email notification!

## Features

### What You Can Do

- **View all posts**: See all your published essays
- **One-click sending**: Send email notifications with a single click
- **Real-time feedback**: See success/error messages immediately
- **Subscriber count**: Know how many people received the email

### What Gets Sent

When you click "Send Email", all subscribers receive:
- Post title
- Post excerpt/summary
- A button to read the full essay
- Unsubscribe link

### Success Message

After sending, you'll see:
```
Successfully sent to X subscriber(s)!
```

## Security

### Password Protection

- The dashboard requires a password to access
- Password is stored securely in environment variables
- Never commit your `.env.local` file to git

### Session Management

- Login state is saved in your browser
- Click "Logout" to end your session
- Sessions persist until you logout or clear browser data

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
- Check that you have subscribers in Supabase
- Review the Resend dashboard for error logs

### "No subscribers to notify"
- Add test subscribers to your Supabase database
- Verify the `subscribers` table exists and has email addresses

### Can't access /admin
- Make sure your dev server is running
- Check that the page was created correctly
- Try clearing your browser cache

## Production Deployment

### Environment Variables

When deploying to production (Railway, Vercel, etc.), add:

```
ADMIN_PASSWORD=your-production-password
```

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
