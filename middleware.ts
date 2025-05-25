import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const isMobile = /iPhone|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);

  // すでに /mobile-only にいる場合はリダイレクトしない
  if (isMobile && !request.nextUrl.pathname.startsWith('/mobile-only')) {
    return NextResponse.redirect(new URL('/mobile-only', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
