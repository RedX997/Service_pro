import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar, FilterTextInput, FilterDropdown } from '@/components/filters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Briefcase, 
  Edit, 
  Trash2, 
  Eye, 
  MoreVertical,
  ChevronRight,
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data based on the screenshot
const MOCK_SERVICES = [
  {
    id: '1',
    name: 'Income Tax Filing',
    department: 'Income Tax',
    description: 'Preparation and filing of income tax returns for individuals and businesses',
    documents: 3,
    status: 'inactive',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Tax Planning',
    department: 'Income Tax',
    description: 'Strategic planning to minimize tax liabilities legally',
    documents: 2,
    status: 'inactive',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'GST Registration',
    department: 'GST',
    description: 'Assistance with GST registration process for businesses',
    documents: 2,
    status: 'inactive',
    createdAt: '2024-02-01',
  },
  {
    id: '4',
    name: 'GST Filing',
    department: 'GST',
    description: 'Regular GST return filing for registered businesses',
    documents: 2,
    status: 'inactive',
    createdAt: '2024-02-10',
  },
  {
    id: '5',
    name: 'Company Formation',
    department: 'Corporate Law',
    description: 'Complete assistance with company registration and setup',
    documents: 3,
    status: 'inactive',
    createdAt: '2024-02-15',
  }
];

const DEPARTMENTS = ['Income Tax', 'GST', 'Corporate Law', 'Auditing', 'Legal', 'Advisory'];

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [services, setServices] = useState(MOCK_SERVICES);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    department: 'all',
  });

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchesSearch = !searchTerm || 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesName = !filters.name || 
        service.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesDept = filters.department === 'all' || 
        service.department === filters.department;

      return matchesSearch && matchesName && matchesDept;
    });
  }, [services, searchTerm, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.name) count++;
    if (filters.department !== 'all') count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      name: '',
      department: 'all',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      case 'inactive':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Services</h1>
            <p className="text-muted-foreground text-lg">
              Manage organization services and their requirements
            </p>
          </div>
          <Button 
            className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95 px-6"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Service
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-muted focus-visible:ring-primary/30"
              />
            </div>
            <FilterBar 
              activeFilterCount={activeFilterCount} 
              onClearAll={clearAllFilters}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-[300px]">
                <FilterTextInput
                  label="Service Name"
                  value={filters.name}
                  onChange={(value) => setFilters({ ...filters, name: value })}
                  placeholder="e.g. GST..."
                />
                <FilterDropdown
                  label="Department"
                  value={filters.department}
                  onChange={(value) => setFilters({ ...filters, department: value })}
                  options={DEPARTMENTS.map(d => ({ label: d, value: d }))}
                />
              </div>
            </FilterBar>
          </CardContent>
        </Card>

        {/* Table/List View */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground font-medium border-b transition-colors">
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-center">Documents</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredServices.map((service) => (
                  <tr 
                    key={service.id} 
                    className="hover:bg-muted/30 transition-all duration-200 group animate-in fade-in slide-in-from-left-2"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <span>{service.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="font-normal rounded-md px-2 py-0.5">
                        {service.department}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {service.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>{service.documents}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={cn("rounded-full px-3 py-0.5 border-none", getStatusColor(service.status))}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="hidden sm:flex text-primary hover:text-primary hover:bg-primary/10 transition-all">
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40 backdrop-blur-lg">
                            <DropdownMenuItem className="cursor-pointer">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredServices.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No services found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or add a new service.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog placeholder */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
            <DialogDescription>
              Define a new service offered by your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Service Name</Label>
              <Input id="name" placeholder="e.g. Corporate Tax Return" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dept">Department</Label>
              <Select>
                <SelectTrigger id="dept">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="Details about this service..." rows={4} />
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg border bg-muted/30">
              <Badge variant="outline" className="text-xs bg-background">Pro Tip</Badge>
              <span className="text-xs text-muted-foreground">You can link required documents after creating the service.</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsDialogOpen(false)}>Create Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
