import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';


// Define the interface for the request data
interface ContactData {
  name: string;
  email: string;
  message: string;
}

export async function POST(req: Request) {
  try {
    // Parse the incoming request body
    const data: ContactData = await req.json();

    // Validate input data
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // Configure the transporter for Nodemailer
    const transporter = nodemailer.createTransport({
      port: 587, // Use 587 for TLS
      host: 'smtp.gmail.com',
      secure: false, // Set to true if using port 465 with SSL
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Construct the email body
    const body = `
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Message:</strong><br />${data.message}</p>
    `;

    // Send the email
    await transporter.sendMail({
      from: `Website Contact Form <${process.env.EMAIL_USER}>`,
      replyTo: data.email,
      to: process.env.EMAIL_USER,
      subject: `Contact form submission from ${data.name}`,
      html: body,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Error sending email.', details: error.message }, { status: 500 });
  }
}
