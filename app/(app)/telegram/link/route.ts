import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/auth/constants';
import { buildLoginHref } from '@/lib/auth/redirect';
import { buildRequestUrl } from '@/lib/http/origin';
import { fetchMegabat } from '@/lib/megabat/server';
import { buildTelegramPath, resolveTelegramReturnTo, TELEGRAM_RETURN_TO_COOKIE } from '@/lib/telegram/setup-flow';

const redirectTo = (request: NextRequest, location: string) =>
  NextResponse.redirect(buildRequestUrl(request, location));

const buildLoginPath = (request: NextRequest) => {
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  return buildLoginHref(returnTo);
};

const getPendingReturnTo = (request: NextRequest) =>
  resolveTelegramReturnTo(request.cookies.get(TELEGRAM_RETURN_TO_COOKIE)?.value);

const expirePendingReturnTo = (response: NextResponse) => {
  response.cookies.set(TELEGRAM_RETURN_TO_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

const redirectToWithCleanup = (request: NextRequest, location: string) => {
  const response = redirectTo(request, location);
  expirePendingReturnTo(response);
  return response;
};

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();
  const pendingReturnTo = getPendingReturnTo(request);

  if (!token) {
    return redirectToWithCleanup(
      request,
      buildTelegramPath({
        status: 'missing-token',
        returnTo: pendingReturnTo,
      })
    );
  }

  if (!getSessionCookie(request.cookies)?.value) {
    return redirectTo(request, buildLoginPath(request));
  }

  const response = await fetchMegabat('/me/integrations/telegram/link', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  if (response.ok) {
    return redirectToWithCleanup(request, pendingReturnTo ?? buildTelegramPath({ status: 'linked' }));
  }

  if (response.status === 401) {
    return redirectTo(request, buildLoginPath(request));
  }

  if (response.status === 404) {
    return redirectToWithCleanup(
      request,
      buildTelegramPath({
        status: 'expired',
        returnTo: pendingReturnTo,
      })
    );
  }

  return redirectToWithCleanup(
    request,
    buildTelegramPath({
      status: 'failed',
      returnTo: pendingReturnTo,
    })
  );
}
