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
import { useAppointments } from '@/hooks/useAppointments';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const appointmentTypes = [
  { value: 'in-person', label: 'In Person' },
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
];

const durations = [
  '15m', '30m', '45m', '1h', '1h 30m', '2h', '2h 30m', '3h'
];

type AppointmentStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

interface AppointmentForm {
  clientId: string;
  contactPerson: string;
  date: string;
  time: string;
  duration: string;
  type: 'in-person' | 'video' | 'phone';
  purpose: string;
  employeeId: string;
  notes: string;
  meetingLink?: string;
  location?: string;
  phoneNumber?: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
}

interface Client {
  id: string;
  name: string;
  company?: string;
}

const typeConfig = {
  'in-person': { label: 'In Person', icon: MapPin, className: 'bg-accent/10 text-accent' },
  'video': { label: 'Video Call', icon: Video, className: 'bg-primary/10 text-primary' },
  'phone': { label: 'Phone Call', icon: Phone, className: 'bg-warning/10 text-warning' },
};

const statusConfig = {
  'scheduled': { label: 'Scheduled', className: 'bg-blue-100 text-blue-800' },
  'in-progress': { label: 'In Progress', className: 'bg-yellow-100 text-yellow-800' },
  'completed': { label: 'Completed', className: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
};

// Appointments page - uses real API data
export default function Appointments() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const { toast } = useToast();
  
  // Use the appointments hook
  const {
    appointments,
    loading: appointmentsLoading,
    createAppointment,
    updateAppointment,
    cancelAppointment: cancelAppointmentAPI,
    startAppointment,
    completeAppointment: completeAppointmentAPI,
  } = useAppointments();

  // Fetch employees and clients directly from API (not mock service)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, clientRes] = await Promise.all([
          fetch(`${API_URL}/employees`),
          fetch(`${API_URL}/clients`),
        ]);
        if (empRes.ok) setEmployees(await empRes.json());
        if (clientRes.ok) setClients(await clientRes.json());
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>({
    clientId: '',
    contactPerson: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    duration: '1h',
    type: 'in-person',
    purpose: '',
    employeeId: '',
    notes: '',
    meetingLink: '',
    location: '',
    phoneNumber: '',
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
      employeeId: '',
      notes: '',
      meetingLink: '',
      location: '',
      phoneNumber: '',
    });
  };

  const checkConflict = (date: string, time: string, duration: string, employeeId: string, excludeId?: string) => {
    const newStart = new Date(`${date}T${time}`);
    const durationMinutes = parseDuration(duration);
    const newEnd = new Date(newStart.getTime() + durationMinutes * 60000);

    return appointments.some(apt => {
      if (apt.id === excludeId) return false; // Skip current appointment when rescheduling
      if (apt.employeeId !== employeeId) return false; // Only check same employee
      
      const aptDate = new Date(apt.date).toISOString().split('T')[0];
      if (aptDate !== date) return false; // Only check same date
      if (apt.status === 'cancelled') return false; // Skip cancelled appointments

      const aptStart = new Date(`${aptDate}T${apt.time}`);
      const aptDurationMinutes = parseDuration(apt.duration);
      const aptEnd = new Date(aptStart.getTime() + aptDurationMinutes * 60000);

      // Check if times overlap
      return (newStart < aptEnd && newEnd > aptStart);
    });
  };

  const parseDuration = (duration: string): number => {
    const match = duration.match(/(\d+)h?\s*(\d+)?m?/);
    if (!match) return 60; // Default 1 hour
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    return hours * 60 + minutes;
  };

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const handleAddAppointment = async () => {
    console.log('🔍 handleAddAppointment called');
    console.log('Form data:', appointmentForm);
    
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

    if (!appointmentForm.employeeId) {
      toast({
        title: "Error",
        description: "Please assign to an employee",
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts
    if (checkConflict(appointmentForm.date, appointmentForm.time, appointmentForm.duration, appointmentForm.employeeId)) {
      const employee = employees.find(e => e.id === appointmentForm.employeeId);
      toast({
        title: "Scheduling Conflict",
        description: `${employee?.name || 'Employee'} already has an appointment at this time`,
        variant: "destructive",
      });
      return;
    }

    const appointmentData = {
      clientId: appointmentForm.clientId,
      employeeId: appointmentForm.employeeId,
      contactPerson: appointmentForm.contactPerson.trim(),
      date: appointmentForm.date,
      time: appointmentForm.time,
      duration: appointmentForm.duration,
      type: appointmentForm.type,
      purpose: appointmentForm.purpose.trim(),
      notes: appointmentForm.notes.trim() || undefined,
      meetingLink: appointmentForm.meetingLink?.trim() || undefined,
      location: appointmentForm.location?.trim() || undefined,
      phoneNumber: appointmentForm.phoneNumber?.trim() || undefined,
    };

    console.log('📤 Sending appointment data:', appointmentData);
    console.log('API URL:', import.meta.env.VITE_API_BASE_URL);

    try {
      const result = await createAppointment(appointmentData);
      console.log('✅ Appointment created:', result);

      resetForm();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('❌ Error creating appointment:', error);
      // Error already handled by hook
    }
  };

  // Build sets of dates that have active (non-done) vs all-done appointments
  const datesWithActiveAppointments = new Set<string>();
  const datesWithAllDoneAppointments = new Set<string>();

  appointments.forEach(apt => {
    const key = new Date(apt.date).toDateString();
    if (apt.status === 'cancelled' || apt.status === 'completed') {
      // Only add to all-done set if no active appointment exists for that day
      if (!datesWithActiveAppointments.has(key)) {
        datesWithAllDoneAppointments.add(key);
      }
    } else {
      // Active appointment — remove from all-done set if it was there
      datesWithAllDoneAppointments.delete(key);
      datesWithActiveAppointments.add(key);
    }
  });

  const activeDays = appointments
    .filter(apt => apt.status !== 'cancelled' && apt.status !== 'completed')
    .map(apt => new Date(apt.date));

  const doneDays = [...datesWithAllDoneAppointments].map(d => new Date(d));
  const selectedDate = date || new Date();
  const selectedDateAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate.toDateString() === selectedDate.toDateString();
  });

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateLabel = isToday
    ? "Today's Schedule"
    : selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleCancelAppointment = async (id: string) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointmentAPI(id);
      } catch (error) {
        // Error already handled by hook
      }
    }
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    
    // Pre-fill form with appointment data
    const appointmentDate = new Date(appointment.date).toISOString().split('T')[0];
    setAppointmentForm({
      clientId: appointment.clientId,
      contactPerson: appointment.contactPerson,
      date: appointmentDate,
      time: appointment.time,
      duration: appointment.duration,
      type: appointment.type,
      purpose: appointment.purpose,
      employeeId: appointment.employeeId,
      notes: appointment.notes || '',
      meetingLink: appointment.meetingLink || '',
      location: appointment.location || '',
      phoneNumber: appointment.phoneNumber || '',
    });
    
    setIsRescheduleDialogOpen(true);
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    // Validation (same as add)
    if (!appointmentForm.clientId || !appointmentForm.contactPerson.trim() || 
        !appointmentForm.time || !appointmentForm.purpose.trim() || !appointmentForm.employeeId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check for conflicts (exclude current appointment)
    if (checkConflict(appointmentForm.date, appointmentForm.time, appointmentForm.duration, 
                      appointmentForm.employeeId, selectedAppointment.id)) {
      const employee = employees.find(e => e.id === appointmentForm.employeeId);
      toast({
        title: "Scheduling Conflict",
        description: `${employee?.name || 'Employee'} already has an appointment at this time`,
        variant: "destructive",
      });
      return;
    }

    try {
      await updateAppointment(selectedAppointment.id, {
        clientId: appointmentForm.clientId,
        employeeId: appointmentForm.employeeId,
        contactPerson: appointmentForm.contactPerson.trim(),
        date: appointmentForm.date,
        time: appointmentForm.time,
        duration: appointmentForm.duration,
        type: appointmentForm.type,
        purpose: appointmentForm.purpose.trim(),
        notes: appointmentForm.notes.trim() || undefined,
        meetingLink: appointmentForm.meetingLink?.trim() || undefined,
        location: appointmentForm.location?.trim() || undefined,
        phoneNumber: appointmentForm.phoneNumber?.trim() || undefined,
      });

      resetForm();
      setIsRescheduleDialogOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleStartMeeting = async (appointment: any) => {
    try {
      // Update status to in-progress
      await startAppointment(appointment.id);

      // Handle different meeting types
      if (appointment.type === 'video') {
        const link = appointment.meetingLink || 'https://meet.google.com/new';
        window.open(link, '_blank');
        toast({
          title: "Video Call Started",
          description: "Opening video call in new tab",
        });
      } else if (appointment.type === 'phone') {
        const phone = appointment.phoneNumber || appointment.contactPerson;
        toast({
          title: "Phone Call",
          description: `Call: ${phone}`,
          duration: 5000,
        });
      } else {
        const location = appointment.location || 'Office';
        toast({
          title: "In-Person Meeting",
          description: `Location: ${location}`,
          duration: 5000,
        });
      }
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleCompleteAppointment = async (id: string) => {
    try {
      await completeAppointmentAPI(id);
    } catch (error) {
      // Error already handled by hook
    }
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
                modifiers={{
                  hasActive: activeDays,
                  allDone: doneDays,
                }}
                modifiersClassNames={{
                  hasActive: 'day-has-active',
                  allDone: 'day-all-done',
                }}
              />
            </CardContent>
          </Card>

          {/* Appointments for Selected Date */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{dateLabel}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointmentsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading appointments...</p>
                </div>
              ) : selectedDateAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No appointments {isToday ? 'today' : 'on this day'}</h3>
                  <p className="text-muted-foreground">Schedule your first appointment to get started</p>
                </div>
              ) : (
                selectedDateAppointments.map((appointment) => {
                const TypeIcon = typeConfig[appointment.type].icon;
                const status = appointment.status || 'scheduled';
                const isCompleted = status === 'completed';
                const isCancelled = status === 'cancelled';
                const isInProgress = status === 'in-progress';
                
                // Get client and employee names
                const client = clients.find(c => c.id === appointment.clientId);
                const employee = employees.find(e => e.id === appointment.employeeId);
                
                return (
                  <div
                    key={appointment.id}
                    className={cn(
                      "p-4 rounded-lg border hover:shadow-md transition-shadow animate-fade-in",
                      isCancelled && "opacity-60 bg-muted"
                    )}
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
                          <h3 className="font-semibold">{client?.name || 'Unknown Client'}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.purpose}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {appointment.contactPerson}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {appointment.time} ({appointment.duration})
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex gap-2">
                          <Badge className={cn(typeConfig[appointment.type].className)}>
                            {typeConfig[appointment.type].label}
                          </Badge>
                          <Badge className={cn(statusConfig[status].className)}>
                            {statusConfig[status].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          with {employee?.name || 'Unknown Employee'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {!isCancelled && !isCompleted && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleReschedule(appointment)}
                          >
                            Reschedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {isInProgress && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                          className="ml-auto"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {!isCancelled && !isCompleted && !isInProgress && (
                        <Button 
                          size="sm" 
                          className="ml-auto"
                          onClick={() => handleStartMeeting(appointment)}
                        >
                          Start Meeting
                        </Button>
                      )}
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
                value={appointmentForm.employeeId}
                onValueChange={(value) => setAppointmentForm({ ...appointmentForm, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
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
            
            {/* Always show all three optional fields */}
            <div className="grid gap-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="Office - Conference Room A"
                value={appointmentForm.location}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={appointmentForm.phoneNumber}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={appointmentForm.meetingLink}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, meetingLink: e.target.value })}
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
              disabled={appointmentsLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAppointment} disabled={appointmentsLoading}>
              {appointmentsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Dialog */}
            <div className="grid gap-2">
              <Label htmlFor="reschedule-client">Client</Label>
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
              <Label htmlFor="reschedule-contact">Contact Person</Label>
              <Input
                id="reschedule-contact"
                placeholder="Enter contact person name"
                value={appointmentForm.contactPerson}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, contactPerson: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reschedule-date">Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={appointmentForm.date}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reschedule-time">Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={appointmentForm.time}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reschedule-duration">Duration</Label>
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
                <Label htmlFor="reschedule-type">Meeting Type</Label>
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
              <Label htmlFor="reschedule-purpose">Purpose</Label>
              <Input
                id="reschedule-purpose"
                placeholder="Enter meeting purpose"
                value={appointmentForm.purpose}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, purpose: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-assignedTo">Assign To</Label>
              <Select
                value={appointmentForm.employeeId}
                onValueChange={(value) => setAppointmentForm({ ...appointmentForm, employeeId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-notes">Notes (Optional)</Label>
              <Textarea
                id="reschedule-notes"
                placeholder="Add any additional notes"
                value={appointmentForm.notes}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, notes: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Always show all three optional fields */}
            <div className="grid gap-2">
              <Label htmlFor="reschedule-location">Location (Optional)</Label>
              <Input
                id="reschedule-location"
                placeholder="Office - Conference Room A"
                value={appointmentForm.location}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-phoneNumber">Phone Number (Optional)</Label>
              <Input
                id="reschedule-phoneNumber"
                type="tel"
                placeholder="+91 98765 43210"
                value={appointmentForm.phoneNumber}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reschedule-meetingLink">Meeting Link (Optional)</Label>
              <Input
                id="reschedule-meetingLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={appointmentForm.meetingLink}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, meetingLink: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsRescheduleDialogOpen(false);
                setSelectedAppointment(null);
              }}
              disabled={appointmentsLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAppointment} disabled={appointmentsLoading}>
              {appointmentsLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
