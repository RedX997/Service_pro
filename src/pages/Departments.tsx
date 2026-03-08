import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Building2, Briefcase, Users, FileText, Edit, Trash2 } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { useToast } from '@/hooks/use-toast';

export default function Departments() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const { departments, loading, error, createDepartment, updateDepartment, deleteDepartment } = useDepartments();
  const { toast } = useToast();

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async () => {
    try {
      if (isEditMode && editingId) {
        await updateDepartment(editingId, formData);
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        });
      } else {
        await createDepartment(formData);
        toast({
          title: 'Success',
          description: 'Department created successfully',
        });
      }
      setIsDialogOpen(false);
      setFormData({ name: '', description: '' });
      setIsEditMode(false);
      setEditingId(null);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to save department',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (dept: any) => {
    setFormData({
      name: dept.name,
      description: dept.description || '',
    });
    setEditingId(dept.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
        toast({
          title: 'Success',
          description: 'Department deleted successfully',
        });
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to delete department',
          variant: 'destructive',
        });
      }
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData({ name: '', description: '' });
      setIsEditMode(false);
      setEditingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading departments...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Departments & Services</h1>
            <p className="text-muted-foreground">Configure organizational structure</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEditMode ? 'Edit Department' : 'Create New Department'}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? 'Update department information' : 'Add a new department to your organization'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Department Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g., Tax Consultation" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Brief description of the department" 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => handleDialogClose(false)}>Cancel</Button>
                <Button onClick={handleSubmit}>{isEditMode ? 'Update' : 'Create'} Department</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="animate-fade-in">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{department.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{department.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(department)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(department.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{department.employees} employees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{department.services} services</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{department.activeClients} active clients</span>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
