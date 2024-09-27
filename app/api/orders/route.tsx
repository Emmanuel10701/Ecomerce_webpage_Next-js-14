import prisma from '../../../libs/prismadb';
import { NextResponse } from 'next/server';

interface OrderRequestBody {
    name: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    customerId: string;
    orderItems: {
        productId: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    paymentMethod: string;
}

export async function GET() {
    try {
        const orders = await prisma.order.findMany({
            include: { orderItems: true, customer: true }, // Include related data
        });
        return NextResponse.json(orders);
    } catch (error: any) { // You can define a specific error type if needed
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { name, email, address, city, zip, customerId, orderItems, total, paymentMethod }: OrderRequestBody = await req.json();

    try {
        const order = await prisma.order.create({
            data: {
                name,
                email,
                address,
                city,
                zip,
                customerId,
                orderItems: {
                    create: orderItems, // Create associated order items
                },
                total,
                paymentMethod,
            },
        });
        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
