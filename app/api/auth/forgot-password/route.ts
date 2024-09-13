// File: /pages/api/auth/forgot-password.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // For secure token generation

interface ForgotPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequestBody = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // To prevent email enumeration, respond with a success message
      return NextResponse.json(
        { message: 'Password reset email sent' },
        { status: 200 }
      );
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // Token valid for 1 hour

    // Store the token in the database
    await prisma.passwordReset.create({
      data: {
        token,
        expiry,
        userId: user.id,
      },
    });

    // Create the reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use your email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Your email address
      to: email, // Recipient's email address
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555;">You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond with a success message
    return NextResponse.json(
      { message: 'Password reset email sent' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error during forgot password:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
