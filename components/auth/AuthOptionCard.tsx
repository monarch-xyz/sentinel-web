import { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface AuthOptionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function AuthOptionCard({
  title,
  description,
  icon,
  children,
  footer,
}: AuthOptionCardProps) {
  return (
    <Card className="flex flex-col gap-5 border border-border/80 bg-surface/90 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-md bg-[#ff6b35]/10 text-[#ff6b35] flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h3 className="font-zen text-lg font-semibold mb-1">{title}</h3>
            <p className="text-secondary text-sm leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      {children && <div className="rounded-md border border-border/70 bg-background/60 p-4">{children}</div>}
      {footer && <div className="pt-2 border-t border-border/70">{footer}</div>}
    </Card>
  );
}
