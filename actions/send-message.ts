'use server'

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  pool: true,
  maxConnections: 1,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 5
});

export async function sendMessage(formData: FormData) {
  try {
    // Test the connection first
    const verifyResult = await transporter.verify();
    console.log('SMTP connection verified:', verifyResult);

    const mailOptions = {
      from: {
        name: 'Mappie Contact Form',
        address: process.env.EMAIL_USER as string
      },
      to: process.env.EMAIL_USER,
      replyTo: formData.get('email') as string,
      subject: `Beta Contact Form: ${formData.get('title')}`,
      html: `
        <div style="font-family: sans-serif;">
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${formData.get('email')}</p>
          <p><strong>Title:</strong> ${formData.get('title')}</p>
          <p><strong>Message:</strong></p>
          <p>${formData.get('message')}</p>
        </div>
      `,
      dsn: {
        id: 'some-message-id',
        return: 'headers',
        notify: ['success', 'failure'],
        recipient: process.env.EMAIL_USER
      }
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent:', info.messageId);

    return { success: true, message: 'Message sent successfully!' };
  } catch (error) {
    console.error('Detailed error:', error);
    return { 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    };
  }
}