import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function POST(request: NextRequest) {
  try {
    const response = successResponse({
      message: 'Logged out successfully',
    });

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
