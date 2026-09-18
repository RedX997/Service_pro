import { useClientDeadlines } from '@/hooks/useClientPortal';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarClock } from 'lucide-react';

const visualStyles: Record<string, { card: string; days: string; badge: string }> = {
  green: { card: 'border-green-200 bg-green-50', days: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  amber: { card: 'border-amber-200 bg-amber-50', days: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  red:   { card: 'border-red-200 bg-red-50',     days: 'text-red-700',   badge: 'bg-red-100 text-red-700' },
  grey:  { card: 'border-slate-200 bg-slate-50', days: 'text-slate-500', badge: 'bg-slate-100 text-slate-600' },
};

interface Props { clientId: string; }

export default function ClientDeadlines({ clientId }: Props) {
  const { data: deadlines = [], isLoading } = useClientDeadlines(clientId, true);

  if (isLoading) return <div className="space-y-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20" />)}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Compliance Deadlines</h1>
        <p className="text-muted-foreground text-sm mt-1">All your statutory filing deadlines in one place.</p>
      </div>

      {deadlines.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <CalendarClock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">No deadlines configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deadlines.map((d: any) => {
            const style = visualStyles[d.visualState] || visualStyles.grey;
            return (
              <div key={d.id} className={cn('rounded-xl border p-4 flex items-center gap-4', style.card)}>
                <div className="text-center min-w-[56px]">
                  <p className={cn('text-3xl font-bold leading-none', style.days)}>
                    {d.daysLeft < 0 ? 0 : d.daysLeft}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">days</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{d.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Due {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {d.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{d.notes}</p>}
                </div>
                <Badge className={cn('text-xs capitalize shrink-0', style.badge)}>
                  {d.status}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
