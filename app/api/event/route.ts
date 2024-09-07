// src/app/api/events/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Adjust the path if needed

// Handler for GET (List Events) and POST (Create Event)
export async function handler(request: Request, { params }: { params?: { id?: string } }) {
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

  // Handle Updating Event
  if (method === 'PUT') {
    if (!params?.id) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    }
    const { title, date, color } = await request.json();
    if (!title || !date || !color) {
      return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
    }
    try {
      const updatedEvent = await prisma.event.update({
        where: { id: params.id },
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
    if (!params?.id) {
      return NextResponse.json({ message: 'Event ID is required' }, { status: 400 });
    }
    try {
      await prisma.event.delete({ where: { id: params.id } });
      return NextResponse.json({ message: 'Event deleted' });
    } catch (error) {
      console.error('Error deleting event:', error);
      return NextResponse.error();
    }
  }

  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

// Cleanup old events
export async function cleanupOldEvents() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  try {
    await prisma.event.deleteMany({
      where: {
        date: {
          lt: twoDaysAgo,
        },
      },
    });
    console.log('Old events deleted successfully');
  } catch (error) {
    console.error('Error deleting old events:', error);
  }
}
