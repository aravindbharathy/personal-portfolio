import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function GET(request: NextRequest) {
  try {
    // Try to authenticate
    const payload = await authenticate(request);

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return successResponse({
      authenticated: true,
      user,
    });
  } catch (error) {
    // If authentication fails, return unauthenticated status
    return successResponse({
      authenticated: false,
      user: null,
    });
  }
}
