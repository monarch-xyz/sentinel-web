export const SESSION_COOKIE = 'megabat_session';
export const LOGIN_RETURN_TO_PARAM = 'returnTo';

const SESSION_COOKIE_SUFFIX = '_session';

type SessionCookie = {
  name: string;
  value: string;
};

type CookieStoreLike = {
  get: (name: string) => SessionCookie | undefined;
  getAll: () => SessionCookie[];
};

export const getSessionCookie = (cookieStore: CookieStoreLike): SessionCookie | undefined => {
  const currentCookie = cookieStore.get(SESSION_COOKIE);
  if (currentCookie?.value) {
    return currentCookie;
  }

  return cookieStore
    .getAll()
    .find((cookie) => cookie.value.length > 0 && cookie.name.endsWith(SESSION_COOKIE_SUFFIX));
};
