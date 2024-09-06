import prisma from '../../../libs/prismadb'; // Adjust the path as necessary
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
        // No role field present in the schema
      },
    });

    const response = NextResponse.json({ message: 'Subscription successful' });
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    return response;

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error in POST request:', error.message, error.stack);
      const response = NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      return response;
    } else {
      console.error('Unexpected error in POST request:', error);
      const response = NextResponse.json({ message: 'Server error', error: 'Unexpected error occurred' }, { status: 500 });
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      return response;
    }
  }
}

// GET request handler for fetching all subscribers
export async function GET() {
  try {
    const subscribers = await prisma.subscriber.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        // No role field present in the schema
      },
    });
    console.log(subscribers);

    const response = NextResponse.json(subscribers);
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
    return response;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Database operation error:', error.message);
      const response = NextResponse.json({ error: 'Database operation failed', details: error.message }, { status: 500 });
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      return response;
    } else {
      console.error('Unexpected error in GET request:', error);
      const response = NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
      response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate');
      return response;
    }
  }
}
