'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RiDeleteBinLine } from 'react-icons/ri';
import { Button } from '@/components/ui/Button';
import { deleteSignal } from '@/lib/api/signals';
import { cn } from '@/lib/utils';

interface SignalDeleteButtonProps {
  signalId: string;
  signalName: string;
  redirectTo?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function SignalDeleteButton({
  signalId,
  signalName,
  redirectTo,
  size = 'md',
  label = 'Delete signal',
  className,
}: SignalDeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) {
      return;
    }

    const confirmed = window.confirm(`Delete "${signalName}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSignal(signalId);

      if (redirectTo) {
        router.push(redirectTo);
      }

      router.refresh();
    } catch (error) {
      setIsDeleting(false);
      window.alert(error instanceof Error ? error.message : 'Unable to delete signal.');
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      size={size}
      disabled={isDeleting}
      onClick={handleDelete}
      className={cn(
        'gap-2 border-red-500/20 text-red-600 hover:border-red-500/30 hover:bg-red-500/5 hover:text-red-700',
        className
      )}
    >
      <RiDeleteBinLine className="h-4 w-4" />
      {isDeleting ? 'Deleting...' : label}
    </Button>
  );
}
