import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';

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

    // Optionally, remove the ADMIN role from the user
    await prisma.user.update({
      where: { id: String(id) },
      data: { role: 'USER' }, // or whatever the default role is
    });

    return NextResponse.json(deletedAdmin);
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return new NextResponse(JSON.stringify({ error: 'Error deleting admin', details: error.message }), { status: 500 });
  }
}
