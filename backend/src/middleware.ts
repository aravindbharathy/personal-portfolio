import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js middleware - runs before all requests
 * Currently handles CORS headers
 */
export function middleware(request: NextRequest) {
  // Get allowed origins from env or default
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '*').split(',').map(o => o.trim());
  const origin = request.headers.get('origin');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (allowedOrigins.includes('*') && origin) {
      // When wildcard is configured but there's an origin (credentials case),
      // allow the specific origin to support credentials
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    } else if (allowedOrigins.includes('*')) {
      // Only use wildcard when there's no origin
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');
    response.headers.set('Access-Control-Max-Age', '86400');

    return response;
  }

  // Clone the response for actual requests
  const response = NextResponse.next();

  // Set CORS headers - must match the origin for credentials to work
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (allowedOrigins.includes('*') && origin) {
    // When wildcard is configured but there's an origin (credentials case),
    // allow the specific origin to support credentials
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  } else if (allowedOrigins.includes('*')) {
    // Only use wildcard when there's no origin
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cookie');

  return response;
}

// Configure which routes use this middleware
export const config = {
  matcher: '/api/:path*',
};
