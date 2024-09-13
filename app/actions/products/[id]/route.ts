import { NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb'; // Adjust the path as needed

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  ratings: number;
  image?: string;
  quantity?: number;
  createdAt: string;
  category?: string;
}

export async function handler(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    if (req.method === 'GET') {
      // Handle GET request to fetch product by ID
      const product = await prisma.product.findUnique({
        where: { id: String(id) }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json(product);

    } else if (req.method === 'DELETE') {
      // Handle DELETE request to delete product by ID
      const deletedProduct = await prisma.product.delete({
        where: { id: String(id) }
      });
      return NextResponse.json(deletedProduct);

    } else {
      // Handle unsupported methods
      return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }
  } catch (error: any) {
    console.error(`Error handling ${req.method} request:`, error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
