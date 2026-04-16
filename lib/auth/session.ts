import 'server-only';

import { cookies } from 'next/headers';
import { getSessionCookie } from '@/lib/auth/constants';
import type { MegabatAuthenticatedUser } from '@/lib/auth/types';
import { fetchMegabat } from '@/lib/megabat/server';

export const getWalletAddressFromUser = (user: MegabatAuthenticatedUser): string | null => {
  const walletIdentity = user.identities.find((identity) => identity.provider === 'wallet');
  if (!walletIdentity) {
    return null;
  }

  const metadataAddress = walletIdentity.metadata?.address;
  if (typeof metadataAddress === 'string' && metadataAddress.length > 0) {
    return metadataAddress.toLowerCase();
  }

  return walletIdentity.provider_subject.toLowerCase();
};

export const getAuthenticatedUser = async (): Promise<MegabatAuthenticatedUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = getSessionCookie(cookieStore);
  if (!sessionCookie?.value) {
    return null;
  }

  const response = await fetchMegabat('/auth/me');
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Megabat auth bootstrap failed (${response.status})`);
  }

  return (await response.json()) as MegabatAuthenticatedUser;
};
