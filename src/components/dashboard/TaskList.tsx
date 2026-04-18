import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { format } from 'date-fns';

const priorityStyles = {
  high: 'text-redzone',
  urgent: 'text-red-700 font-bold',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

export function TaskList({ employeeId }: { employeeId?: string }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: allTasks = [], isLoading } = useTasks();
  const updateTaskMutation = useUpdateTask();

  const tasks = useMemo(() => {
    if (employeeId) {
      return allTasks.filter(task => task.assignedTo === employeeId);
    }
    return allTasks;
  }, [allTasks, employeeId]);

  const handleViewAll = () => {
    navigate('/tasks');
  };

  const toggleTaskComplete = async (taskId: string, currentStatus: string, title: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    
    try {
      await updateTaskMutation.mutateAsync({
        id: taskId,
        updates: { status: newStatus }
      });
      
      toast({
        title: newStatus === 'completed' ? "Task Completed" : "Task Reopened",
        description: title,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive"
      });
    }
  };

  const displayTasks = tasks.slice(0, 5); // Show top 5 tasks

  return (
    <div className="bg-card rounded-xl border shadow-card animate-slide-up">
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Today's Tasks</h3>
          <p className="text-sm text-muted-foreground">Your to-do list & reminders</p>
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
      <div className="divide-y relative min-h-[100px]">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground italic">
            No tasks found.
          </div>
        ) : (
          displayTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            return (
              <div 
                key={task.id} 
                className={cn(
                  'p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors',
                  isCompleted && 'opacity-60'
                )}
              >
                <button 
                  className="shrink-0"
                  onClick={() => toggleTaskComplete(task.id, task.status, task.title)}
                  disabled={updateTaskMutation.isPending}
                  aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className={cn('h-5 w-5', priorityStyles[task.priority as keyof typeof priorityStyles] || priorityStyles.low)} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('font-medium', isCompleted && 'line-through')}>{task.title}</p>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, h:mm a') : 'No due date'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
