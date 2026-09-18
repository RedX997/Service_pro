import { useClientDashboard } from '@/hooks/useClientPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle2, Clock, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  waiting_on_client: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const deadlineColors: Record<string, string> = {
  green: 'border-green-200 bg-green-50',
  amber: 'border-amber-200 bg-amber-50',
  red: 'border-red-200 bg-red-50',
  grey: 'border-slate-200 bg-slate-50',
};

const deadlineDayColors: Record<string, string> = {
  green: 'text-green-700',
  amber: 'text-amber-700',
  red: 'text-red-700',
  grey: 'text-slate-500',
};

interface Props { clientId: string; }

export default function ClientDashboard({ clientId }: Props) {
  const { data, isLoading } = useClientDashboard(clientId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Unable to load dashboard.</p>;

  const { client, profile, services, upcomingDeadlines, profileComplete } = data;

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {client?.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">{client?.company || 'Client Portal'}</p>
      </div>

      {/* Profile incomplete nudge */}
      {!profileComplete && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="text-xs text-amber-600">Add your PAN, GSTIN and entity details to unlock all features.</p>
          </div>
          <a href="/client/profile" className="text-xs font-medium text-amber-700 underline">Complete now →</a>
        </div>
      )}

      {/* Deadline Cards */}
      {upcomingDeadlines?.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Upcoming Deadlines</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {upcomingDeadlines.map((d: any) => (
              <div key={d.id} className={cn('rounded-xl border p-4', deadlineColors[d.visualState] || deadlineColors.grey)}>
                <p className="text-xs font-medium text-muted-foreground mb-1">{d.name}</p>
                <p className={cn('text-3xl font-bold', deadlineDayColors[d.visualState])}>
                  {d.daysLeft}
                  <span className="text-sm font-normal ml-1">days</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Due {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <Badge variant="outline" className="mt-2 text-xs capitalize">{d.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Service Cards */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">My Services</h2>
        {services?.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active services.</p>
            <p className="text-xs text-muted-foreground mt-1">Contact your CA to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {services?.map((s: any) => {
              const pendingTasks = s.tasks?.filter((t: any) => t.status === 'pending').length || 0;
              const rejectedTasks = s.tasks?.filter((t: any) => t.status === 'rejected').length || 0;
              return (
                <Card key={s.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold">{s.serviceName}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Updated {new Date(s.lastUpdated).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={cn('text-xs capitalize', statusColors[s.status] || statusColors.not_started)}>
                        {s.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                    <Progress value={s.progress} className="h-2 mb-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{s.progress}% complete</span>
                      <div className="flex items-center gap-3">
                        {pendingTasks > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <Clock className="h-3 w-3" /> {pendingTasks} pending
                          </span>
                        )}
                        {rejectedTasks > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="h-3 w-3" /> {rejectedTasks} rejected
                          </span>
                        )}
                        {pendingTasks === 0 && rejectedTasks === 0 && s.tasks?.length > 0 && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" /> All docs submitted
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
