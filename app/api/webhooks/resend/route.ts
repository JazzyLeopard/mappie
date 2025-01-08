import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Define webhook event types
interface ResendWebhookPayload {
  type: 'email.sent' | 'email.delivered' | 'email.opened'
  data: {
    tags?: Array<{ name: string; value: string }>
    to: string[]
    subject: string
    created_at: string
  }
}

const WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

export async function POST(request: Request) {
  const payload: ResendWebhookPayload = await request.json()
  const headersList = await headers()
  const webhookSignature = headersList.get('resend-signature')

  if (!webhookSignature || !verifyWebhookSignature(webhookSignature, WEBHOOK_SECRET)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    switch (payload.type) {
      case 'email.sent':
        await handleEmailSent({
          emailId: payload.data.tags?.find(tag => tag.name === 'email_id')?.value,
          to: payload.data.to[0],
          subject: payload.data.subject,
          timestamp: new Date(payload.data.created_at)
        })
        break

      case 'email.delivered':
        await handleEmailDelivered({
          emailId: payload.data.tags?.find(tag => tag.name === 'email_id')?.value,
          timestamp: new Date(payload.data.created_at)
        })
        break

      case 'email.opened':
        await handleEmailOpened({
          emailId: payload.data.tags?.find(tag => tag.name === 'email_id')?.value,
          timestamp: new Date(payload.data.created_at)
        })
        break
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

interface EmailEventData {
  emailId?: string
  to?: string
  subject?: string
  timestamp: Date
}

async function handleEmailSent(data: EmailEventData) {
  console.log('Email sent:', data)
  // Implement your database logic here
}

async function handleEmailDelivered(data: EmailEventData) {
  console.log('Email delivered:', data)
  // Implement your database logic here
}

async function handleEmailOpened(data: EmailEventData) {
  console.log('Email opened:', data)
  // Implement your database logic here
}

function verifyWebhookSignature(signature: string, secret: string | undefined): boolean {
  if (!secret) return false
  // Implement signature verification logic
  return true
}