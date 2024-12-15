// app/api/send-onboarding/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OnboardingEmail from '@/app/(landing)/components-landing/onboarding/emailtemplate';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    if (!email || !username) {
      return NextResponse.json(
        { success: false, error: 'Email and username are required' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'Kürşad from Mappie <hello@mappie.ai>',
      to: email,
      subject: 'Welcome to Mappie! 👋',
      react: OnboardingEmail({ username }) as React.ReactElement,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}