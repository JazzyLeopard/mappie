import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
 
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }
 
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
 
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }
 
  const payload = await req.json()
  const body = JSON.stringify(payload);
 
  const wh = new Webhook(WEBHOOK_SECRET);
 
  try {
    const evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
 
    if (evt.type === 'user.created') {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: evt.data.email_addresses[0].email_address,
          username: evt.data.first_name || evt.data.username || 'there'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send onboarding email');
      }
    }
 
    return new Response('Webhook received', { status: 200 })
  } catch (error) {
    console.error('Error:', error);
    return new Response('Error occurred', { status: 400 })
  }
}