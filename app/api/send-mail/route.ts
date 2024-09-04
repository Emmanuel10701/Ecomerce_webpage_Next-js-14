import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use other services or custom SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { emails, subject, body }: { emails: string; subject: string; body: string } = req.body;

      // Validate inputs
      if (!emails || !subject || !body) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Send email to all subscribers
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: emails,
        subject: subject,
        text: body,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
