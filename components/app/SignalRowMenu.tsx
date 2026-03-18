'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { RiEyeLine, RiMore2Fill } from 'react-icons/ri';
import { SignalDeleteButton } from '@/components/app/SignalDeleteButton';
import { Button } from '@/components/ui/Button';

interface SignalRowMenuProps {
  signalId: string;
  signalName: string;
}

export function SignalRowMenu({ signalId, signalName }: SignalRowMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuItemClassName = 'flex h-8 items-center gap-2 rounded-sm px-2 text-sm transition-colors';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        aria-label="Open signal actions"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="w-8 px-0"
      >
        <RiMore2Fill className="h-4 w-4" />
      </Button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-20 mt-2 min-w-[160px] rounded-sm border border-border bg-background p-1 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <Link
            href={`/signals/${signalId}`}
            className={`${menuItemClassName} text-secondary no-underline hover:bg-hovered hover:text-foreground`}
            onClick={() => setIsOpen(false)}
          >
            <RiEyeLine className="h-4 w-4 shrink-0" />
            View details
          </Link>
          <SignalDeleteButton
            signalId={signalId}
            signalName={signalName}
            size="sm"
            label="Delete"
            className={`${menuItemClassName} w-full justify-start border-transparent bg-transparent text-red-600 hover:border-transparent hover:bg-red-500/5`}
          />
        </div>
      ) : null}
    </div>
  );
}
