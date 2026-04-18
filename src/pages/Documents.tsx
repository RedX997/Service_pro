import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FilterBar, FilterTextInput, FilterDropdown } from '@/components/filters';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  FileText, 
  Edit, 
  Trash2, 
  MoreVertical,
  ChevronRight,
  ShieldCheck,
  FileCode,
  FileCheck
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
import { cn } from '@/lib/utils';

// Mock data based on the screenshot
const MOCK_DOCUMENTS = [
  {
    id: '1',
    name: 'Income Statement',
    category: 'Financial',
    description: 'Statement showing income from all sources for the financial year',
    format: 'PDF',
    status: 'active',
  },
  {
    id: '2',
    name: 'Tax Deduction Proofs',
    category: 'Tax',
    description: 'Documents supporting tax deduction claims',
    format: 'PDF/JPEG',
    status: 'active',
  },
  {
    id: '3',
    name: 'Form 16',
    category: 'Tax',
    description: 'Annual tax statement issued by employer',
    format: 'PDF',
    status: 'active',
  },
  {
    id: '4',
    name: 'Investment Statements',
    category: 'Financial',
    description: 'Statements showing all investments and returns',
    format: 'PDF/Excel',
    status: 'active',
  },
  {
    id: '5',
    name: 'Business Registration Certificate',
    category: 'Legal',
    description: 'Official business registration document',
    format: 'PDF',
    status: 'active',
  }
];

const CATEGORIES = ['Financial', 'Tax', 'Legal', 'Identity', 'Address Proof'];
const FORMATS = ['PDF', 'JPEG', 'PNG', 'Excel', 'Word'];

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [documents, setDocuments] = useState(MOCK_DOCUMENTS);
  const { toast } = useToast();

  // Filter states
  const [filters, setFilters] = useState({
    name: '',
    category: 'all',
  });

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = !searchTerm || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesName = !filters.name || 
        doc.name.toLowerCase().includes(filters.name.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || 
        doc.category === filters.category;

      return matchesSearch && matchesName && matchesCategory;
    });
  }, [documents, searchTerm, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.name) count++;
    if (filters.category !== 'all') count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    setFilters({
      name: '',
      category: 'all',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground text-lg">
              Manage document templates and requirements
            </p>
          </div>
          <Button 
            className="shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 active:scale-95 px-6"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Document
          </Button>
        </div>

        {/* Filters Section */}
        <Card className="border-none shadow-premium bg-card/60 backdrop-blur-md">
          <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
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
                  label="Document Name"
                  value={filters.name}
                  onChange={(value) => setFilters({ ...filters, name: value })}
                  placeholder="e.g. Form 16..."
                />
                <FilterDropdown
                  label="Category"
                  value={filters.category}
                  onChange={(value) => setFilters({ ...filters, category: value })}
                  options={CATEGORIES.map(c => ({ label: c, value: c }))}
                />
              </div>
            </FilterBar>
          </CardContent>
        </Card>

        {/* Table/List View */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground font-medium border-b">
                  <th className="px-6 py-4">Document</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredDocuments.map((doc) => (
                  <tr 
                    key={doc.id} 
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                          <FileText className="h-5 w-5" />
                        </div>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="font-normal rounded-md border-muted-foreground/20">
                        {doc.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold">
                      <div className="flex flex-wrap gap-1">
                        {doc.format.split('/').map(f => (
                          <span key={f} className="px-1.5 py-0.5 rounded bg-black text-white dark:bg-white dark:text-black">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 transition-all">
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
                              Edit Template
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
          {filteredDocuments.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No documents found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or add a new template.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Document Template</DialogTitle>
            <DialogDescription>
              Create a new requirement or template for organization services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Document Name</Label>
              <Input id="name" placeholder="e.g. Identity Proof (OVD)" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="formats">Allowed Formats</Label>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map(f => (
                  <Badge key={f} variant="outline" className="cursor-pointer hover:bg-muted">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" placeholder="What is this document used for?" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsDialogOpen(false)}>Upload Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
