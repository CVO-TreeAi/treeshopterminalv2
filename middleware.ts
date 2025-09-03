import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `rate_limit_${ip}`;
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '3600000'); // 1 hour
  const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return false;
  }

  const limit = rateLimitStore[key];

  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return false;
  }

  limit.count++;
  return limit.count > maxRequests;
}

export function middleware(request: NextRequest) {
  // Apply rate limiting only to API routes
  if (request.nextUrl.pathname.startsWith('/api/v1/')) {
    const rateLimitKey = getRateLimitKey(request);
    
    if (isRateLimited(rateLimitKey)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Add rate limit headers
    const response = NextResponse.next();
    const limit = rateLimitStore[rateLimitKey];
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');
    
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', Math.max(0, maxRequests - limit.count).toString());
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString());
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/v1/:path*',
};