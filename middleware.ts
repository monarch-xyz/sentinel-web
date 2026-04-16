import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/auth/constants';
import { buildLoginHref } from '@/lib/auth/redirect';
import { buildRequestUrl } from '@/lib/http/origin';

const getRequestPath = (request: NextRequest) => {
  const search = request.nextUrl.search;
  return `${request.nextUrl.pathname}${search}`;
};

export function middleware(request: NextRequest) {
  const sessionToken = getSessionCookie(request.cookies)?.value;

  if (sessionToken) {
    return NextResponse.next();
  }

  return NextResponse.redirect(buildRequestUrl(request, buildLoginHref(getRequestPath(request))));
}

export const config = {
  matcher: ['/app/:path*', '/signals/:path*', '/telegram/:path*'],
};
