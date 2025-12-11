import { successResponse, errorResponse } from '@/utils/api-response';
import { handleError } from '@/utils/error-handler';

export async function POST() {
  try {
    const response = successResponse({
      message: 'Logged out successfully',
    });

    // Clear the auth cookie (must match the same settings as login)
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    const { message, statusCode, code, details } = handleError(error);
    return errorResponse(message, statusCode, code, details);
  }
}
