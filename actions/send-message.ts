'use server'

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendMessage(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    await resend.emails.send({
      from: 'Mappie Contact <onboarding@resend.dev>',
      to: ['hello@mappie.ai'],
      replyTo: email,
      subject: `Beta Contact Form: ${title}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Title:</strong> ${title}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      `
    });

    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    };
  }
}