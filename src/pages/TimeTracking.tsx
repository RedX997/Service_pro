import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  User, 
  Briefcase, 
  TrendingUp, 
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useTimeEntries, 
  useActiveTimer, 
  useStartTimer, 
  useStopTimer,
  useUpdateTimeEntry,
  useDeleteTimeEntry
} from '@/hooks/useTimeTracking';
import { useClients } from '@/hooks/useClients';
import { availableServices } from '@/lib/data';
import { TimeEntry } from '@/types';

export default function TimeTracking() {
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [timerNotes, setTimerNotes] = useState('');
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // React Query hooks
  const { data: clients = [] } = useClients();
  const { data: timeEntries = [] } = useTimeEntries();
  const { data: activeTimer } = useActiveTimer(user?.id || '');
  const startTimerMutation = useStartTimer();
  const stopTimerMutation = useStopTimer();
  const updateEntryMutation = useUpdateTimeEntry();
  const deleteEntryMutation = useDeleteTimeEntry();

  // Timer display state
  const [displayTime, setDisplayTime] = useState('00:00:00');

  // Update display time every second when timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (activeTimer?.startTime) {
      const updateTimer = () => {
        try {
          const now = new Date();
          const startTime = new Date(activeTimer.startTime);
          
          // Validate that we have a proper date
          if (isNaN(startTime.getTime())) {
            console.error('Invalid start time:', activeTimer.startTime);
            setDisplayTime('00:00:00');
            return;
          }
          
          const elapsed = now.getTime() - startTime.getTime();
          
          // Ensure elapsed time is not negative
          if (elapsed < 0) {
            setDisplayTime('00:00:00');
            return;
          }
          
          const hours = Math.floor(elapsed / (1000 * 60 * 60));
          const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
          
          setDisplayTime(
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        } catch (error) {
          console.error('Error updating timer display:', error);
          setDisplayTime('00:00:00');
        }
      };
      
      // Update immediately
      updateTimer();
      
      // Then update every second
      interval = setInterval(updateTimer, 1000);
    } else {
      setDisplayTime('00:00:00');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer]);

  const handleStartTimer = async () => {
    if (!selectedClient || !selectedService) {
      toast({
        title: "Error",
        description: "Please select a client and service",
        variant: "destructive",
      });
      return;
    }

    try {
      await startTimerMutation.mutateAsync({
        employeeId: user?.id || '',
        clientId: selectedClient,
        serviceId: selectedService,
        notes: timerNotes,
      });
      
      toast({
        title: "Success",
        description: "Timer started successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const handleStopTimer = () => {
    setIsStopDialogOpen(true);
  };

  const confirmStopTimer = async () => {
    if (!user?.id) return;

    try {
      await stopTimerMutation.mutateAsync({
        employeeId: user.id,
        notes: timerNotes,
      });
      
      setSelectedClient('');
      setSelectedService('');
      setTimerNotes('');
      setIsStopDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Timer stopped and time entry saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setEditNotes(entry.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateEntry = async () => {
    if (!editingEntry) return;

    try {
      await updateEntryMutation.mutateAsync({
        id: editingEntry.id,
        updates: { notes: editNotes },
      });
      
      setIsEditDialogOpen(false);
      setEditingEntry(null);
      setEditNotes('');
      
      toast({
        title: "Success",
        description: "Time entry updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteEntryMutation.mutateAsync(entryId);
      
      toast({
        title: "Success",
        description: "Time entry deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Time';
    }
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const todayEntries = timeEntries.filter(entry => {
    try {
      const entryDate = new Date(entry.startTime);
      const today = new Date();
      return entryDate.toDateString() === today.toDateString();
    } catch (error) {
      console.error('Error filtering today entries:', error);
      return false;
    }
  });

  const totalBillableHours = todayEntries.reduce((total, entry) => total + (entry.duration || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Time Tracking</h1>
          <p className="text-muted-foreground">Track billable hours and productivity</p>
        </div>

        {/* Timer Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <p className="text-sm opacity-80">Current Session</p>
                    {activeTimer && (
                      <div className="h-2 w-2 bg-red-400 rounded-full animate-pulse" title="Timer Running" />
                    )}
                  </div>
                  <p className={cn(
                    "text-5xl font-bold font-mono transition-colors",
                    activeTimer ? "text-white" : "text-white/70"
                  )}>
                    {displayTime}
                  </p>
                  {activeTimer && (
                    <p className="text-sm opacity-80 mt-1">
                      Started at {formatTime(activeTimer.startTime)}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {!activeTimer ? (
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-14 w-14"
                      onClick={handleStartTimer}
                      disabled={!selectedClient || !selectedService || startTimerMutation.isPending}
                      title="Start Timer"
                    >
                      {startTimerMutation.isPending ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                      ) : (
                        <Play className="h-6 w-6" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      variant="destructive"
                      className="h-14 w-14"
                      onClick={handleStopTimer}
                      disabled={stopTimerMutation.isPending}
                      title="Stop Timer"
                    >
                      {stopTimerMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Select 
                  value={selectedClient} 
                  onValueChange={setSelectedClient}
                  disabled={!!activeTimer}
                >
                  <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                    <User className="h-4 w-4 mr-2 opacity-70" />
                    <SelectValue placeholder="Select Client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select 
                  value={selectedService} 
                  onValueChange={setSelectedService}
                  disabled={!!activeTimer}
                >
                  <SelectTrigger className="w-[200px] bg-white/10 border-white/20 text-white">
                    <Briefcase className="h-4 w-4 mr-2 opacity-70" />
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.map((service, index) => (
                      <SelectItem key={index} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Add notes (optional)"
                  value={timerNotes}
                  onChange={(e) => setTimerNotes(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  disabled={!!activeTimer}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalBillableHours)}</div>
              <p className="text-xs text-muted-foreground">
                {todayEntries.length} sessions completed
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">32h 15m</div>
              <p className="text-xs text-muted-foreground">
                +2.5h from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                Above team average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Time Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {todayEntries.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No time entries today</h3>
                <p className="text-muted-foreground">Start tracking time to see your entries here</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayEntries.map((entry) => {
                    const client = clients.find(c => c.id === entry.clientId);
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {client?.name || 'Unknown Client'}
                        </TableCell>
                        <TableCell>{entry.serviceId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {formatDuration(entry.duration || 0)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'In Progress'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {entry.notes || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditEntry(entry)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stop Timer Dialog */}
        <Dialog open={isStopDialogOpen} onOpenChange={setIsStopDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Stop Timer</DialogTitle>
              <DialogDescription>
                Add any final notes for this time entry before stopping the timer.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="stop-notes">Notes (Optional)</Label>
                <Textarea
                  id="stop-notes"
                  placeholder="What did you work on?"
                  value={timerNotes}
                  onChange={(e) => setTimerNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStopDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmStopTimer}
                disabled={stopTimerMutation.isPending}
              >
                {stopTimerMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Stop Timer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Entry Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Time Entry</DialogTitle>
              <DialogDescription>
                Update the notes for this time entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="What did you work on?"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateEntry}
                disabled={updateEntryMutation.isPending}
              >
                {updateEntryMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}