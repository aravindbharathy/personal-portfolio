import { NextRequest } from 'next/server';
import { AppError } from '@/utils/error-handler';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max number of requests per window
}

/**
 * Simple in-memory rate limiter
 * Note: For production, use Redis or a dedicated rate limiting service
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): void => {
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown';

    const key = `${ip}:${request.nextUrl.pathname}`;
    const now = Date.now();

    // Clean up old entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }

    // Initialize or increment
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs,
      };
    } else {
      store[key].count++;
    }

    // Check limit
    if (store[key].count > config.max) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
      throw new AppError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds`,
        429,
        'RATE_LIMIT_EXCEEDED'
      );
    }
  };
}

// Predefined rate limiters
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
});

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // 500 requests per 15 minutes
});

export const contactRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
});
