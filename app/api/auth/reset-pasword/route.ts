import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';
import bcrypt from 'bcryptjs';

interface ResetPasswordRequestBody {
  token: string;
  newPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequestBody = await request.json();
    const { token, newPassword } = body;

    if (newPassword.length < 6) {
      return new NextResponse(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset || passwordReset.expiry < new Date()) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: passwordReset.userId },
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { hashedPassword }, // Use the correct field name
    });

    await prisma.passwordReset.delete({
      where: { token },
    });

    return NextResponse.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error during password reset:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
