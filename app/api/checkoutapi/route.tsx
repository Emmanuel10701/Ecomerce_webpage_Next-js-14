// pages/api/checkout.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';
import prisma from '../../../libs/prismadb'; // Adjust the path as necessary

// Configure PayPal SDK
const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_SECRET!;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(req: Request) {
  const { orderID, billingInfo } = await req.json();

  try {
    // Capture the order from PayPal
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({}); // Optional: Add request body if needed

    const response = await client.execute(request);

    if (response.statusCode === 200) {
      // Create an order in the database using Prisma
      const order = await prisma.order.create({
        data: {
          orderId: orderID,
          name: billingInfo.name,
          email: billingInfo.email,
          address: billingInfo.address,
          city: billingInfo.city,
          zip: billingInfo.zip,
          total: parseFloat(response.result.purchase_units[0].amount.value),
          paymentMethod: 'PayPal',
          status: 'COMPLETED',
          customer: {
            connect: { id: billingInfo.customerId }, // Ensure billingInfo has customerId
          },
        },
      });

      return NextResponse.json({ success: true, order });
    } else {
      return NextResponse.json({ success: false, message: 'Failed to capture payment.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json({ success: false, message: 'Payment processing failed' }, { status: 500 });
  }
}
