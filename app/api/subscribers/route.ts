// Import Prisma client instance
import prisma from '../../../libs/prismadb'; // Adjust the path as necessary
import { NextRequest, NextResponse } from 'next/server';

// POST request handler for creating a new subscriber
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: 'Invalid email address' }, { status: 400 });
    }

    // Check if the email is already subscribed
    const existingSubscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existingSubscriber) {
      return NextResponse.json({ message: 'Email already subscribed' }, { status: 400 });
    }

    // Add new subscriber
    await prisma.subscriber.create({
      data: {
        email,
        role: 'USER', // Default role
      },
    });

    return NextResponse.json({ message: 'Subscription successful' });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST request:', error.message, error.stack);
      return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    } else {
      console.error('Unexpected error in POST request:', error);
      return NextResponse.json({ message: 'Server error', error: 'Unexpected error occurred' }, { status: 500 });
    }
  }
}

export async function GET(req: NextRequest) {
  try {
    const subscribers = await prisma.subscriber.findMany();
    return NextResponse.json(subscribers);
  } catch (error: unknown) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ message: 'Server error', error: 'An error occurred while retrieving subscribers' }, { status: 500 });
  }
}
