// app/api/send-onboarding/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import OnboardingEmail from '@/app/(landing)/components-landing/onboarding/emailtemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    const data = await resend.emails.send({
      from: 'Kürşad from Mappie <hello@mappie.ai>', // Update this with your verified domain
      to: email,
      subject: 'Welcome to Mappie! 👋',
      react: OnboardingEmail({ username }) as React.ReactElement,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
}