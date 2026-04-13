import { useNavigate } from 'react-router-dom';
import { Clock, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useVisitors } from '@/hooks/useVisitors';
import { useMemo } from 'react';

const statusStyles = {
  waiting: 'bg-warning/10 text-warning border-warning/20',
  active: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-success/10 text-success border-success/20',
  converted: 'bg-primary/10 text-primary border-primary/20',
};

const statusLabels = {
  waiting: 'Waiting',
  active: 'In Meeting',
  completed: 'Completed',
  converted: 'Converted',
};

export function RecentVisitors() {
  const navigate = useNavigate();
  const { data: allVisitors = [] } = useVisitors();

  // Filter today's visitors
  const todayVisitors = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return allVisitors
      .filter(v => {
        if (!v.checkInTime) return false;
        const checkInDate = new Date(v.checkInTime);
        if (isNaN(checkInDate.getTime())) return false;
        
        checkInDate.setHours(0, 0, 0, 0);
        return checkInDate.getTime() === today.getTime();
      })
      .sort((a, b) => {
        if (!a.checkInTime) return 1;
        if (!b.checkInTime) return -1;
        return new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime();
      })
      .slice(0, 4); // Show only 4 most recent
  }, [allVisitors]);

  const formatTime = (dateString?: string | Date | null) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleViewAll = () => {
    navigate('/visitors');
  };

  return (
    <div className="bg-card rounded-xl border shadow-card animate-slide-up">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Today's Visitors</h3>
          <p className="text-sm text-muted-foreground">Front desk activity</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-1"
          onClick={handleViewAll}
        >
          View All <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="divide-y">
        {todayVisitors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No visitors today</p>
          </div>
        ) : (
          todayVisitors.map((visitor) => (
            <div key={visitor.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{visitor.name}</p>
                    <p className="text-sm text-muted-foreground">{visitor.purpose}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(visitor.checkInTime)}
                    </div>
                  </div>
                  <Badge className={cn('capitalize', statusStyles[visitor.status as keyof typeof statusStyles] || statusStyles.waiting)}>
                    {statusLabels[visitor.status as keyof typeof statusLabels] || visitor.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
