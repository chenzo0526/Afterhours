import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get user's location from Vercel Edge Network
  const country = request.geo?.country || 'US';
  const city = request.geo?.city || null;
  const region = request.geo?.region || null;

  // Create response
  const response = NextResponse.next();

  // Set geo headers for use in components
  response.headers.set('x-country', country);
  if (city) response.headers.set('x-city', city);
  if (region) response.headers.set('x-region', region);

  // Store in cookies for client-side access
  response.cookies.set('country', country, {
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax',
  });

  if (city) {
    response.cookies.set('city', city, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
  }

  if (region) {
    response.cookies.set('region', region, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
