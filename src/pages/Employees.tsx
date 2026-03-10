import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { FilterBar, FilterTextInput, FilterDropdown } from '@/components/filters';
import { WorkloadDialog } from '@/components/dialogs/WorkloadDialog';
import { AssignTaskDialog } from '@/components/dialogs/AssignTaskDialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Mail, Phone, MoreVertical, Users, Clock, Briefcase, Loader2, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { useClients } from '@/hooks/useClients';
import { Employee } from '@/types';

const departments = [
  'GST Services',
  'Income Tax',
  'Audit',
  'Tax Consultation',
  'Company Registration',
  'Compliance',
  'Bookkeeping',
];

const roles = [
  'Associate',
  'Senior Associate',
  'Manager',
  'Senior Manager',
  'Partner',
];

interface EmployeeForm {
  name: string;
  email: string;
  mobile: string;
  phone: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isWorkloadDialogOpen, setIsWorkloadDialogOpen] = useState(false);
  const [isAssignTaskDialogOpen, setIsAssignTaskDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  
  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'all',
    department: 'all',
    status: 'all',
  });
  
  // Fetch data from API
  const { data: employees = [], isLoading: employeesLoading } = useEmployees();
  const { data: clients = [] } = useClients();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Calculate real client load and billable hours for each employee
  const employeesWithStats = useMemo(() => {
    return employees.map(employee => {
      // Count clients assigned to this employee
      const clientLoad = clients.filter(
        client => client.assignedEmployee === employee.id
      ).length;

      // TODO: Calculate billable hours from time entries
      // For now, using 0 until time entries API is connected
      const billableHours = 0;

      return {
        ...employee,
        clientLoad,
        maxLoad: 8, // Default max load
        billableHours,
      };
    });
  }, [employees, clients]);

  const [employeeForm, setEmployeeForm] = useState<EmployeeForm>({
    name: '',
    email: '',
    mobile: '',
    phone: '',
    department: '',
    role: '',
    status: 'active',
  });

  const filteredEmployees = useMemo(() => {
    return employeesWithStats.filter(employee => {
      // Text search (existing)
      const matchesSearch = 
        !searchTerm ||
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (employee.department && employee.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
        employee.role.toLowerCase().includes(searchTerm.toLowerCase());

      // Name filter
      const matchesName = !filters.name || 
        employee.name.toLowerCase().includes(filters.name.toLowerCase());

      // Email filter
      const matchesEmail = !filters.email || 
        (employee.email && employee.email.toLowerCase().includes(filters.email.toLowerCase()));

      // Phone filter
      const matchesPhone = !filters.phone || 
        (employee.mobile && employee.mobile.includes(filters.phone));

      // Role filter
      const matchesRole = filters.role === 'all' || 
        employee.role === filters.role;

      // Department filter
      const matchesDepartment = filters.department === 'all' || 
        employee.department === filters.department;

      // Status filter
      const matchesStatus = filters.status === 'all' || 
        employee.status === filters.status;

      return matchesSearch && matchesName && matchesEmail && matchesPhone && 
             matchesRole && matchesDepartment && matchesStatus;
    });
  }, [employeesWithStats, searchTerm, filters]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.name) count++;
    if (filters.email) count++;
    if (filters.phone) count++;
    if (filters.role !== 'all') count++;
    if (filters.department !== 'all') count++;
    if (filters.status !== 'all') count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      name: '',
      email: '',
      phone: '',
      role: 'all',
      department: 'all',
      status: 'all',
    });
  };

  const resetForm = () => {
    setEmployeeForm({
      name: '',
      email: '',
      mobile: '',
      phone: '',
      department: '',
      role: '',
      status: 'active',
    });
  };

  const handleAddEmployee = async () => {
    // Validation
    if (!employeeForm.name.trim()) {
      toast({
        title: "Error",
        description: "Employee name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!employeeForm.role) {
      toast({
        title: "Error",
        description: "Role is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEmployee.mutateAsync({
        name: employeeForm.name.trim(),
        email: employeeForm.email.trim() || null,
        phone: employeeForm.phone.trim() || null,
        mobile: employeeForm.mobile.trim() || null,
        department: employeeForm.department || null,
        role: employeeForm.role,
        status: employeeForm.status,
      } as any);

      resetForm();
      setIsAddDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    }
  };

  const handleViewWorkload = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsWorkloadDialogOpen(true);
  };

  const handleAssignTask = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsAssignTaskDialogOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setEmployeeForm({
      name: employee.name,
      email: employee.email || '',
      mobile: employee.mobile || '',
      phone: employee.phone || '',
      department: employee.department || '',
      role: employee.role,
      status: employee.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    // Validation
    if (!employeeForm.name.trim()) {
      toast({
        title: "Error",
        description: "Employee name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!employeeForm.role) {
      toast({
        title: "Error",
        description: "Role is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateEmployee.mutateAsync({
        id: editingEmployee.id,
        updates: {
          name: employeeForm.name.trim(),
          email: employeeForm.email.trim() || null,
          phone: employeeForm.phone.trim() || null,
          mobile: employeeForm.mobile.trim() || null,
          department: employeeForm.department || null,
          role: employeeForm.role,
          status: employeeForm.status,
        },
      });

      resetForm();
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeletingEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteEmployee.mutateAsync(deletingEmployee.id);
      
      setIsDeleteDialogOpen(false);
      setDeletingEmployee(null);
      
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (employeesLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage team members and workload</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <FilterBar 
            activeFilterCount={activeFilterCount} 
            onClearAll={clearAllFilters}
          >
            <div className="grid grid-cols-2 gap-4">
              <FilterTextInput
                label="Name"
                value={filters.name}
                onChange={(value) => setFilters({ ...filters, name: value })}
                placeholder="Search by name..."
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
                label="Role"
                value={filters.role}
                onChange={(value) => setFilters({ ...filters, role: value })}
                options={roles.map(role => ({ value: role, label: role }))}
                placeholder="All Roles"
              />
              <FilterDropdown
                label="Department"
                value={filters.department}
                onChange={(value) => setFilters({ ...filters, department: value })}
                options={departments.map(dept => ({ value: dept, label: dept }))}
                placeholder="All Departments"
              />
              <FilterDropdown
                label="Status"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                placeholder="All Statuses"
              />
            </div>
          </FilterBar>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="animate-fade-in hover:shadow-card-hover transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{employee.name}</h3>
                      <p className="text-sm text-muted-foreground">{employee.role}</p>
                      <Badge 
                        variant={employee.status === 'active' ? 'secondary' : 'outline'} 
                        className="mt-1 text-xs"
                      >
                        {employee.department}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditEmployee(employee)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Employee
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewWorkload(employee)}>
                        <Briefcase className="h-4 w-4 mr-2" />
                        View Workload
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignTask(employee)}>
                        Assign Tasks
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteEmployee(employee)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Employee
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    {employee.mobile}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-accent" />
                      <span>Client Load</span>
                    </div>
                    <Badge variant={employee.clientLoad >= 7 ? 'destructive' : 'secondary'}>
                      {employee.clientLoad}/{employee.maxLoad}
                    </Badge>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        employee.clientLoad >= 7 ? 'bg-destructive' : 'bg-accent'
                      )}
                      style={{ 
                        width: `${Math.round((employee.clientLoad / employee.maxLoad) * 100)}%`
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>This Month</span>
                    </div>
                    <span className="font-medium">{employee.billableHours}h billed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredEmployees.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No employees found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Add your first employee to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Add a new team member to your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter employee name"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                placeholder="Enter mobile number (optional)"
                value={employeeForm.mobile}
                onChange={(e) => setEmployeeForm({ ...employeeForm, mobile: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number (optional)"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={employeeForm.department}
                onValueChange={(value) => setEmployeeForm({ ...employeeForm, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={employeeForm.role}
                onValueChange={(value) => setEmployeeForm({ ...employeeForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={employeeForm.status}
                onValueChange={(value: 'active' | 'inactive') => setEmployeeForm({ ...employeeForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(false);
              }}
              disabled={createEmployee.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee} disabled={createEmployee.isPending}>
              {createEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee</DialogTitle>
            <DialogDescription>
              Update employee information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter employee name"
                value={employeeForm.name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-mobile">Mobile Number</Label>
              <Input
                id="edit-mobile"
                placeholder="Enter mobile number"
                value={employeeForm.mobile}
                onChange={(e) => setEmployeeForm({ ...employeeForm, mobile: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Select
                value={employeeForm.department}
                onValueChange={(value) => setEmployeeForm({ ...employeeForm, department: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={employeeForm.role}
                onValueChange={(value) => setEmployeeForm({ ...employeeForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={employeeForm.status}
                onValueChange={(value: 'active' | 'inactive') => setEmployeeForm({ ...employeeForm, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsEditDialogOpen(false);
                setEditingEmployee(null);
              }}
              disabled={updateEmployee.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateEmployee} disabled={updateEmployee.isPending}>
              {updateEmployee.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Employee Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingEmployee?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteEmployee.isPending}
            >
              {deleteEmployee.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Workload Dialog */}
      <WorkloadDialog
        employee={selectedEmployee}
        open={isWorkloadDialogOpen}
        onOpenChange={setIsWorkloadDialogOpen}
      />

      {/* Assign Task Dialog */}
      <AssignTaskDialog
        employee={selectedEmployee}
        open={isAssignTaskDialogOpen}
        onOpenChange={setIsAssignTaskDialogOpen}
      />
    </DashboardLayout>
  );
}