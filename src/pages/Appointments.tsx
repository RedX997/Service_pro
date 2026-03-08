import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
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
import { useState, useEffect } from 'react';
import { Plus, Clock, User, MapPin, Phone, Video, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { LocalStorage, STORAGE_KEYS } from '@/lib/storage';

// Initial appointments for first-time users
const initialAppointments = [
  { id: '1', client: 'ABC Enterprises', contact: 'Rajesh Kumar', time: '10:00 AM', duration: '1h', type: 'in-person' as const, purpose: 'GST Consultation', assignedTo: 'Ankit Sharma', date: new Date().toISOString() },
  { id: '2', client: 'XYZ Solutions', contact: 'Priya Sharma', time: '11:30 AM', duration: '30m', type: 'video' as const, purpose: 'Document Review', assignedTo: 'Priya Mehta', date: new Date().toISOString() },
  { id: '3', client: 'Patel & Associates', contact: 'Amit Patel', time: '02:00 PM', duration: '1h', type: 'phone' as const, purpose: 'Tax Planning Discussion', assignedTo: 'Rahul Verma', date: new Date().toISOString() },
  { id: '4', client: 'Global Traders', contact: 'Sunita Verma', time: '04:00 PM', duration: '45m', type: 'in-person' as const, purpose: 'Annual Audit Meeting', assignedTo: 'Kavita Reddy', date: new Date().toISOString() },
];

const employees = [
  'Ankit Sharma',
  'Priya Mehta', 
  'Rahul Verma',
  'Kavita Reddy',
  'Suresh Kumar'
];

const appointmentTypes = [
  { value: 'in-person', label: 'In Person' },
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
];

const durations = [
  '15m', '30m', '45m', '1h', '1h 30m', '2h', '2h 30m', '3h'
];

interface AppointmentForm {
  clientId: string;
  contactPerson: string;
  date: string;
  time: string;
  duration: string;
  type: 'in-person' | 'video' | 'phone';
  purpose: string;
  assignedTo: string;
  notes: string;
}

const typeConfig = {
  'in-person': { label: 'In Person', icon: MapPin, className: 'bg-accent/10 text-accent' },
  'video': { label: 'Video Call', icon: Video, className: 'bg-primary/10 text-primary' },
  'phone': { label: 'Phone Call', icon: Phone, className: 'bg-warning/10 text-warning' },
};

export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { data: clients = [] } = useClients();

  // Load appointments from localStorage on component mount
  const [appointmentsList, setAppointmentsList] = useState(() => {
    const saved = LocalStorage.get(STORAGE_KEYS.APPOINTMENTS, []);
    // If no saved appointments, use initial data
    if (saved.length === 0) {
      LocalStorage.set(STORAGE_KEYS.APPOINTMENTS, initialAppointments);
      return initialAppointments;
    }
    return saved;
  });

  // Save to localStorage whenever appointments change
  useEffect(() => {
    LocalStorage.set(STORAGE_KEYS.APPOINTMENTS, appointmentsList);
  }, [appointmentsList]);

  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    clientId: '',
    contactPerson: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '1h',
    type: 'in-person',
    purpose: '',
    assignedTo: '',
    notes: '',
  });

  const resetForm = () => {
    setAppointmentForm({
      clientId: '',
      contactPerson: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      duration: '1h',
      type: 'in-person',
      purpose: '',
      assignedTo: '',
      notes: '',
    });
  };

  const handleAddAppointment = async () => {
    // Validation
    if (!appointmentForm.clientId) {
      toast({
        title: "Error",
        description: "Please select a client",
        variant: "destructive",
      });
      return;
    }

    if (!appointmentForm.contactPerson.trim()) {
      toast({
        title: "Error",
        description: "Contact person is required",
        variant: "destructive",
      });
      return;
    }

    if (!appointmentForm.time) {
      toast({
        title: "Error",
        description: "Please select a time",
        variant: "destructive",
      });
      return;
    }

    if (!appointmentForm.purpose.trim()) {
      toast({
        title: "Error",
        description: "Purpose is required",
        variant: "destructive",
      });
      return;
    }

    if (!appointmentForm.assignedTo) {
      toast({
        title: "Error",
        description: "Please assign to an employee",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      const selectedClient = clients.find(c => c.id === appointmentForm.clientId);
      
      // Convert 24-hour time to 12-hour format for display
      const timeObj = new Date(`2000-01-01T${appointmentForm.time}`);
      const displayTime = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      const newAppointment = {
        id: Date.now().toString(),
        client: selectedClient?.name || 'Unknown Client',
        contact: appointmentForm.contactPerson.trim(),
        time: displayTime,
        duration: appointmentForm.duration,
        type: appointmentForm.type,
        purpose: appointmentForm.purpose.trim(),
        assignedTo: appointmentForm.assignedTo,
        date: appointmentForm.date, // Store as ISO string
        notes: appointmentForm.notes.trim(),
      };

      // Add to state (will automatically save to localStorage via useEffect)
      setAppointmentsList([...appointmentsList, newAppointment]);
      resetForm();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments for today
  const todayAppointments = appointmentsList.filter(appointment => {
    if (!appointment.date) return true; // Show all if no date
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  });

  const handleCancelAppointment = (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      const updated = appointmentsList.filter(apt => apt.id !== id);
      setAppointmentsList(updated);
      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });
    }
  };

  const handleReschedule = (id: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "Reschedule functionality will be available soon",
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Appointments</h1>
            <p className="text-muted-foreground">Manage meetings and schedules</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No appointments today</h3>
                  <p className="text-muted-foreground">Schedule your first appointment to get started</p>
                </div>
              ) : (
                todayAppointments.map((appointment) => {
                const TypeIcon = typeConfig[appointment.type].icon;
                return (
                  <div
                    key={appointment.id}
                    className="p-4 rounded-lg border hover:shadow-md transition-shadow animate-fade-in"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          'p-3 rounded-lg shrink-0',
                          typeConfig[appointment.type].className
                        )}>
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{appointment.client}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.purpose}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {appointment.contact}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time} ({appointment.duration})
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={cn(typeConfig[appointment.type].className)}>
                          {typeConfig[appointment.type].label}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          with {appointment.assignedTo}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment.id)}>Reschedule</Button>
                      <Button variant="outline" size="sm" onClick={() => handleCancelAppointment(appointment.id)}>Cancel</Button>
                      <Button size="sm" className="ml-auto">Start Meeting</Button>
                    </div>
                  </div>
                );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment with a client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="client">Client</Label>
              <Select
                value={appointmentForm.clientId}
                onValueChange={(value) => setAppointmentForm({ ...appointmentForm, clientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact">Contact Person</Label>
              <Input
                id="contact"
                placeholder="Enter contact person name"
                value={appointmentForm.contactPerson}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, contactPerson: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={appointmentForm.duration}
                  onValueChange={(value) => setAppointmentForm({ ...appointmentForm, duration: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type">Meeting Type</Label>
                <Select
                  value={appointmentForm.type}
                  onValueChange={(value: 'in-person' | 'video' | 'phone') => setAppointmentForm({ ...appointmentForm, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                placeholder="Enter meeting purpose"
                value={appointmentForm.purpose}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, purpose: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assign To</Label>
              <Select
                value={appointmentForm.assignedTo}
                onValueChange={(value) => setAppointmentForm({ ...appointmentForm, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee} value={employee}>
                      {employee}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAppointment} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
