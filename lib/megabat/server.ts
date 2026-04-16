import 'server-only';

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSessionCookie } from '@/lib/auth/constants';

const MEGABAT_BASE_URL_FALLBACK = 'http://localhost:3000/api/v1';

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getConfiguredMegabatApiBaseUrl = () => {
  if (process.env.MEGABAT_API_BASE_URL) {
    return process.env.MEGABAT_API_BASE_URL;
  }

  const fallbackEntry = Object.entries(process.env).find(
    ([key, value]) =>
      key.endsWith('_API_BASE_URL') &&
      key !== 'DELIVERY_BASE_URL' &&
      key !== 'MEGABAT_API_BASE_URL' &&
      !key.startsWith('NEXT_PUBLIC_') &&
      typeof value === 'string' &&
      value.length > 0
  );

  return fallbackEntry?.[1];
};

const normalizeMegabatBaseUrl = (value: string) => {
  const withScheme = /^[a-z][a-z\d+\-.]*:\/\//i.test(value) ? value : `http://${value}`;
  const url = new URL(withScheme);

  const normalizedPath = trimTrailingSlash(url.pathname);
  url.pathname =
    !normalizedPath || normalizedPath === '/' ? '/api/v1' : normalizedPath;

  return trimTrailingSlash(url.toString());
};

export const getMegabatApiBaseUrl = () =>
  normalizeMegabatBaseUrl(
    getConfiguredMegabatApiBaseUrl() ?? MEGABAT_BASE_URL_FALLBACK
  );

export const buildMegabatApiUrl = (path: string, search: string = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getMegabatApiBaseUrl()}${normalizedPath}${search}`;
};

const getMegabatSessionCookieHeader = async () => {
  const cookieStore = await cookies();
  const sessionCookie = getSessionCookie(cookieStore);
  if (!sessionCookie?.value) {
    return null;
  }

  return `${sessionCookie.name}=${sessionCookie.value}`;
};

const buildMegabatAuthHeaders = async (headersInit?: HeadersInit) => {
  const headers = new Headers(headersInit);
  if (!headers.has('X-API-Key') && !headers.has('Authorization') && !headers.has('Cookie')) {
    const cookieHeader = await getMegabatSessionCookieHeader();
    if (cookieHeader) {
      headers.set('Cookie', cookieHeader);
    }
  }

  return headers;
};

export const fetchMegabat = async (path: string, init: RequestInit = {}) => {
  const headers = await buildMegabatAuthHeaders(init.headers);

  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(buildMegabatApiUrl(path), {
    ...init,
    headers,
    cache: 'no-store',
  });
};

const copyResponseHeaders = (from: Response, to: Headers) => {
  const contentType = from.headers.get('content-type');
  if (contentType) {
    to.set('content-type', contentType);
  }

  const cacheControl = from.headers.get('cache-control');
  if (cacheControl) {
    to.set('cache-control', cacheControl);
  }

  const setCookies =
    typeof from.headers.getSetCookie === 'function'
      ? from.headers.getSetCookie()
      : from.headers.get('set-cookie')
        ? [from.headers.get('set-cookie') as string]
        : [];

  for (const value of setCookies) {
    to.append('set-cookie', value);
  }
};

export const proxyRequestToMegabat = async (request: Request, path: string, search = '') => {
  const headers = new Headers();

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('content-type', contentType);
  }

  const accept = request.headers.get('accept');
  if (accept) {
    headers.set('accept', accept);
  }

  const authorization = request.headers.get('authorization');
  if (authorization) {
    headers.set('authorization', authorization);
  }

  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    headers.set('x-api-key', apiKey);
  }

  const adminKey = request.headers.get('x-admin-key');
  if (adminKey) {
    headers.set('x-admin-key', adminKey);
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const body = hasBody ? await request.text() : undefined;

  const response = await fetchMegabat(`${path}${search}`, {
    method: request.method,
    headers,
    body,
  });

  const nextHeaders = new Headers();
  copyResponseHeaders(response, nextHeaders);

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: nextHeaders,
  });
};
