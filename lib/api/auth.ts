import { webappClient } from '@/lib/api/webapp';
import {
  AuthSession,
  MagicLinkRequest,
  SiweNonceResponse,
  SiweVerifyRequest,
} from '@/lib/auth/types';

export const requestMagicLink = (payload: MagicLinkRequest) =>
  webappClient.post<AuthSession, MagicLinkRequest>('/auth/magic-link', payload);

export const requestSiweNonce = () => webappClient.get<SiweNonceResponse>('/auth/siwe/nonce');

export const verifySiwe = (payload: SiweVerifyRequest) =>
  webappClient.post<AuthSession, SiweVerifyRequest>('/auth/siwe/verify', payload);

export const logout = () => webappClient.post<void, Record<string, never>>('/auth/logout', {});
