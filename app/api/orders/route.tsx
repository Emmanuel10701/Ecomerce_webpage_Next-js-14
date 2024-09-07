import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Import from the correct path

// GET request to fetch all orders or a single order by ID
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    // Fetch a single order by ID
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true, // Include related orderItems if needed
          customer: true,   // Include related customer if needed
        },
      });
      if (order) {
        return NextResponse.json(order);
      } else {
        return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      return new NextResponse(JSON.stringify({ error: 'Error fetching order' }), { status: 500 });
    }
  } else {
    // Fetch all orders
    try {
      const orders = await prisma.order.findMany({
        include: {
          orderItems: true, // Include related orderItems if needed
          customer: true,   // Include related customer if needed
        },
      });
      return NextResponse.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return new NextResponse(JSON.stringify({ error: 'Error fetching orders' }), { status: 500 });
    }
  }
}

// POST request to create a new order

// POST request to create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, city, zip, customerId, items, total, paymentMethod, status } = body;

    // Validate required fields
    if (!name || !email || !address || !customerId || !items || typeof total !== 'number' || !paymentMethod) {
      return new NextResponse(JSON.stringify({ error: 'Name, email, address, customerId, items, total, and paymentMethod are required' }), { status: 400 });
    }

    // Create a new order
    const newOrder = await prisma.order.create({
      data: {
        name,
        email,
        address,
        city: city || '',  // Provide default value if city is not provided
        zip: zip || '',    // Provide default value if zip is not provided
        customerId,
        items,             // Ensure items match the expected JSON structure
        total,
        paymentMethod,
        status: status || 'PENDING', // Default to 'PENDING' if status is not provided
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return new NextResponse(JSON.stringify({ error: 'Error creating order' }), { status: 500 });
  }
}


// DELETE request to remove an order by ID
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'Order ID is required' }), { status: 400 });
    }

    // Delete an order by ID
    const deletedOrder = await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(deletedOrder, { status: 200 });
  } catch (error: any) {
    if (error.code === 'P2025') { // Prisma error code for record not found
      return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }
    console.error('Error deleting order:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting order' }), { status: 500 });
  }
}
