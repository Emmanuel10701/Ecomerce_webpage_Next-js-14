// File: /pages/api/auth/forgot-password.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface ForgotPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email }: ForgotPasswordRequestBody = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // Valid for 1 hour

    await prisma.passwordReset.create({
      data: {
        token,
        expiry,
        userId: user.id,
      },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p style="color: #555;">You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #0070f3; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="color: #777; font-size: 12px; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Password reset email sent' }, { status: 200 });
  } catch (error) {
    console.error('Error during forgot password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
