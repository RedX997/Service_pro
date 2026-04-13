import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Circle, 
  PlayCircle,
  XCircle,
  Calendar,
  Briefcase,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmployeeTasks, useTaskStats } from '@/hooks/useTasks';
import { useClients } from '@/hooks/useClients';
import { Employee } from '@/types';

interface WorkloadDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
  low: { label: 'Low', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-800 border-red-200' },
};

const statusConfig = {
  pending: { label: 'Pending', icon: Circle, className: 'text-gray-500' },
  in_progress: { label: 'In Progress', icon: PlayCircle, className: 'text-blue-500' },
  completed: { label: 'Completed', icon: CheckCircle, className: 'text-green-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, className: 'text-red-500' },
};

export function WorkloadDialog({ employee, open, onOpenChange }: WorkloadDialogProps) {
  const { data: tasks = [], isLoading: tasksLoading } = useEmployeeTasks(employee?.id || '');
  const { data: taskStats, isLoading: statsLoading } = useTaskStats(employee?.id || '');
  const { data: clients = [] } = useClients();

  if (!employee) return null;

  // Calculate client load
  const clientLoad = clients.filter(client => client.assignedEmployee === employee.id).length;
  const maxLoad = 8; // Default max load

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    new Date(task.dueDate) < new Date() && 
    task.status !== 'completed'
  ).length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;

  // Group tasks by status
  const tasksByStatus = {
    pending: tasks.filter(task => task.status === 'pending'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    completed: tasks.filter(task => task.status === 'completed'),
    cancelled: tasks.filter(task => task.status === 'cancelled'),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {employee.name} - Workload Overview
          </DialogTitle>
          <DialogDescription>
            Detailed view of {employee.name}'s current workload, tasks, and client assignments.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Client Load</span>
                </div>
                <div className="mt-2">
                  <div className="text-2xl font-bold">{clientLoad}/{maxLoad}</div>
                  <Progress 
                    value={(clientLoad / maxLoad) * 100} 
                    className="mt-2 h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Tasks</span>
                </div>
                <div className="text-2xl font-bold mt-2">{totalTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Completed</span>
                </div>
                <div className="text-2xl font-bold mt-2">{completedTasks}</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Overdue</span>
                </div>
                <div className="text-2xl font-bold mt-2">{overdueTasks}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All ({totalTasks})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({tasksByStatus.pending.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({tasksByStatus.in_progress.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({tasksByStatus.completed.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({tasksByStatus.cancelled.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <TaskList tasks={tasks} isLoading={tasksLoading} />
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <TaskList tasks={tasksByStatus.pending} isLoading={tasksLoading} />
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              <TaskList tasks={tasksByStatus.in_progress} isLoading={tasksLoading} />
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              <TaskList tasks={tasksByStatus.completed} isLoading={tasksLoading} />
            </TabsContent>

            <TabsContent value="cancelled" className="space-y-4">
              <TaskList tasks={tasksByStatus.cancelled} isLoading={tasksLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface TaskListProps {
  tasks: any[];
  isLoading: boolean;
}

function TaskList({ tasks, isLoading }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Circle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const StatusIcon = statusConfig[task.status as keyof typeof statusConfig]?.icon || Circle;
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
        
        return (
          <Card key={task.id} className={cn(
            "transition-colors",
            isOverdue && "border-red-200 bg-red-50"
          )}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={cn("h-4 w-4", statusConfig[task.status as keyof typeof statusConfig]?.className)} />
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge className={priorityConfig[task.priority as keyof typeof priorityConfig]?.className}>
                      {priorityConfig[task.priority as keyof typeof priorityConfig]?.label}
                    </Badge>
                    {isOverdue && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {task.client && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {task.client.name}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}