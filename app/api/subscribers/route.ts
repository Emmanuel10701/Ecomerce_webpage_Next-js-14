import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Handle POST request to add a new subscriber
    try {
      const { email }: { email: string } = req.body;

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Invalid email address' });
      }

      // Check if the email is already subscribed
      const existingSubscriber = await prisma.subscriber.findUnique({
        where: { email },
      });

      if (existingSubscriber) {
        return res.status(400).json({ message: 'Email already subscribed' });
      }

      // Add new subscriber
      await prisma.subscriber.create({
        data: { email },
      });

      return res.status(200).json({ message: 'Subscription successful' });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

  } else if (req.method === 'GET') {
    // Handle GET request to retrieve all subscribers
    try {
      const subscribers = await prisma.subscriber.findMany();
      return res.status(200).json(subscribers);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }

  } else {
    // Handle unsupported HTTP methods
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
