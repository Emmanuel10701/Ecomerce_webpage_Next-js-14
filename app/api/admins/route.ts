// pages/api/admins.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
  
    // Handle GET request to retrieve all admins
    try {
     
      const admins = await prisma.admin.findMany();
      return res.status(200).json(admins);
    } catch (error) {
      console.error('Error fetching admins:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    // Handle POST request to add a new admin
    try {
      const { employeeId }: { employeeId: string } = req.body;

      // Check if the employee exists
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
      });

      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check if the employee is already an admin
      const existingAdmin = await prisma.admin.findUnique({
        where: { employeeId },
      });

      if (existingAdmin) {
        return res.status(400).json({ message: 'Employee is already an admin' });
      }

      // Add employee as admin
      await prisma.admin.create({
        data: { employeeId },
      });

      return res.status(200).json({ message: 'Employee promoted to admin successfully' });
    } catch (error) {
      console.error('Error adding admin:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    // Handle DELETE request to remove an admin
    try {
     
      const { id }: { id: string } = req.body;
      await prisma.admin.delete({
        where: { id },
      });
      return res.status(200).json({ message: 'Admin removed successfully' });
    } catch (error) {
      console.error('Error removing admin:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
