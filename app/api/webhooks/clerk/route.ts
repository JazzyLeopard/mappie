import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
    const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.mappie.ai'
    
    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
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
        const email = evt.data.email_addresses[0].email_address
        const name = evt.data.first_name || evt.data.username || 'there'

        const response = await fetch(`${APP_URL}/api/send-onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email, 
            username: name 
          }),
        })

        if (!response.ok) {
          const errorData = await response.text()
          console.error('Email API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          })
          throw new Error(`Email API responded with ${response.status}: ${errorData}`)
        }
      }

      return new Response('Webhook received', { status: 200 })
    } catch (err) {
      console.error('Failed to process webhook:', err)
      return NextResponse.json({ 
        error: 'Email sending failed',
        details: err instanceof Error ? err.message : 'Unknown error'
      }, { status: 500 })
    }
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Error occurred', { status: 400 })
  }
}