// pages/api/employees.ts
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
      const { name, email }: { name: string; email: string } = req.body;
      await prisma.employee.create({
        data: { name, email },
      });
      return res.status(200).json({ message: 'Employee added successfully' });
    } catch (error) {
      console.error('Error adding employee:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
