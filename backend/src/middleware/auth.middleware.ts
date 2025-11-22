import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from '@/lib/auth';
import { UnauthorizedError } from '@/utils/error-handler';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Extract and verify JWT token from request
 */
export async function authenticate(request: NextRequest): Promise<JWTPayload> {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // If not in header, try to get from cookie
  if (!token) {
    token = request.cookies.get('auth-token')?.value;
  }

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  try {
    const payload = verifyToken(token);
    return payload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

/**
 * Check if user has admin role
 */
export function requireAdmin(user: JWTPayload): void {
  if (user.role !== 'ADMIN') {
    throw new UnauthorizedError('Admin access required');
  }
}
