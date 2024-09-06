import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Handle GET request to retrieve all employees
    try {
      const employees = await prisma.employee.findMany();
      return res.status(200).json(employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request to add a new employee
    try {
      const { name, email, userId }: { name: string; email: string; userId: string } = req.body;

      // Validate that all required fields are provided
      if (!name || !email || !userId) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Check if the user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return res.status(400).json({ message: 'User not found' });
      }

      // Create the new employee
      const newEmployee = await prisma.employee.create({
        data: {
          name,
          email,
          user: { connect: { id: userId } },
        },
      });

      return res.status(200).json(newEmployee);
    } catch (error) {
      console.error('Error adding employee:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
