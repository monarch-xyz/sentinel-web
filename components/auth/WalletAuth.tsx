'use client';

import { useState } from 'react';
import { useConnection, useConnect, useConnectors, useDisconnect, useSignMessage } from 'wagmi';
import { Button } from '@/components/ui/Button';
import { requestSiweNonce, verifySiwe } from '@/lib/api/auth';
import { buildSiweMessage } from '@/lib/auth/siwe';
import { storeSession } from '@/lib/auth/session';

interface WalletAuthProps {
  onSuccess?: () => void;
}

export function WalletAuth({ onSuccess }: WalletAuthProps) {
  const { address, isConnected, chainId, isConnecting: isConnectionConnecting } = useConnection();
  const { mutateAsync: connectAsync, isPending: isConnecting } = useConnect();
  const connectors = useConnectors();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const connector = connectors[0];

  const handleConnect = async () => {
    setError(null);
    setStatus('loading');
    try {
      if (!connector) {
        throw new Error('No wallet connector available.');
      }
      await connectAsync({ connector });
      setStatus('idle');
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : 'Unable to connect wallet.');
      setStatus('error');
    }
  };

  const handleSignIn = async () => {
    if (!address || !chainId) {
      setError('Connect a wallet to continue.');
      return;
    }

    setStatus('loading');
    setError(null);

    try {
      const nonceResponse = await requestSiweNonce();
      const message = buildSiweMessage({
        address,
        chainId,
        nonce: nonceResponse.nonce,
      });
      const signature = await signMessageAsync({ message });
      const session = await verifySiwe({ message, signature, address });
      storeSession(session);
      onSuccess?.();
      setStatus('idle');
    } catch (signError) {
      setError(signError instanceof Error ? signError.message : 'Unable to sign in with wallet.');
      setStatus('error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-secondary">
        Connect a wallet, then sign the message to confirm ownership.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex flex-col sm:flex-row gap-3">
        {!isConnected && (
          <Button onClick={handleConnect} disabled={isConnecting || isConnectionConnecting || status === 'loading'}>
            {isConnecting || isConnectionConnecting || status === 'loading' ? 'Connecting...' : 'Connect wallet'}
          </Button>
        )}
        <Button
          variant={isConnected ? 'primary' : 'secondary'}
          onClick={handleSignIn}
          disabled={!isConnected || status === 'loading'}
        >
          {status === 'loading' ? 'Signing...' : 'Sign in with wallet'}
        </Button>
        {isConnected && (
          <Button variant="ghost" onClick={() => disconnect()}>
            Disconnect
          </Button>
        )}
      </div>
      {address && (
        <div className="text-xs text-secondary flex flex-wrap items-center gap-2">
          <span>Connected as</span>
          <span className="px-2 py-1 rounded-sm bg-[#ff6b35]/10 text-[#ff6b35] font-mono">
            {address}
          </span>
        </div>
      )}
    </div>
  );
}
