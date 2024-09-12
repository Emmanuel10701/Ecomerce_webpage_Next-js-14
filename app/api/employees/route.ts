// File: src/pages/api/employees.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Adjust the path as needed

export async function handler(req: NextRequest) {
  const { method } = req;

  try {
    if (method === 'POST') {
      // Handle POST request for creating employees
      const body = await req.json();
      const { name, userId } = body;

      // Validate required fields
      if (!name || !userId) {
        return new NextResponse(
          JSON.stringify({ error: 'Name and userId are required' }),
          { status: 400 }
        );
      }

      // Check if the user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return new NextResponse(
          JSON.stringify({ error: 'User not found' }),
          { status: 404 }
        );
      }

      // Check if the user is already an employee
      const existingEmployee = await prisma.employee.findFirst({
        where: { userId },
      });

      if (existingEmployee) {
        return new NextResponse(
          JSON.stringify({ error: 'User is already an employee' }),
          { status: 400 }
        );
      }

      // Create the new employee entry
      const newEmployee = await prisma.employee.create({
        data: { name, user: { connect: { id: userId } } },
        include: { user: { select: { email: true } } },
      });

      return NextResponse.json({
        ...newEmployee,
        email: newEmployee.user.email,
      }, { status: 201 });

    } else if (method === 'GET') {
      // Handle GET request for fetching employees
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');

      if (id) {
        // Fetch a single employee by ID
        const employee = await prisma.employee.findUnique({
          where: { id: String(id) },
          include: { user: { select: { email: true } } },
        });

        if (!employee) {
          return new NextResponse(
            JSON.stringify({ error: 'Employee not found' }),
            { status: 404 }
          );
        }

        return NextResponse.json({
          ...employee,
          email: employee.user.email,
        });

      } else {
        // Fetch all employees
        const employees = await prisma.employee.findMany({
          include: { user: { select: { email: true } } },
        });

        return NextResponse.json(employees);
      }
    } else {
      // Method not allowed
      return new NextResponse(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405 }
      );
    }
  } catch (error: any) {
    console.error('Error handling request:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error handling request', details: error.message }),
      { status: 500 }
    );
  }
}
