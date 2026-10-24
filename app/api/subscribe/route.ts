import { NextRequest, NextResponse } from 'next/server';
import { getDb, type D1Result } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Add new subscriber; the UNIQUE constraint on email makes this a no-op for duplicates
    const db = await getDb();
    let result: D1Result;
    try {
      result = await db
        .prepare('INSERT INTO subscribers (email, subscribed_at) VALUES (?, ?) ON CONFLICT(email) DO NOTHING')
        .bind(normalizedEmail, new Date().toISOString())
        .run();
    } catch (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to subscribe' },
        { status: 500 }
      );
    }

    if (result.meta.changes === 0) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 400 }
      );
    }

    // TODO: Integrate with email service provider (Resend, SendGrid, Mailchimp, etc.)
    // to send confirmation email and manage email campaigns

    return NextResponse.json(
      { message: 'Successfully subscribed!' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
