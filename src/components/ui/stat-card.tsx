import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'accent' | 'warning' | 'danger';
  className?: string;
}

export function StatCard({ title, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'bg-card hover:border-primary/20',
    accent: 'bg-accent/5 border-accent/20 hover:bg-accent/10',
    warning: 'bg-warning/5 border-warning/20 hover:bg-warning/10',
    danger: 'bg-redzone/5 border-redzone/20 hover:bg-redzone/10',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    accent: 'bg-accent/20 text-accent',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-redzone/20 text-redzone',
  };

  return (
    <div className={cn(
      'rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-fade-in group',
      variantStyles[variant],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              'text-sm flex items-center gap-1 font-medium',
              trend.isPositive ? 'text-success' : 'text-destructive'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last week</span>
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg transition-transform group-hover:scale-110 duration-300', iconStyles[variant])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
