import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';
import  authorizeAdmin   from '../../../../middleware';

export async function DELETE(req: NextRequest) {
  const authResponse = await authorizeAdmin(req);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return new NextResponse(
        JSON.stringify({ error: 'ID is required' }), 
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({
      where: { id: String(id) },
      select: { userId: true },
    });

    if (!admin) {
      return new NextResponse(
        JSON.stringify({ error: 'Admin not found' }), 
        { status: 404 }
      );
    }

    const deletedAdmin = await prisma.admin.delete({
      where: { id: String(id) },
    });

    await prisma.user.update({
      where: { id: admin.userId },
      data: { role: 'USER' },
    });

    return NextResponse.json(deletedAdmin);
  } catch (error: any) {
    console.error('Error deleting admin:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Error deleting admin', details: error.message }), 
      { status: 500 }
    );
  }
}
