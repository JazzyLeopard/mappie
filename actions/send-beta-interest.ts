'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBetaInterest(formData: FormData) {
  try {
    const email = formData.get('email')?.toString()
    const name = formData.get('name')?.toString()
    const company = formData.get('company')?.toString()
    const useCase = formData.get('useCase')?.toString()
    
    if (!email || !name) {
      throw new Error('Email and name are required')
    }

    await resend.emails.send({
      from: 'Mappie <hello@mappie.ai>',
      to: 'hello@mappie.ai',
      subject: `New Beta Access Request from ${name}`,
      html: `
        <h2>New Beta Access Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Use Case:</strong></p>
        <p>${useCase || 'Not provided'}</p>
      `
    })

    return { success: true }
  } catch (error) {
    console.error('Failed to send beta interest:', error)
    throw error
  }
} 