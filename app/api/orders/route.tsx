// app/api/orders/route.ts

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
      });
      if (order) {
        return NextResponse.json(order);
      } else {
        return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
      }
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Error fetching order' }), { status: 500 });
    }
  } else {
    // Fetch all orders
    try {
      const orders = await prisma.order.findMany();
      return NextResponse.json(orders);
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: 'Error fetching orders' }), { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, address, city, zip, items, paymentMethod } = body;

    if (!name || !email || !address || !city || !zip || !items || !paymentMethod) {
      return new NextResponse(JSON.stringify({ error: 'All fields are required' }), { status: 400 });
    }

    const newOrder = await prisma.order.create({
      data: {
        name,
        email,
        address,
        city,
        zip,
        items,
        paymentMethod,
        status: 'pending',
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
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

    const deletedOrder = await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json(deletedOrder, { status: 200 });
  } catch (error) {
    if (error.code === 'P2025') {
      return new NextResponse(JSON.stringify({ error: 'Order not found' }), { status: 404 });
    }
    return new NextResponse(JSON.stringify({ error: 'Error deleting order' }), { status: 500 });
  }
}
