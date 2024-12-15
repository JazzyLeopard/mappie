// actions/send-onboarding.ts
'use server'

export async function sendOnboardingEmail(email: string, username: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-onboarding`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        username,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send onboarding email:', error);
    return { success: false };
  }
}