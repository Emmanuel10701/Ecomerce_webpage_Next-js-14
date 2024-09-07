import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (id) {
    // Fetch a single order by ID
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true, // Optionally include order items
          customer: true, // Optionally include customer
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
          orderItems: true, // Optionally include order items
          customer: true, // Optionally include customer
        },
      });
      return NextResponse.json(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      return new NextResponse(JSON.stringify({ error: 'Error fetching orders' }), { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, city, zip, customerId, items, total, paymentMethod } = body;

    // Validate required fields
    if (!name || !email || !address || !city || !zip || !customerId || !items || !total || !paymentMethod) {
      return new NextResponse(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    // Create a new order
    const newOrder = await prisma.order.create({
      data: {
        name,
        email,
        address,
        city,
        zip,
        customerId,
        items,
        total,
        paymentMethod,
        status: 'pending', // Default status
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return new NextResponse(JSON.stringify({ error: 'Error creating order' }), { status: 500 });
  }
}

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
    if (error.code === 'P2025') {
      return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }
    console.error('Error deleting order:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting order' }), { status: 500 });
  }
}
