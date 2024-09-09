import { NextRequest, NextResponse } from 'next/server';
import prisma from './libs/prismadb'; // Adjust the path if needed

export default async function middleware(req: NextRequest) {
  // Retrieve cookies from the request
  const authToken = req.cookies.get('authToken')?.value; // Extract the value properly
  const userId = req.cookies.get('userId')?.value; // Extract the value properly

  if (!authToken || !userId) {
    // Return an error if not authenticated
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401 }
    );
  }

  try {
    // Check if the user is an admin
    const user = await prisma.user.findUnique({
      where: { id: userId as string }, // Ensure `userId` is treated as a string
      select: { role: true },
    });

    if (!user || user.role !== 'ADMIN') {
      // Return an error if the user is not an admin
      return new NextResponse(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403 }
      );
    }
  } catch (error) {
    console.error('Error checking user role:', error);
    // Return an error if there's an issue with checking the user role
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }

  return NextResponse.next(); // Allow the request to proceed if authorized
}

export const config = {
  matcher: ['/admin/:path*'], // Define which routes this middleware applies to
};
