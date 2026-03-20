import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  UserPlus,
  UserMinus,
  LogIn,
  LogOut,
  Edit,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  MessageSquare,
  FileText,
  Trash2,
  Calendar,
  Clock,
  User,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientActivitySheetProps {
  clientId: string;
  clientName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  metadata: any;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: {
      role_name: string;
    };
  };
}

interface ActivityResponse {
  activities: ActivityLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Action icon mapping
const getActionIcon = (action: string) => {
  switch (action) {
    case 'CLIENT_CREATED':
      return <UserPlus className="h-4 w-4" />;
    case 'EMPLOYEE_ASSIGNED':
      return <UserPlus className="h-4 w-4" />;
    case 'EMPLOYEE_UNASSIGNED':
      return <UserMinus className="h-4 w-4" />;
    case 'VISITOR_ENTERED':
      return <LogIn className="h-4 w-4" />;
    case 'VISITOR_EXITED':
      return <LogOut className="h-4 w-4" />;
    case 'CLIENT_UPDATED':
      return <Edit className="h-4 w-4" />;
    case 'STATUS_CHANGED':
      return <CheckCircle className="h-4 w-4" />;
    case 'SERVICE_ADDED':
      return <Plus className="h-4 w-4" />;
    case 'SERVICE_REMOVED':
      return <Minus className="h-4 w-4" />;
    case 'MESSAGE_SENT':
      return <MessageSquare className="h-4 w-4" />;
    case 'DOCUMENT_UPLOADED':
      return <FileText className="h-4 w-4" />;
    case 'CLIENT_DELETED':
      return <Trash2 className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

// Action color mapping
const getActionColor = (action: string) => {
  switch (action) {
    case 'CLIENT_CREATED':
    case 'EMPLOYEE_ASSIGNED':
    case 'VISITOR_ENTERED':
    case 'SERVICE_ADDED':
      return 'border-l-green-500';
    case 'CLIENT_UPDATED':
    case 'STATUS_CHANGED':
      return 'border-l-amber-500';
    case 'EMPLOYEE_UNASSIGNED':
    case 'VISITOR_EXITED':
    case 'SERVICE_REMOVED':
    case 'CLIENT_DELETED':
      return 'border-l-red-500';
    case 'MESSAGE_SENT':
    case 'DOCUMENT_UPLOADED':
      return 'border-l-blue-500';
    default:
      return 'border-l-gray-500';
  }
};

// Fetch client activity
const fetchClientActivity = async (clientId: string, page: number = 1): Promise<ActivityResponse> => {
  const response = await fetch(`http://localhost:3000/api/clients/${clientId}/activity?page=${page}&limit=50`);
  if (!response.ok) {
    throw new Error('Failed to fetch client activity');
  }
  return response.json();
};

export function ClientActivitySheet({ clientId, clientName, open, onOpenChange }: ClientActivitySheetProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [page, setPage] = useState(1);

  // Fetch activity data
  const { data, isLoading, error } = useQuery({
    queryKey: ['client-activity', clientId, page],
    queryFn: () => fetchClientActivity(clientId, page),
    enabled: open && !!clientId,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (!data?.activities) return [];

    return data.activities.filter((activity) => {
      // Search filter
      const matchesSearch = !searchTerm || 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory = filterCategory === 'all' || (() => {
        switch (filterCategory) {
          case 'visitor':
            return activity.action === 'VISITOR_ENTERED' || activity.action === 'VISITOR_EXITED';
          case 'assignments':
            return activity.action === 'EMPLOYEE_ASSIGNED' || activity.action === 'EMPLOYEE_UNASSIGNED';
          case 'status':
            return activity.action === 'STATUS_CHANGED';
          case 'updates':
            return activity.action === 'CLIENT_UPDATED' || activity.action === 'SERVICE_ADDED' || activity.action === 'SERVICE_REMOVED';
          default:
            return true;
        }
      })();

      return matchesSearch && matchesCategory;
    });
  }, [data?.activities, searchTerm, filterCategory]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (!data?.activities) return null;

    const visitorActivities = data.activities.filter(a => 
      a.action === 'VISITOR_ENTERED' || a.action === 'VISITOR_EXITED'
    );
    
    const visitorEntered = data.activities.filter(a => a.action === 'VISITOR_ENTERED');
    const lastVisit = visitorEntered.length > 0 ? visitorEntered[0].createdAt : null;
    
    // Calculate total time spent (sum of all visitor durations)
    const totalMinutes = data.activities
      .filter(a => a.action === 'VISITOR_EXITED' && a.metadata?.duration)
      .reduce((sum, a) => sum + (a.metadata.duration || 0), 0);
    
    const createdActivity = data.activities.find(a => a.action === 'CLIENT_CREATED');
    const daysSinceCreated = createdActivity 
      ? Math.floor((Date.now() - new Date(createdActivity.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      totalVisits: visitorEntered.length,
      lastVisit,
      totalTimeSpent: totalMinutes,
      daysSinceCreated,
    };
  }, [data?.activities]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client Activity History</SheetTitle>
          <SheetDescription>
            Complete timeline for {clientName}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Cards */}
          {summaryStats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Total Visits</span>
                </div>
                <p className="text-2xl font-bold">{summaryStats.totalVisits}</p>
              </div>
              
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Last Visit</span>
                </div>
                <p className="text-sm font-medium">
                  {summaryStats.lastVisit 
                    ? formatDistanceToNow(new Date(summaryStats.lastVisit), { addSuffix: true })
                    : 'Never'}
                </p>
              </div>
              
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Total Time</span>
                </div>
                <p className="text-sm font-medium">
                  {Math.floor(summaryStats.totalTimeSpent / 60)}h {summaryStats.totalTimeSpent % 60}m
                </p>
              </div>
              
              <div className="p-4 bg-card border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Client Age</span>
                </div>
                <p className="text-sm font-medium">{summaryStats.daysSinceCreated} days</p>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Filter by Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="visitor">Visitor Activity</SelectItem>
                  <SelectItem value="assignments">Assignments</SelectItem>
                  <SelectItem value="status">Status Changes</SelectItem>
                  <SelectItem value="updates">Updates</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Search</Label>
              <Input
                placeholder="Search in descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold">Activity Timeline</h3>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                <p>Failed to load activity history</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No activity found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "p-4 border-l-4 bg-card rounded-lg",
                      getActionColor(activity.action)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-2 bg-muted rounded-full">
                        {getActionIcon(activity.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{activity.description}</p>
                        
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{activity.user.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.user.role.role_name}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{format(new Date(activity.createdAt), 'dd MMM yyyy HH:mm a')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
