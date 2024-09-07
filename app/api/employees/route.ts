import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Adjust the path if needed

// Handle POST request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, userId } = body;

    // Validate required fields
    if (!name || !userId) {
      return new NextResponse(JSON.stringify({ error: 'Name and userId are required' }), { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Create the new employee
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        user: { connect: { id: userId } },
      },
      include: {
        user: { select: { email: true } },
      },
    });

    return NextResponse.json({
      ...newEmployee,
      email: newEmployee.user.email,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return new NextResponse(JSON.stringify({ error: 'Error creating employee', details: error.message }), { status: 500 });
  }
}

// Handle GET request
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch a single employee by ID
      const employee = await prisma.employee.findUnique({
        where: { id:String(id) },
        include: {
          user: { select: { email: true } },
        },
      });

      if (!employee) {
        return new NextResponse(JSON.stringify({ error: 'Employee not found' }), { status: 404 });
      }

      return NextResponse.json({
        ...employee,
        email: employee.user.email,
      });
    } else {
      // Fetch all employees
      const employees = await prisma.employee.findMany({
        include: {
          user: { select: { email: true } },
        },
      });

      return NextResponse.json(employees);
    }
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching employees', details: error.message }), { status: 500 });
  }
}

// Handle DELETE request
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'ID is required' }), { status: 400 });
    }

    // Delete employee by ID
    const deletedEmployee = await prisma.employee.delete({
      where: { id: String(id) },
    });

    return NextResponse.json(deletedEmployee);
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting employee', details: error.message }), { status: 500 });
  }
}
