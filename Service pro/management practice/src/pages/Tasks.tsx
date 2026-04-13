import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/hooks/useEmployees';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Search, Filter, Calendar, Clock, ChevronRight, AlertCircle, CheckCircle2, MoreHorizontal, CircleDashed } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays } from 'date-fns';
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  assignee?: {
    id: string;
    name: string;
    email?: string;
    avatarUrl?: string;
  };
}

export default function Tasks() {
  const { user } = useAuth();
  const { data: employees = [] } = useEmployees();

  const currentEmployee = useMemo(() => {
    return employees.find(e => e.email === user?.email);
  }, [employees, user]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: ''
  });

  const isActuallyLoading = loading || (user?.role === 'employee' && !currentEmployee && employees.length === 0);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiClient.post<Task[]>('/tasks/list');
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const dueDateTime = newTask.dueDate && newTask.dueTime
        ? new Date(`${newTask.dueDate}T${newTask.dueTime}`)
        : newTask.dueDate
        ? new Date(newTask.dueDate)
        : null;

      await apiClient.post('/tasks', {
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        dueDate: dueDateTime?.toISOString(),
        assignedTo: currentEmployee?.id || 'unassigned' // Auto-assign to self if employee
      });

      toast.success('Task added successfully');
      setIsAddDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', dueTime: '' });
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Error adding task');
    }
  };

  const handleChangeStatus = async (taskId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/tasks/${taskId}`, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : null
      });

      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined }
          : task
      ));
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysText = (dateString?: string) => {
    if (!dateString) return '';
    const due = parseISO(dateString);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);
    const diff = differenceInDays(dueDay, today);
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
    if (diff > 1) return `in ${diff} days`;
    return `${Math.abs(diff)} days ago`;
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'completed') return false;
    if (!task.dueDate) return false;
    const dueDay = new Date(task.dueDate);
    dueDay.setHours(0, 0, 0, 0);
    return dueDay < today;
  };



  const displayTasks = useMemo(() => {
    return tasks.filter(t => {
      // Role-based filtering for employees
      if (user?.role === 'employee') {
        // Match by email if possible, fallback to ID check if we have currentEmployee
        const assigneeEmail = t.assignee?.email;
        if (assigneeEmail && user?.email) {
          if (assigneeEmail.toLowerCase() !== user.email.toLowerCase()) return false;
        } else if (currentEmployee && t.assignee?.id) {
          if (t.assignee.id !== currentEmployee.id) return false;
        } else {
          // If we can't verify ownership, hide it from employee
          return false;
        }
      }
      
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, user, currentEmployee]);

  const overdueTasks = displayTasks.filter(t => isOverdue(t));
  const pendingTasks = displayTasks.filter(t => t.status === 'pending' && !isOverdue(t));
  const inProgressTasks = displayTasks.filter(t => t.status === 'in_progress' && !isOverdue(t));
  const completedTasks = displayTasks.filter(t => t.status === 'completed');

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-slate-900 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-slate-900 text-white';
    }
  };

  const renderTaskCard = (task: Task, isOverdueCol: boolean = false) => (
    <div key={task.id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
       <button 
          onClick={() => handleDeleteTask(task.id)}
          className="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 p-1.5 rounded-md hover:bg-red-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        
      <div className="flex justify-between items-start mb-2 pr-8">
        <h4 className="font-semibold text-slate-900 leading-snug">{task.title}</h4>
        {!isOverdueCol && task.status === 'pending' && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium border text-slate-600 bg-white ml-2 flex-shrink-0">
            Pending
          </span>
        )}
        {!isOverdueCol && task.status === 'in_progress' && (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium text-white bg-slate-900 ml-2 flex-shrink-0">
            In Progress
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="text-sm text-slate-500 mb-4 line-clamp-2">{task.description}</p>
      )}
      
      <div className="flex items-center justify-between mb-4 mt-auto">
        <div className="flex items-center text-xs text-slate-500 font-medium">
          {task.dueDate && (
            <>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{format(parseISO(task.dueDate), 'M/d/yyyy')}</span>
              <Clock className="h-3 w-3 ml-2 mr-1" />
              <span>{getDaysText(task.dueDate)}</span>
            </>
          )}
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide capitalize ${getPriorityBadge(task.priority)}`}>
          {task.priority}
        </span>
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center text-xs text-slate-500">
          <span className="mr-1.5">Assigned to:</span>
          <div className="flex items-center gap-2 px-2 py-1 rounded-full border bg-white font-medium text-slate-700 shadow-sm">
            <Avatar className="h-5 w-5">
              <AvatarImage src={getAvatarUrl(task.assignee?.avatarUrl)} className="object-cover" />
              <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                {task.assignee?.name ? task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
              </AvatarFallback>
            </Avatar>
            <span>{task.assignee?.name || 'Unassigned'}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-slate-400 hover:text-slate-600 outline-none">
              <ChevronRight className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'pending')}>
              Mark as Pending
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'in_progress')}>
              Mark as In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleChangeStatus(task.id, 'completed')}>
              Mark as Completed
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-slate-50/50 -m-8 p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
              <p className="text-sm text-slate-500 mt-1">Manage and track your tasks</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    rows={3}
                  />
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                    <Input
                      type="time"
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask({ ...newTask, dueTime: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddTask}>
                      Add Task
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6 overflow-hidden">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search tasks..." 
                  className="pl-9 bg-slate-50/50 border-slate-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-slate-50/50 border-slate-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-[150px] bg-slate-50/50 border-slate-200">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="shrink-0 bg-slate-50/50 border-slate-200 text-slate-600 hidden sm:flex">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Kanban Columns */}
            {isActuallyLoading ? (
               <div className="py-12 text-center text-slate-500">Loading tasks...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Overdue Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <h3 className="font-semibold text-slate-900">Overdue</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-white ml-auto">
                        {overdueTasks.length}
                    </span>
                    </div>
                    {overdueTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                        No overdue tasks
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {overdueTasks.map(t => renderTaskCard(t, true))}
                    </div>
                    )}
                </div>

                {/* Pending Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                    <CircleDashed className="h-4 w-4 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">Pending</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-white ml-auto">
                        {pendingTasks.length}
                    </span>
                    </div>
                    {pendingTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                        No pending tasks
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {pendingTasks.map(t => renderTaskCard(t))}
                    </div>
                    )}
                </div>

                {/* In Progress Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                    <MoreHorizontal className="h-4 w-4 text-slate-600" />
                    <h3 className="font-semibold text-slate-900">In Progress</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-white ml-auto">
                        {inProgressTasks.length}
                    </span>
                    </div>
                    {inProgressTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                        No active tasks
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {inProgressTasks.map(t => renderTaskCard(t))}
                    </div>
                    )}
                </div>

                {/* Completed Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 px-1">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <h3 className="font-semibold text-slate-900">Completed</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium border bg-white ml-auto">
                        {completedTasks.length}
                    </span>
                    </div>
                    {completedTasks.length === 0 ? (
                    <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                        No completed tasks
                    </div>
                    ) : (
                    <div className="space-y-4">
                        {completedTasks.map(t => renderTaskCard(t))}
                    </div>
                    )}
                </div>

                </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
