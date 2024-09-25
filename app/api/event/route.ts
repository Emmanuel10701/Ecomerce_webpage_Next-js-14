// src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Adjust the path if needed

// Handler for GET (List Events) and POST (Create Event)
export async function handler(request: Request) {
  const { method } = request;

  // Handle Listing Events
  if (method === 'GET') {
    try {
      const events = await prisma.event.findMany();
      return NextResponse.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      return NextResponse.error();
    }
  }

  // Handle Creating Event
  if (method === 'POST') {
    const { title, date, color } = await request.json();
    if (!title || !date || !color) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
    try {
      const newEvent = await prisma.event.create({
        data: { title, date, color },
      });
      return NextResponse.json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      return NextResponse.error();
    }
  }

  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
