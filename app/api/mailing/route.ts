// pages/api/save-event.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../libs/prismadb';

// Define the event type based on your Prisma schema
interface Event {
  title: string;
  date: string;
  color: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { event }: { event: Event } = req.body;

    try {
      // Save event to the database
      const newEvent = await prisma.event.create({
        data: {
          title: event.title,
          date: event.date,
          color: event.color, // Ensure your Prisma schema has a color field
        },
      });

      res.status(200).json({ message: 'Event saved successfully', event: newEvent });
    } catch (error) {
      console.error('Error saving event:', error);
      res.status(500).json({ error: 'Failed to save event' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
