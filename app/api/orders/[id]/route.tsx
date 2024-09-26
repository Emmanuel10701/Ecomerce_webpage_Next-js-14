import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Ensure this path is correct

// DELETE and PUT request handler for individual orders
export async function handler(req: NextRequest) {
  const { id } = req.query;

  // DELETE request to remove an order by ID
  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return new NextResponse(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
      }

      const deletedOrder = await prisma.order.delete({
        where: { id },
      });

      return NextResponse.json(deletedOrder, { status: 200 });
    } catch (error:any) {
      if (error.code === 'P2025') {
        return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
      }
      console.error('Error deleting order:', error);
      return new NextResponse(JSON.stringify({ error: 'Error deleting order' }), { status: 500 });
    }
  }

  // PUT request to update an order by ID
  if (req.method === 'PUT') {
    try {
      const body = await req.json();
      const { name, email, address, city, zip, items, total, paymentMethod, status } = body;

      const updatedOrder = await prisma.order.update({
        where: { id },
        data: {
          name,
          email,
          address,
          city,
          zip,
          items,
          total,
          paymentMethod,
          status,
        },
      });

      return NextResponse.json(updatedOrder, { status: 200 });
    } catch (error:any) {
      console.error('Error updating order:', error);
      return new NextResponse(JSON.stringify({ error: `Error updating order: ${error.message}` }), { status: 500 });
    }
  }

  // Method not allowed
  return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
