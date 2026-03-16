'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { RiTelegram2Line } from 'react-icons/ri';
import { TelegramSetupGuide } from '@/components/app/TelegramSetupGuide';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TelegramConnectResponse {
  ok?: boolean;
  app_user_id?: string;
  details?: string;
}

interface TelegramConnectPanelProps {
  walletAddress?: string | null;
}

export function TelegramConnectPanel({ walletAddress }: TelegramConnectPanelProps) {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('loading');
    setMessage(null);

    try {
      const response = await fetch('/api/telegram/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const payload = (await response.json().catch(() => null)) as TelegramConnectResponse | null;
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.details ?? 'Unable to connect Telegram.');
      }

      setStatus('success');
      setMessage(
        payload.app_user_id
          ? `Telegram linked. Sentinel delivery is now mapped to ${payload.app_user_id}.`
          : 'Telegram linked.'
      );
      setToken('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to connect Telegram.');
    }
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram</p>
          <h2 className="mt-2 font-zen text-2xl">Link alerts to your Telegram chat</h2>
          <p className="mt-2 text-sm text-secondary">
            Use this only when you are ready to deliver live signals into Telegram.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#229ED9]/10 text-[#229ED9]">
          <RiTelegram2Line className="h-5 w-5" />
        </div>
      </div>

      <div className="rounded-sm border border-border/80 bg-background/50 p-3 text-xs text-secondary">
        {walletAddress ? (
          <span>
            Current wallet session: <span className="font-mono text-foreground">{walletAddress}</span>
          </span>
        ) : (
          <span>Your current Sentinel session will be used as the delivery identity.</span>
        )}
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2 text-sm text-secondary">
          Telegram link token
          <input
            type="text"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Paste the token returned by the bot"
            className="rounded-sm border border-border bg-transparent px-3 py-2 text-sm text-foreground"
          />
        </label>
        <Button type="submit" disabled={!token || status === 'loading'}>
          {status === 'loading' ? 'Connecting Telegram...' : 'Connect Telegram'}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <TelegramSetupGuide triggerLabel="How linking works" triggerVariant="secondary" />
        <Link href="/signals/new" className="text-sm text-secondary transition-colors hover:text-foreground no-underline">
          Create a signal first
        </Link>
      </div>

      {message && (
        <p className={status === 'error' ? 'text-sm text-red-500' : 'text-sm text-emerald-600'}>
          {message}
        </p>
      )}
    </Card>
  );
}
