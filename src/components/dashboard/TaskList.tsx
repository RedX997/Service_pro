import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

const STORAGE_KEY = 'servicepro_tasks';

const defaultTasks: Task[] = [
  { id: '1', title: 'Follow up with Sharma Industries', due: 'Today, 2:00 PM', priority: 'high', completed: false },
  { id: '2', title: 'Submit GST Returns - Batch A', due: 'Today, 5:00 PM', priority: 'high', completed: false },
  { id: '3', title: 'Review client documents - XYZ Corp', due: 'Tomorrow', priority: 'medium', completed: false },
  { id: '4', title: 'Meeting with new client - Patel Group', due: 'Tomorrow, 11:00 AM', priority: 'medium', completed: false },
  { id: '5', title: 'Update client database', due: 'Completed', priority: 'low', completed: true },
];

const priorityStyles = {
  high: 'text-redzone',
  medium: 'text-warning',
  low: 'text-muted-foreground',
};

export function TaskList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [taskStates, setTaskStates] = useState<Task[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultTasks;
  });

  // Save to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(taskStates));
  }, [taskStates]);

  const handleViewAll = () => {
    // Navigate to a tasks page or show all tasks
    toast({
      title: "Tasks View",
      description: "Opening full task list...",
    });
    // You can navigate to a dedicated tasks page when created
    // navigate('/tasks');
  };

  const toggleTaskComplete = (taskId: string) => {
    setTaskStates(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
    
    const task = taskStates.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "Task Reopened" : "Task Completed",
        description: task.title,
      });
    }
  };

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
      <div className="divide-y">
        {taskStates.map((task) => (
          <div 
            key={task.id} 
            className={cn(
              'p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors',
              task.completed && 'opacity-60'
            )}
          >
            <button 
              className="shrink-0"
              onClick={() => toggleTaskComplete(task.id)}
              aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className={cn('h-5 w-5', priorityStyles[task.priority])} />
              )}
            </button>
            <div className="flex-1 min-w-0 cursor-pointer">
              <p className={cn('font-medium', task.completed && 'line-through')}>{task.title}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                <Clock className="h-3 w-3" />
                <span>{task.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
