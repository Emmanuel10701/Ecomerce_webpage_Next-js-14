import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface ForgotPasswordRequestBody {
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequestBody = await request.json();
    const { email } = body;

    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const token = Math.random().toString(36).substring(2);
    const expiry = new Date(Date.now() + 3600000);

    await prisma.passwordReset.create({
      data: {
        token,
        expiry,
        userId: user.id,
      },
    });

    const resetLink = `https://yourdomain.com/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the following link to reset your password: ${resetLink}`,
    });

    return NextResponse.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during forgot password:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
