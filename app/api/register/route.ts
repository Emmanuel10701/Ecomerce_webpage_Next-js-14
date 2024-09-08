import bcrypt from 'bcrypt';
import prisma from '../../../libs/prismadb';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
}

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// POST request handler for user registration
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequestBody = await request.json();
    const { name, email, password } = body;

    // Check for missing fields
    if (!name || !email || !password) {
      return new NextResponse(
        JSON.stringify({ error: 'All fields are required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate password
    if (!PASSWORD_REGEX.test(password)) {
      return new NextResponse(
        JSON.stringify({
          error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: 'An account with this email already exists.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    // Respond with success
    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    console.error('Error during registration:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// GET request handler for retrieving all users
export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error retrieving users:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error. Please try again later.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
