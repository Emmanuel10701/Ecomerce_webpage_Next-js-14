import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path if needed

export async function DELETE(req: NextRequest) {
  // Extract ID from the URL
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop(); // Extracts the ID from the URL path

  if (id) {
    try {
      // Delete the customer by ID
      const deletedCustomer = await prisma.customer.delete({
        where: { id },
      });

      return NextResponse.json(deletedCustomer, { status: 200 });
    } catch (error:any) {
      console.error('Error deleting customer:', error);
      // Handle not found error and other errors
      if (error.code === 'P2025') {
        return new NextResponse(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
      }
      return new NextResponse(JSON.stringify({ error: 'Error deleting customer' }), { status: 500 });
    }
  } else {
    return new NextResponse(JSON.stringify({ error: 'Customer ID is required' }), { status: 400 });
  }
}

// Handle other methods
export async function handler(req: NextRequest) {
  return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
