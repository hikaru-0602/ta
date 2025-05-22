import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';

  // スマホ・タブレットのUA判定（必要に応じて追加・調整）
  const isMobile = /iPhone|iPad|iPod|Android|Mobile|Windows Phone|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua);

  if (isMobile) {
    // 例: /mobile-only ページにリダイレクト
    return NextResponse.redirect(new URL('/mobile-only', request.url));
  }

  // PCの場合はそのまま
  return NextResponse.next();
}

// 適用するパスを指定（全ページに適用したい場合はこのまま）
export const config = {
  matcher: '/:path*',
};