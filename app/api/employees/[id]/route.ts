import { NextResponse } from 'next/server';
import prisma from '../../../../libs/prismadb';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const deletedEmployee = await prisma.employee.delete({
      where: { id: String(id) },
    });

    return NextResponse.json(deletedEmployee);
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: 'Error deleting employee', details: error.message }, { status: 500 });
  }
}
