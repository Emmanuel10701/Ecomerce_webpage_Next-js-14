import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Ensure this path is correct

// GET and POST request handler for orders
export async function handler(req: NextRequest) {
  // GET request to fetch all orders
  if (req.method === 'GET') {
    try {
      const orders = await prisma.order.findMany({
        include: {
          orderItems: true,
          customer: true,
        },
      });
      return NextResponse.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return new NextResponse(JSON.stringify({ error: 'Error fetching orders' }), { status: 500 });
    }
  }

  // POST request to create a new order
  if (req.method === 'POST') {
    try {
      const body = await req.json();
      const { name, email, address, city, zip, customerId, items, total, paymentMethod, status } = body;

      // Validate required fields
      if (!name || !email || !address || !customerId || !items || typeof total !== 'number' || !paymentMethod) {
        return new NextResponse(JSON.stringify({ error: 'Required fields are missing' }), { status: 400 });
      }

      // Validate items structure
      if (!Array.isArray(items) || !items.every(item => item.productId && typeof item.quantity === 'number' && typeof item.price === 'number')) {
        return new NextResponse(JSON.stringify({ error: 'Invalid items format' }), { status: 400 });
      }

      const newOrder = await prisma.order.create({
        data: {
          name,
          email,
          address,
          city: city || '',
          zip: zip || '',
          customerId,
          items,
          total,
          paymentMethod,
          status: status || 'PENDING',
        },
      });

      return NextResponse.json(newOrder, { status: 201 });
    } catch (error:any) {
      console.error('Error creating order:', error);
      return new NextResponse(JSON.stringify({ error: `Error creating order: ${error.message}` }), { status: 500 });
    }
  }

  // Method not allowed
  return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
}
