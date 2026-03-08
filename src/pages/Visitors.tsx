import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  User, 
  Clock, 
  Phone, 
  ArrowRightCircle, 
  MessageSquare, 
  CheckCircle, 
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { 
  useVisitors, 
  useCreateVisitor, 
  useUpdateVisitor, 
  useCheckOutVisitor, 
  useConvertToClient,
  useDeleteVisitor 
} from '@/hooks/useVisitors';
import { useCreateClient } from '@/hooks/useClients';
import { employees, availableServices } from '@/lib/data';
import { Visitor } from '@/types';

interface VisitorForm {
  name: string;
  mobile: string;
  purpose: string;
  assignedTo: string;
  notes?: string;
}

interface ClientConversionForm {
  name: string;
  email: string;
  mobile: string;
  company: string;
  services: string[];
  assignedEmployee: string;
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-primary/10 text-primary border-primary/20' },
  waiting: { label: 'Waiting', className: 'bg-warning/10 text-warning border-warning/20' },
  'in-meeting': { label: 'In Meeting', className: 'bg-accent/10 text-accent border-accent/20' },
  completed: { label: 'Completed', className: 'bg-success/10 text-success border-success/20' },
  converted: { label: 'Converted', className: 'bg-primary/10 text-primary border-primary/20' },
};

export default function Visitors() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [convertingVisitor, setConvertingVisitor] = useState<Visitor | null>(null);
  const [deletingVisitor, setDeletingVisitor] = useState<Visitor | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { toast } = useToast();

  // React Query hooks
  const { data: visitors = [], isLoading, error } = useVisitors();
  const createVisitorMutation = useCreateVisitor();
  const updateVisitorMutation = useUpdateVisitor();
  const checkOutVisitorMutation = useCheckOutVisitor();
  const convertToClientMutation = useConvertToClient();
  const deleteVisitorMutation = useDeleteVisitor();

  const [visitorForm, setVisitorForm] = useState<VisitorForm>({
    name: '',
    mobile: '',
    purpose: '',
    assignedTo: '',
    notes: '',
  });

  const [clientForm, setClientForm] = useState<ClientConversionForm>({
    name: '',
    email: '',
    mobile: '',
    company: '',
    services: [],
    assignedEmployee: '',
  });

  const filteredVisitors = visitors.filter(visitor =>
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.mobile.includes(searchTerm) ||
    visitor.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetVisitorForm = () => {
    setVisitorForm({
      name: '',
      mobile: '',
      purpose: '',
      assignedTo: '',
      notes: '',
    });
  };

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      mobile: '',
      company: '',
      services: [],
      assignedEmployee: '',
    });
    setSelectedServices([]);
  };

  const handleAddVisitor = async () => {
    if (!visitorForm.name.trim() || !visitorForm.mobile.trim() || !visitorForm.purpose.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createVisitorMutation.mutateAsync({
        name: visitorForm.name,
        phone: visitorForm.mobile, // Map mobile to phone for database
        purpose: visitorForm.purpose,
        hostId: visitorForm.assignedTo,
        notes: visitorForm.notes,
        status: 'waiting',
      });
      
      resetVisitorForm();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Visitor registered successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register visitor",
        variant: "destructive",
      });
    }
  };

  const handleEditVisitor = (visitor: Visitor) => {
    setEditingVisitor(visitor);
    setVisitorForm({
      name: visitor.name,
      mobile: visitor.phone || visitor.mobile || '', // Use phone from DB, fallback to mobile
      purpose: visitor.purpose,
      assignedTo: visitor.hostId || visitor.assignedTo || '',
      notes: visitor.notes || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateVisitor = async () => {
    if (!editingVisitor) return;

    try {
      await updateVisitorMutation.mutateAsync({
        id: editingVisitor.id,
        updates: {
          name: visitorForm.name,
          phone: visitorForm.mobile, // Map mobile to phone
          purpose: visitorForm.purpose,
          hostId: visitorForm.assignedTo,
          notes: visitorForm.notes,
        },
      });
      
      resetVisitorForm();
      setIsEditDialogOpen(false);
      setEditingVisitor(null);
      
      toast({
        title: "Success",
        description: "Visitor updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visitor",
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (visitor: Visitor, newStatus: Visitor['status']) => {
    try {
      await updateVisitorMutation.mutateAsync({
        id: visitor.id,
        updates: { status: newStatus },
      });
      
      toast({
        title: "Success",
        description: `Visitor status updated to ${newStatus}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update visitor status",
        variant: "destructive",
      });
    }
  };

  const handleCheckOut = async (visitor: Visitor) => {
    try {
      await checkOutVisitorMutation.mutateAsync(visitor.id);
      
      toast({
        title: "Success",
        description: "Visitor checked out successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check out visitor",
        variant: "destructive",
      });
    }
  };

  const handleConvertToClient = (visitor: Visitor) => {
    setConvertingVisitor(visitor);
    setClientForm({
      name: visitor.name,
      email: '',
      mobile: visitor.phone || visitor.mobile || '', // Use phone from DB, fallback to mobile
      company: '',
      services: [],
      assignedEmployee: visitor.hostId || visitor.assignedTo || '',
    });
    setIsConvertDialogOpen(true);
  };

  const confirmConvertToClient = async () => {
    if (!convertingVisitor) return;

    if (!clientForm.email.trim() || selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in email and select at least one service",
        variant: "destructive",
      });
      return;
    }

    try {
      await convertToClientMutation.mutateAsync({
        id: convertingVisitor.id,
        clientData: {
          name: clientForm.name,
          email: clientForm.email,
          phone: clientForm.mobile, // Map mobile to phone for database
          company: clientForm.company || '',
          services: selectedServices,
          assignedEmployee: clientForm.assignedEmployee || undefined,
          status: 'active',
        },
      });
      
      resetClientForm();
      setIsConvertDialogOpen(false);
      setConvertingVisitor(null);
      
      toast({
        title: "Success",
        description: "Visitor converted to client successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to convert visitor to client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVisitor = (visitor: Visitor) => {
    setDeletingVisitor(visitor);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteVisitor = async () => {
    if (!deletingVisitor) return;

    try {
      await deleteVisitorMutation.mutateAsync(deletingVisitor.id);
      
      setIsDeleteDialogOpen(false);
      setDeletingVisitor(null);
      
      toast({
        title: "Success",
        description: "Visitor deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete visitor",
        variant: "destructive",
      });
    }
  };

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev => 
      prev.includes(service) 
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const getWaitTime = (checkInTime: Date | string) => {
    const now = new Date();
    const checkIn = typeof checkInTime === 'string' ? new Date(checkInTime) : checkInTime;
    const diffMs = now.getTime() - checkIn.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}m`;
    } else {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}m`;
    }
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Error loading visitors</h3>
            <p className="text-muted-foreground">Please try refreshing the page</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Visitor Log</h1>
            <p className="text-muted-foreground">Manage walk-in visitors and meetings</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Visitor
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, mobile, or purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredVisitors.map((visitor) => (
              <Card key={visitor.id} className="animate-fade-in hover:shadow-card-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{visitor.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="h-3 w-3" />
                          {visitor.phone || visitor.mobile || 'N/A'}
                        </div>
                        <p className="text-sm mt-2">{visitor.purpose}</p>
                        {visitor.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Note: {visitor.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      <Badge className={cn(statusConfig[visitor.status].className)}>
                        {statusConfig[visitor.status].label}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {visitor.checkOutTime ? (
                          <span>Duration: {getWaitTime(visitor.checkInTime)}</span>
                        ) : (
                          <span>Wait: {getWaitTime(visitor.checkInTime)}</span>
                        )}
                      </div>
                      {visitor.checkOutTime && (
                        <div className="text-xs text-muted-foreground">
                          Checked out: {new Date(visitor.checkOutTime).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Assigned: {visitor.hostId || visitor.assignedTo || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                    {visitor.status === 'waiting' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(visitor, 'in-meeting')}
                        disabled={updateVisitorMutation.isPending}
                      >
                        Start Meeting
                      </Button>
                    )}
                    {visitor.status === 'in-meeting' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCheckOut(visitor)}
                        disabled={checkOutVisitorMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                    {(visitor.status === 'waiting' || visitor.status === 'in-meeting') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleConvertToClient(visitor)}
                        disabled={convertToClientMutation.isPending}
                      >
                        <ArrowRightCircle className="h-4 w-4 mr-1" />
                        Convert to Client
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditVisitor(visitor)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Visitor
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Notes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteVisitor(visitor)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Visitor
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredVisitors.length === 0 && (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No visitors found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms' : 'Register your first visitor to get started'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Add Visitor Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Register New Visitor</DialogTitle>
              <DialogDescription>
                Enter visitor details to log their visit
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter visitor name"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input 
                  id="mobile" 
                  placeholder="+91 XXXXX XXXXX"
                  value={visitorForm.mobile}
                  onChange={(e) => setVisitorForm({ ...visitorForm, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Visit *</Label>
                <Textarea 
                  id="purpose" 
                  placeholder="Describe the reason for visit"
                  value={visitorForm.purpose}
                  onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignTo">Assign To</Label>
                <Select
                  value={visitorForm.assignedTo}
                  onValueChange={(value) => setVisitorForm({ ...visitorForm, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional notes"
                  value={visitorForm.notes}
                  onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddVisitor}
                disabled={createVisitorMutation.isPending}
              >
                {createVisitorMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Register Visitor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Visitor Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Visitor</DialogTitle>
              <DialogDescription>
                Update visitor details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input 
                  id="edit-name" 
                  placeholder="Enter visitor name"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-mobile">Mobile Number *</Label>
                <Input 
                  id="edit-mobile" 
                  placeholder="+91 XXXXX XXXXX"
                  value={visitorForm.mobile}
                  onChange={(e) => setVisitorForm({ ...visitorForm, mobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Purpose of Visit *</Label>
                <Textarea 
                  id="edit-purpose" 
                  placeholder="Describe the reason for visit"
                  value={visitorForm.purpose}
                  onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-assignTo">Assign To</Label>
                <Select
                  value={visitorForm.assignedTo}
                  onValueChange={(value) => setVisitorForm({ ...visitorForm, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea 
                  id="edit-notes" 
                  placeholder="Any additional notes"
                  value={visitorForm.notes}
                  onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateVisitor}
                disabled={updateVisitorMutation.isPending}
              >
                {updateVisitorMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Update Visitor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Convert to Client Dialog */}
        <Dialog open={isConvertDialogOpen} onOpenChange={setIsConvertDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Convert to Client</DialogTitle>
              <DialogDescription>
                Convert {convertingVisitor?.name} to a client by providing additional details
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-name">Client Name *</Label>
                  <Input
                    id="client-name"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-company">Company Name</Label>
                  <Input
                    id="client-company"
                    placeholder="Enter company name"
                    value={clientForm.company}
                    onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client-email">Email *</Label>
                  <Input
                    id="client-email"
                    type="email"
                    placeholder="Enter email address"
                    value={clientForm.email}
                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-mobile">Mobile</Label>
                  <Input
                    id="client-mobile"
                    value={clientForm.mobile}
                    onChange={(e) => setClientForm({ ...clientForm, mobile: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Services *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableServices.map((service) => (
                    <div
                      key={service}
                      className={cn(
                        "p-2 text-sm border rounded-md cursor-pointer transition-colors",
                        selectedServices.includes(service)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:bg-muted border-border"
                      )}
                      onClick={() => handleServiceToggle(service)}
                    >
                      {service}
                    </div>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedServices.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-assignedEmployee">Assign To</Label>
                <Select
                  value={clientForm.assignedEmployee}
                  onValueChange={(value) => setClientForm({ ...clientForm, assignedEmployee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.name}>
                        {employee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConvertDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmConvertToClient}
                disabled={convertToClientMutation.isPending}
              >
                {convertToClientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Convert to Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Visitor</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {deletingVisitor?.name}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteVisitor}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteVisitorMutation.isPending}
              >
                {deleteVisitorMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}