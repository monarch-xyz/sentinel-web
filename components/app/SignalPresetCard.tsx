import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface SignalPresetCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
}

export function SignalPresetCard({ title, description, icon, children }: SignalPresetCardProps) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#ff6b35]/10 text-[#ff6b35]">
          {icon}
        </div>
        <div>
          <h3 className="mb-1 font-zen text-lg">{title}</h3>
          <p className="text-sm text-secondary">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  );
}
