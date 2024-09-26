import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Email sending function
export async function POST(request: Request) {
  try {
    // Parse the request body
    const { subject, message, recipients } = await request.json();

    // Validate input
    if (!subject || !message || !recipients || !Array.isArray(recipients)) {
      return NextResponse.json({ error: 'Subject, message, and recipients are required.' }, { status: 400 });
    }

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Replace with your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password
      },
    });

    // Iterate over the recipients and send an email to each
    for (const recipient of recipients) {
      const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: recipient.email, // Receiver address from recipients array
        subject: subject, // Subject from request body
        html: `
          <div style="font-family: 'Arial', sans-serif; background-color: #f9f9f9; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
              <div style="background-color: #4caf50; padding: 20px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 24px;">${subject}</h1>
              </div>
              <div style="padding: 20px; line-height: 1.6;">
                <p style="font-size: 16px; color: #333;">${message}</p>
                <p style="margin-top: 20px; font-size: 14px; color: #555;">Thank you for being part of our community!</p>
              </div>
              <div style="background-color: #f1f1f1; padding: 15px; text-align: center;">
                <p style="font-size: 12px; color: #777;">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</p>
                <a href="#" style="color: #4caf50; text-decoration: none; font-weight: bold;">Unsubscribe</a>
              </div>
            </div>
          </div>
        `,
      };

      // Send email to each recipient
      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({ message: 'Emails sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ error: 'Error sending emails.' }, { status: 500 });
  }
}
