'use client';

import { useRouter } from 'next/navigation';
import { RiWallet3Line } from 'react-icons/ri';
import { AuthShell } from '@/components/auth/AuthShell';
import { AuthOptionCard } from '@/components/auth/AuthOptionCard';
import { SiwePanel } from '@/components/auth/SiwePanel';

export default function LoginPage() {
  const router = useRouter();

  return (
    <AuthShell
      title="Access Sentinel"
      description="Sign in with your wallet to start managing signals."
    >
      <div className="max-w-2xl">
        <AuthOptionCard
          title="Wallet login"
          description="Sign in with Ethereum to connect your wallet identity."
          icon={<RiWallet3Line className="w-5 h-5" />}
        >
          <SiwePanel onConnect={() => router.push('/app')} />
        </AuthOptionCard>
      </div>
    </AuthShell>
  );
}
