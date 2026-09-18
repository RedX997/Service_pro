import { useState } from 'react';
import { useClientServices } from '@/hooks/useClientPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Upload, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const statusColors: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  in_progress: 'bg-blue-100 text-blue-700',
  waiting_on_client: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

const taskStatusIcon: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  uploaded: <CheckCircle2 className="h-4 w-4 text-blue-500" />,
  approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

interface Props { clientId: string; }

export default function ClientServices({ clientId }: Props) {
  const { data: services = [], isLoading, refetch } = useClientServices(clientId);
  const [expanded, setExpanded] = useState<string | null>(null);

  const handleUpload = async (taskId: string, file: File) => {
    // In production: upload to S3/Cloudflare R2, get URL, then PATCH task
    const fakeUrl = `https://storage.example.com/${taskId}/${file.name}`;
    await fetch(`${API_URL}/client-portal/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'uploaded', fileUrl: fakeUrl }),
    });
    refetch();
  };

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">My Services</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your compliance services and upload required documents.</p>
      </div>

      {services.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No active services. Contact your CA to get started.</p>
        </div>
      ) : (
        services.map((s: any) => (
          <Card key={s.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base">{s.serviceName}</CardTitle>
                  <Badge className={cn('text-xs capitalize', statusColors[s.status] || statusColors.not_started)}>
                    {s.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground">{s.progress}% complete</p>
                    <Progress value={s.progress} className="h-1.5 w-24 mt-1" />
                  </div>
                  {expanded === s.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </div>
              <Progress value={s.progress} className="h-1.5 mt-2 sm:hidden" />
            </CardHeader>

            {expanded === s.id && (
              <CardContent className="pt-0 pb-4">
                {s.tasks?.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">No documents required yet.</p>
                ) : (
                  <div className="space-y-3 mt-2">
                    {s.tasks.map((task: any) => (
                      <div key={task.id} className={cn(
                        'flex items-start gap-3 p-3 rounded-lg border',
                        task.status === 'rejected' ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
                      )}>
                        <div className="mt-0.5">{taskStatusIcon[task.status] || taskStatusIcon.pending}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{task.name}</p>
                          {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                          {task.status === 'rejected' && task.rejectedReason && (
                            <div className="flex items-start gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                              <p className="text-xs text-red-600">{task.rejectedReason}</p>
                            </div>
                          )}
                          {task.fileUrl && task.status !== 'rejected' && (
                            <a href={task.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline mt-1 block">
                              View uploaded file
                            </a>
                          )}
                        </div>
                        {(task.status === 'pending' || task.status === 'rejected') && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                              onChange={e => e.target.files?.[0] && handleUpload(task.id, e.target.files[0])}
                            />
                            <Button size="sm" variant="outline" className="gap-1.5 pointer-events-none">
                              <Upload className="h-3.5 w-3.5" />
                              {task.status === 'rejected' ? 'Re-upload' : 'Upload'}
                            </Button>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
