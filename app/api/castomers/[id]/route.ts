import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path if needed

// Get a single customer by ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // Extract the ID from the query parameters

  if (!id) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return new NextResponse(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching customer' }), { status: 500 });
  }
}

// Delete a single customer by ID
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // Extract the ID from the query parameters

  if (!id) {
    return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
  }

  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return new NextResponse(JSON.stringify({ error: 'Customer not found' }), { status: 404 });
    }

    // Delete the customer
    await prisma.customer.delete({
      where: { id },
    });

    return new NextResponse(JSON.stringify({ message: 'Customer deleted successfully' }), { status: 200 });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting customer' }), { status: 500 });
  }
}
