import { useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, MessageSquare, Package, ArrowRight, UserX, UserCheck, RefreshCw, Settings, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useGlobalActivity } from '@/hooks/useClients';
import { formatDistanceToNow } from 'date-fns';

const iconMap: Record<string, any> = {
  CLIENT_CREATED: UserPlus,
  CLIENT_UPDATED: Settings,
  STATUS_CHANGED: RefreshCw,
  EMPLOYEE_ASSIGNED: UserCheck,
  EMPLOYEE_UNASSIGNED: UserX,
  SERVICE_ADDED: Package,
  SERVICE_REMOVED: UserX,
  CLIENT_DELETED: AlertCircle,
  TASK_COMPLETED: CheckCircle2,
  MESSAGE_SENT: MessageSquare,
};

const colorMap: Record<string, string> = {
  CLIENT_CREATED: 'text-blue-600',
  CLIENT_UPDATED: 'text-slate-600',
  STATUS_CHANGED: 'text-orange-500',
  EMPLOYEE_ASSIGNED: 'text-green-600',
  EMPLOYEE_UNASSIGNED: 'text-red-500',
  SERVICE_ADDED: 'text-purple-600',
  SERVICE_REMOVED: 'text-red-500',
  CLIENT_DELETED: 'text-red-600',
  TASK_COMPLETED: 'text-emerald-600',
  MESSAGE_SENT: 'text-blue-500',
};

const bgMap: Record<string, string> = {
  CLIENT_CREATED: 'bg-blue-100',
  CLIENT_UPDATED: 'bg-slate-100',
  STATUS_CHANGED: 'bg-orange-100',
  EMPLOYEE_ASSIGNED: 'bg-green-100',
  EMPLOYEE_UNASSIGNED: 'bg-red-100',
  SERVICE_ADDED: 'bg-purple-100',
  SERVICE_REMOVED: 'bg-red-100',
  CLIENT_DELETED: 'bg-red-100',
  TASK_COMPLETED: 'bg-emerald-100',
  MESSAGE_SENT: 'bg-blue-100',
};

export function RecentActivities() {
  const navigate = useNavigate();
  const { data: activities = [], isLoading } = useGlobalActivity(5);

  return (
    <div className="bg-white rounded-xl border shadow-sm animate-slide-up">
      <div className="p-6 pb-4">
        <h3 className="font-semibold text-lg text-gray-900">Recent Activities</h3>
        <p className="text-sm text-gray-500 mt-0.5">Latest system activities</p>
      </div>
      <div className="px-4 pb-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm italic">
            No recent activity recorded
          </div>
        ) : (
          activities.map((activity) => {
            const Icon = iconMap[activity.action] || Settings;
            const colorClass = colorMap[activity.action] || 'text-slate-600';
            const bgClass = bgMap[activity.action] || 'bg-slate-100';
            
            return (
              <div key={activity.id} className="flex items-start gap-4 p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                <div className={cn("p-2 rounded-full flex-shrink-0 mt-0.5", bgClass)}>
                  <Icon className={cn("h-4 w-4", colorClass)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 whitespace-pre-wrap">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">{activity.user?.name}</span>
                    <span>•</span>
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div className="pt-4 text-center pb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
            onClick={() => navigate('/activities')}
          >
            View All Activities <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
