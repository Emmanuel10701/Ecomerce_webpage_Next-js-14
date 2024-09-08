import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../libs/prismadb'; // Adjust the path if needed

// Handle POST request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, userId } = body;

    // Validate required fields
    if (!name || !userId) {
      return new NextResponse(JSON.stringify({ error: 'Name and userId are required' }), { status: 400 });
    }

    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    // Create the new admin
    const newAdmin = await prisma.admin.create({
        data: {
          name,
          user: { connect: { id: userId } },
        },
        include: {
          user: { select: { email: true } },
        },
    });

    return NextResponse.json({
      ...newAdmin,
      email: newAdmin.user.email,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return new NextResponse(JSON.stringify({ error: 'Error creating admin', details: error.message }), { status: 500 });
  }
}

// Handle GET request
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      // Fetch a single admin by ID
      const admin = await prisma.admin.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { email: true, role: true } },
        },
      });

      if (!admin) {
        return new NextResponse(JSON.stringify({ error: 'Admin not found' }), { status: 404 });
      }

      return NextResponse.json({
        ...admin,
        email: admin.user.email,
        role: admin.user.role,
      });
    } else {
      // Fetch all admins
      const admins = await prisma.admin.findMany({
        include: {
          user: { select: { email: true, role: true } },
        },
      });

      return NextResponse.json(admins);
    }
  } catch (error: any) {
    console.error('Error fetching admins:', error);
    return new NextResponse(JSON.stringify({ error: 'Error fetching admins', details: error.message }), { status: 500 });
  }
}

// Handle DELETE request
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(JSON.stringify({ error: 'ID is required' }), { status: 400 });
    }

    // Delete admin by ID
    const deletedAdmin = await prisma.admin.delete({
      where: { id: String(id) },
    });

    return NextResponse.json(deletedAdmin);
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting admin', details: error.message }), { status: 500 });
  }
}
