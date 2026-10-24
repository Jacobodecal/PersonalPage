import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getDb } from '@/lib/db';
import { isAdminRequest } from '@/lib/adminSession';
import { EmailTemplate } from '@/components/EmailTemplate';

export async function POST(request: NextRequest) {
  // Only a logged-in admin may email every subscriber
  if (!(await isAdminRequest(request))) {
    return NextResponse.json(
      { error: 'Unauthorized: log out and log in again' },
      { status: 401 }
    );
  }

  try {
    // Created per request: Worker secrets are only available at request time
    const resend = new Resend(process.env.RESEND_API_KEY);

    // Get post details from request body
    const { postTitle, postExcerpt, postSlug } = await request.json();

    if (!postTitle || !postExcerpt || !postSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: postTitle, postExcerpt, postSlug' },
        { status: 400 }
      );
    }

    // Fetch all subscribers from D1
    let subscribers: { email: string }[];
    try {
      const db = await getDb();
      const { results } = await db
        .prepare('SELECT email FROM subscribers')
        .all<{ email: string }>();
      subscribers = results;
    } catch (fetchError) {
      console.error('Error fetching subscribers:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch subscribers: ${fetchError instanceof Error ? fetchError.message : 'unknown error'}` },
        { status: 500 }
      );
    }

    console.log('Subscribers query result:', { count: subscribers.length });

    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found in database');
      return NextResponse.json(
        {
          message: 'No subscribers to notify',
          totalSubscribers: 0,
          successful: 0,
          failed: 0
        },
        { status: 200 }
      );
    }

    const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jacobodecal.com'}/blog/${postSlug}`;

    // Send email to all subscribers
    const emailPromises = subscribers.map((subscriber) =>
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: subscriber.email,
        subject: `New post: ${postTitle}`,
        react: EmailTemplate({
          postTitle,
          postExcerpt,
          postUrl,
          subscriberEmail: subscriber.email,
        }) as React.ReactElement,
      })
    );

    const results = await Promise.allSettled(emailPromises);

    // Log failures for debugging
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email to ${subscribers[index].email}:`, result.reason);
      } else {
        console.log(`Successfully sent email to ${subscribers[index].email}`);
      }
    });

    // Count successes and failures
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    return NextResponse.json({
      message: 'Notification process completed',
      totalSubscribers: subscribers.length,
      successful,
      failed,
    });
  } catch (error) {
    console.error('Error in notify-subscribers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
