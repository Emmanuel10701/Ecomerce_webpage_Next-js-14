// src/app/api/events/[id]/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path if needed

// Handler for individual Event operations (GET, PUT, DELETE)
export async function handler(request: Request, { params }: { params: { id: string } }) {
  const { method } = request;
  const { id } = params;

  // Handle Fetching Individual Event
  if (method === 'GET') {
    try {
      const event = await prisma.event.findUnique({
        where: { id },
      });
      if (!event) {
        return NextResponse.json({ message: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json(event);
    } catch (error) {
      console.error('Error fetching event:', error);
      return NextResponse.error();
    }
  }

  // Handle Updating Event
  if (method === 'PUT') {
    const { title, date, color } = await request.json();
    if (!title || !date || !color) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
    try {
      const updatedEvent = await prisma.event.update({
        where: { id },
        data: { title, date, color },
      });
      return NextResponse.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      return NextResponse.error();
    }
  }

  // Handle Deleting Event
  if (method === 'DELETE') {
    try {
      await prisma.event.delete({ where: { id } });
      return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return NextResponse.error();
    }
  }

  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
