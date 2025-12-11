import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color?: 'primary' | 'accent' | 'warning';
}

export default function StatCard({ title, value, icon: Icon, color = 'primary' }: StatCardProps) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </div>
    </div>
  );
}
