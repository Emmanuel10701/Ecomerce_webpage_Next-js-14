import bcrypt from 'bcrypt'; // or 'bcryptjs' if using bcryptjs
import prisma from '../../../libs/prismadb';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'Missing fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (!PASSWORD_REGEX.test(password)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: 'Email already exists' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('Error during registration:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
