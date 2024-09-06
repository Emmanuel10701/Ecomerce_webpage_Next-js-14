import prisma from '../../../libs/prismadb'; // Ensure the path is correct
import { NextRequest, NextResponse } from 'next/server';

// POST request handler for creating a new subscriber
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Validate email format
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
      // Log detailed error information
      console.error('Error in POST request:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        // Optionally log more context if available
      });
      return NextResponse.json(
        { message: 'Server error', error: error.message, details: error.stack },
        { status: 500 }
      );
    } else {
      // Log unexpected error type
      console.error('Unexpected error in POST request:', error);
      return NextResponse.json(
        { message: 'Server error', error: 'Unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}

// GET request handler for retrieving all subscribers
export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        role: true,
      },
    });
    console.log('Retrieved subscribers:', subscribers);

    return NextResponse.json(subscribers);
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Log detailed error information
      console.error('Database operation error:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        // Optionally log more context if available
      });
      return NextResponse.json(
        { error: 'Database operation failed', details: error.message },
        { status: 500 }
      );
    } else {
      // Log unexpected error type
      console.error('Unexpected error in GET request:', error);
      return NextResponse.json(
        { error: 'Unexpected error occurred' },
        { status: 500 }
      );
    }
  }
}
