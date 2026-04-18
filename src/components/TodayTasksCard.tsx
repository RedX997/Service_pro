import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Clock, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  completedAt?: string;
  createdAt?: string;
}

export function TodayTasksCard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    dueTime: ''
  });

  console.log('TodayTasksCard - API_URL:', API_URL);

  useEffect(() => {
    fetchRecentTasks();
  }, []);

  const fetchRecentTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        // Sort by most recently created and grab the top 2
        const sortedData = data.sort((a: Task, b: Task) => {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        });
        setTasks(sortedData.slice(0, 2));
      } else {
        toast.error('Failed to load tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Error loading tasks');
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

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: dueDateTime?.toISOString(),
          assignedTo: 'current-user-id' // TODO: Get from auth context
        })
      });

      if (response.ok) {
        toast.success('Task added successfully');
        setIsAddDialogOpen(false);
        setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', dueTime: '' });
        fetchRecentTasks();
      } else {
        toast.error('Failed to add task');
      }
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Error adding task');
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : null
        })
      });

      if (response.ok) {
        setTasks(tasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined }
            : task
        ));
        toast.success(newStatus === 'completed' ? 'Task completed!' : 'Task reopened');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const getTaskColor = (task: Task) => {
    if (task.status === 'completed') return 'text-green-600';
    if (!task.dueDate) return 'text-gray-600';

    const dueDate = parseISO(task.dueDate);
    const now = new Date();

    if (dueDate < now) return 'text-red-600'; // Overdue
    if (isToday(dueDate)) return 'text-orange-600'; // Due today
    return 'text-yellow-600'; // Upcoming
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    const date = parseISO(dateString);
    if (isToday(date)) return `Today, ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow, ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-card rounded-xl border shadow-card animate-slide-up">
      <div className="p-6 pb-4 flex flex-row items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-foreground">My Tasks</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Your upcoming tasks</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tasks')}
          className="text-sm font-medium text-foreground hover:bg-transparent"
        >
          View All
        </Button>
      </div>
      <div className="px-4 pb-4">
        <div className="border rounded-xl p-4 shadow-sm bg-card">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold text-foreground leading-tight">Tasks & Reminders</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Your upcoming tasks and reminders</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tasks')}
              className="text-xs font-medium text-foreground hover:bg-muted h-8 px-2"
            >
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No recent tasks
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 rounded-xl border hover:bg-muted/50 transition-colors bg-card shadow-sm"
                  >
                    <button
                      onClick={() => handleToggleComplete(task.id, task.status)}
                      className={`mt-0.5 flex items-center justify-center h-5 w-5 rounded-full border flex-shrink-0 transition-colors ${
                        task.status === 'completed' 
                          ? 'bg-blue-50 text-blue-600 border-blue-200' 
                          : 'bg-card text-transparent border-input hover:border-gray-400'
                      }`}
                    >
                       <Check className="h-3 w-3" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold text-foreground ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <div className="flex items-center text-xs font-medium text-muted-foreground gap-1">
                          <Clock className="h-3 w-3 opacity-70" />
                          {formatDueDate(task.dueDate)}
                        </div>
                        {task.priority === 'high' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-50 text-red-700 border border-red-100">
                            High
                          </span>
                        )}
                        {task.priority === 'urgent' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-800 border border-red-200">
                            Urgent
                          </span>
                        )}
                        {task.status === 'pending' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-100">
                            Pending
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mt-2">
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
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
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
        </div>
      </div>
    </div>
  );
}
