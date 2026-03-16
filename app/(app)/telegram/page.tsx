import Link from 'next/link';
import { TelegramConnectPanel } from '@/components/app/TelegramConnectPanel';
import { TelegramSetupGuide } from '@/components/app/TelegramSetupGuide';
import { Button } from '@/components/ui/Button';
import { getAuthenticatedUser, getWalletAddressFromUser } from '@/lib/auth/session';

export default async function TelegramPage() {
  const user = await getAuthenticatedUser();
  const walletAddress = user ? getWalletAddressFromUser(user) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[16px] border border-border bg-surface p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">Telegram</p>
          <h1 className="mt-3 font-zen text-3xl sm:text-4xl">Telegram delivery workspace</h1>
          <p className="mt-3 text-secondary">
            Link Telegram only when you are ready to deliver alerts there. The setup guide stays on demand instead of living
            permanently on this page.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signals/new" className="no-underline">
            <Button size="lg" variant="secondary">
              Create signal
            </Button>
          </Link>
          <TelegramSetupGuide triggerLabel="Open setup guide" triggerVariant="secondary" triggerSize="lg" />
        </div>
      </section>

      <TelegramConnectPanel walletAddress={walletAddress} />
    </div>
  );
}
