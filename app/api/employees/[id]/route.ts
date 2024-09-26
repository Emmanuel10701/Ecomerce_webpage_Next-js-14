import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path if needed

// Handle GET request for fetching a single employee by ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Employee ID is required.' },
      { status: 400 }
    );
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }, // Include user info if needed
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee. Please try again later.', details: error.message },
      { status: 500 }
    );
  }
}

// Handle PUT request for updating an employee
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, userId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required for update.' },
        { status: 400 }
      );
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        name,
        userId,
      },
    });

    return NextResponse.json(updatedEmployee);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { error: 'Failed to update employee. Please try again later.', details: error.message },
      { status: 500 }
    );
  }
}

// Handle DELETE request for deleting an employee
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Employee ID is required for deletion.' },
      { status: 400 }
    );
  }

  try {
    const deletedEmployee = await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      message: 'Employee deleted successfully.',
      deletedEmployee,
    });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee. Please try again later.', details: error.message },
      { status: 500 }
    );
  }
}
