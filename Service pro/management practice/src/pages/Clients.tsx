import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { FilterBar, FilterTextInput, FilterDropdown, FilterMultiSelect } from '@/components/filters';
import { ClientActivitySheet } from '@/components/ClientActivitySheet';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Plus, Search, MoreHorizontal, Mail, Phone, MessageSquare, FileText, Building2, X, Edit, Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { availableServices } from '@/lib/data';
import { Client } from '@/types';

interface ClientForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: string;
  // Frontend-only fields
  services: string[];
  assignedEmployee: string;
}

const statusConfig = {
  active: { label: 'Active', className: 'bg-success/10 text-success border-success/20' },
  onboarding: { label: 'Onboarding', className: 'bg-warning/10 text-warning border-warning/20' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground' },
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isActivitySheetOpen, setIsActivitySheetOpen] = useState(false);
  const [activityClient, setActivityClient] = useState<Client | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const { toast } = useToast();

  // React Query hooks
  const { user } = useAuth();
  const { data: clients = [], isLoading, error } = useClients();
  const { data: employees = [] } = useEmployees();
  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const deleteClientMutation = useDeleteClient();

  // Find current employee record
  const currentEmployee = useMemo(() => {
    return employees.find(e => e.email === user?.email);
  }, [employees, user]);

  // Filter states - default to self if employee/manager
  const [filters, setFilters] = useState({
    company: '',
    email: '',
    phone: '',
    services: [] as string[],
    assignedEmployee: 'all',
    status: 'all',
  });

  // Initialization effect for filters
  useEffect(() => {
    if (user && user.role !== 'super_admin' && currentEmployee) {
      setFilters(prev => ({ ...prev, assignedEmployee: currentEmployee.id }));
    }
  }, [user, currentEmployee]);

  // Log for debugging
  console.log('Clients data:', clients);
  console.log('Loading:', isLoading);
  console.log('Error:', error);
  
  const [clientForm, setClientForm] = useState<ClientForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    services: [],
    assignedEmployee: '',
    status: 'active',
  });

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Text search (existing)
      const matchesSearch = 
        !searchTerm ||
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      // Company filter
      const matchesCompany = !filters.company || 
        client.company?.toLowerCase().includes(filters.company.toLowerCase()) ||
        client.name?.toLowerCase().includes(filters.company.toLowerCase());

      // Email filter
      const matchesEmail = !filters.email || 
        client.email?.toLowerCase().includes(filters.email.toLowerCase());

      // Phone filter
      const matchesPhone = !filters.phone || 
        (client.phone && client.phone.includes(filters.phone)) ||
        (client.mobile && client.mobile.includes(filters.phone));

      // Services filter (any selected service must be in client's services)
      const matchesServices = filters.services.length === 0 || 
        (client.services && filters.services.some(service => client.services?.includes(service)));

      // Assigned Employee filter
      const matchesEmployee = filters.assignedEmployee === 'all' || 
        client.assignedEmployee === filters.assignedEmployee;

      // Status filter
      const matchesStatus = filters.status === 'all' || 
        client.status === filters.status;

      return matchesSearch && matchesCompany && matchesEmail && matchesPhone && 
             matchesServices && matchesEmployee && matchesStatus;
    });
  }, [clients, searchTerm, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.company) count++;
    if (filters.email) count++;
    if (filters.phone) count++;
    if (filters.services.length > 0) count++;
    if (filters.assignedEmployee !== 'all') count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      company: '',
      email: '',
      phone: '',
      services: [],
      assignedEmployee: 'all',
      status: 'all',
    });
  };

  const resetForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      address: '',
      services: [],
      assignedEmployee: '',
      status: 'active',
    });
    setSelectedServices([]);
  };

  const handleAddClient = async () => {
    // Validation
    if (!clientForm.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientForm.email.trim() || !clientForm.email.includes('@')) {
      toast({
        title: "Error",
        description: "Valid email is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedServices.length === 0) {
      toast({
        title: "Error",
        description: "At least one service must be selected",
        variant: "destructive",
      });
      return;
    }

    try {
      const clientData: any = {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        company: clientForm.company || '',
        address: clientForm.address || '',
        status: clientForm.status || 'active',
        services: selectedServices,
        assignedEmployee: clientForm.assignedEmployee || null,
      };

      console.log('Creating client with data:', clientData);
      console.log('Selected services:', selectedServices);
      console.log('Form assignedEmployee:', clientForm.assignedEmployee);
      console.log('Available employees:', employees);

      await createClientMutation.mutateAsync(clientData);
      
      resetForm();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Client added successfully",
      });
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error",
        description: "Failed to add client",
        variant: "destructive",
      });
    }
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email,
      phone: client.phone || client.mobile || '',
      company: client.company || '',
      address: client.address || '',
      services: client.services || [],
      assignedEmployee: client.assignedEmployee || '',
      status: client.status,
    });
    setSelectedServices(client.services || []);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!editingClient) return;

    // Validation
    if (!clientForm.name.trim()) {
      toast({
        title: "Error",
        description: "Client name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientForm.email.trim() || !clientForm.email.includes('@')) {
      toast({
        title: "Error",
        description: "Valid email is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!clientForm.phone.trim()) {
      toast({
        title: "Error",
        description: "Phone number is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updates: any = {
        name: clientForm.name,
        email: clientForm.email,
        phone: clientForm.phone,
        company: clientForm.company || '',
        address: clientForm.address || '',
        status: clientForm.status || 'active',
        services: selectedServices,
        assignedEmployee: clientForm.assignedEmployee || null,
      };

      console.log('Updating client:', editingClient.id, updates);

      await updateClientMutation.mutateAsync({
        id: editingClient.id,
        updates,
      });
      
      resetForm();
      setIsEditDialogOpen(false);
      setEditingClient(null);
      
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleViewActivity = (client: Client) => {
    setActivityClient(client);
    setIsActivitySheetOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!deletingClient) return;

    try {
      await deleteClientMutation.mutateAsync(deletingClient.id);
      
      setIsDeleteDialogOpen(false);
      setDeletingClient(null);
      
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete client",
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

  const removeService = (service: string) => {
    setSelectedServices(prev => prev.filter(s => s !== service));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    console.error('Error loading clients:', error);
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Error loading clients</h3>
            <p className="text-muted-foreground mt-2">{error instanceof Error ? error.message : 'Please try refreshing the page'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Refresh Page
            </Button>
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
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <FilterBar 
            activeFilterCount={activeFilterCount} 
            onClearAll={clearAllFilters}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FilterTextInput
                label="Company"
                value={filters.company}
                onChange={(value) => setFilters({ ...filters, company: value })}
                placeholder="Search by company..."
              />
              <FilterTextInput
                label="Email"
                value={filters.email}
                onChange={(value) => setFilters({ ...filters, email: value })}
                placeholder="Search by email..."
              />
              <FilterTextInput
                label="Phone"
                value={filters.phone}
                onChange={(value) => setFilters({ ...filters, phone: value })}
                placeholder="Search by phone..."
              />
              <FilterDropdown
                label="Assigned Employee"
                value={filters.assignedEmployee}
                onChange={(value) => setFilters({ ...filters, assignedEmployee: value })}
                options={employees.map(emp => ({ value: emp.id, label: emp.name }))}
                placeholder="All Employees"
              />
              <FilterDropdown
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'onboarding', label: 'Onboarding' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="All Statuses"
              />
            </div>
            <FilterMultiSelect
              label="Services"
              value={filters.services}
              onChange={(value) => setFilters({ ...filters, services: value })}
              options={availableServices}
            />
          </FilterBar>
        </div>

        <div className="bg-card rounded-xl border shadow-card overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm ? 'No clients found matching your search' : 'No clients yet. Add your first client to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{client.company || client.name}</p>
                          <p className="text-sm text-muted-foreground">{client.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {client.phone || client.mobile || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(client.services && client.services.length > 0) ? (
                          client.services.map((service) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No services</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {client.assignedEmployee 
                          ? employees.find(emp => emp.id === client.assignedEmployee)?.name || 'Unassigned'
                          : 'Unassigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        client.status === 'active' ? statusConfig.active.className :
                        client.status === 'onboarding' ? statusConfig.onboarding.className :
                        statusConfig.inactive.className
                      )}>
                        {client.status === 'active' ? statusConfig.active.label :
                         client.status === 'onboarding' ? statusConfig.onboarding.label :
                         statusConfig.inactive.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClient(client)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Client
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewActivity(client)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteClient(client)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>
          </div>
          )}
        </div>
      </div>

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Enter the client details to add them to your system.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter client name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  placeholder="Enter company name"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
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
                      <button
                        onClick={() => removeService(service)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="assignedEmployee">Assign To</Label>
                  {clientForm.assignedEmployee && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setClientForm({ ...clientForm, assignedEmployee: '' })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Select
                  value={clientForm.assignedEmployee || undefined}
                  onValueChange={(value) => setClientForm({ ...clientForm, assignedEmployee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee (optional)" />
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
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={clientForm.status}
                  onValueChange={(value: string) => 
                    setClientForm({ ...clientForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddClient}
              disabled={createClientMutation.isPending}
            >
              {createClientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
            <DialogDescription>
              Update the client details.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Client Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter client name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Company Name</Label>
                <Input
                  id="edit-company"
                  placeholder="Enter company name"
                  value={clientForm.company}
                  onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="Enter email address"
                  value={clientForm.email}
                  onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone *</Label>
                <Input
                  id="edit-phone"
                  placeholder="Enter phone number"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
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
                      <button
                        onClick={() => removeService(service)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-assignedEmployee">Assign To</Label>
                  {clientForm.assignedEmployee && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setClientForm({ ...clientForm, assignedEmployee: '' })}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Select
                  value={clientForm.assignedEmployee || undefined}
                  onValueChange={(value) => setClientForm({ ...clientForm, assignedEmployee: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee (optional)" />
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
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={clientForm.status}
                  onValueChange={(value: string) => 
                    setClientForm({ ...clientForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateClient}
              disabled={updateClientMutation.isPending}
            >
              {updateClientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingClient?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Activity Sheet */}
      {activityClient && (
        <ClientActivitySheet
          clientId={activityClient.id}
          clientName={activityClient.name}
          open={isActivitySheetOpen}
          onOpenChange={setIsActivitySheetOpen}
        />
      )}
    </DashboardLayout>
  );
}
