import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path if needed

// Handle DELETE request for deleting a single employee by ID
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl; // Get URL parameters
  const id = searchParams.get('id'); // Fetch the 'id' parameter

  console.log("ID received for deletion:", id); // Log the ID for debugging

  if (!id) {
    return NextResponse.json({ error: 'Employee ID is required.' }, { status: 400 });
  }

  try {
    // Delete the employee by ID
    const deletedEmployee = await prisma.employee.delete({
      where: { id: String(id) }, // Ensure ID is a string
    });

    return NextResponse.json({ message: 'Employee deleted successfully.', employee: deletedEmployee });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    if (error.code === 'P2025') { // Prisma error code for not found
      return NextResponse.json({ error: 'Employee not found.' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete employee. Please try again later.', details: error.message },
      { status: 500 }
    );
  }
}
