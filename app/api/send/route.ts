// app/api/send/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { v4 as uuidv4 } from 'uuid'

const resend = new Resend(process.env.RESEND_API_KEY)

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
const MAX_TOTAL_SIZE = 40 * 1024 * 1024; // 40MB in bytes

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const title = formData.get('title') as string
    const message = formData.get('message') as string
    const email = formData.get('email') as string
    const images = formData.getAll('images') as File[]
    const attachments = formData.getAll('attachments') as File[]

    const emailId = uuidv4()

    // Validate file sizes
    let totalSize = 0;
    for (const file of [...images, ...attachments]) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, message: `File ${file.name} exceeds maximum size of 15MB` },
          { status: 400 }
        )
      }
      totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      return NextResponse.json(
        { success: false, message: 'Total attachments size exceeds 40MB limit' },
        { status: 400 }
      )
    }

    const attachmentsData = await Promise.all([...images, ...attachments].map(async (file) => ({
      filename: file.name,
      content: Buffer.from(await file.arrayBuffer()).toString('base64')
    })))

    const data = await resend.emails.send({
      from: 'Mappie Contact <onboarding@resend.dev>',
      to: ['kursad@hey.com'],
      replyTo: email,
      subject: `New Contact Form Submission: ${title}`,
      html: `
        <h2>New message from ${email}</h2>
        <h3>Title: ${title}</h3>
        <p>${message}</p>
        ${attachmentsData.length ? '<p>Attachments included</p>' : ''}
      `,
      attachments: attachmentsData,
      tags: [
        {
          name: 'email_id',
          value: emailId
        },
        {
          name: 'type',
          value: 'contact_form'
        }
      ]
    })

    return NextResponse.json({ success: true, message: 'Email sent successfully', emailId })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to send email' },
      { status: 500 }
    )
  }
}