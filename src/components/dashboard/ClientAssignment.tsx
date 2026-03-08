import { useNavigate } from 'react-router-dom';
import { User, Users, ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useMemo } from 'react';

export function ClientAssignment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();

  // Get unassigned clients
  const unassignedClients = useMemo(() => {
    return clients
      .filter(c => !c.assignedEmployee)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        name: c.name,
        service: c.service || 'General Service',
        since: 'Recently added'
      }));
  }, [clients]);

  // Get active employees with their client load
  const activeEmployees = useMemo(() => {
    return employees
      .filter(e => e.status === 'active')
      .slice(0, 3)
      .map(e => {
        const clientLoad = clients.filter(c => c.assignedEmployee === e.id).length;
        return {
          id: e.id,
          name: e.name,
          currentLoad: clientLoad,
          maxLoad: 8,
          department: e.department
        };
      });
  }, [employees, clients]);

  const handleOpenAssignmentPanel = () => {
    toast({
      title: "Assignment Panel",
      description: "Opening client assignment interface...",
    });
    navigate('/clients');
  };

  const handleClientClick = (clientName: string) => {
    toast({
      title: "Client Selected",
      description: `Selected ${clientName} for assignment`,
    });
  };

  const handleEmployeeClick = (employeeName: string) => {
    toast({
      title: "Employee Selected",
      description: `Selected ${employeeName} for assignment`,
    });
  };

  return (
    <div className="bg-card rounded-xl border shadow-card animate-slide-up">
      <div className="p-6 border-b">
        <h3 className="font-semibold text-lg">Client Assignment</h3>
        <p className="text-sm text-muted-foreground">Assign pending clients to team members</p>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
        {/* Unassigned Clients */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-4 w-4 text-warning" />
            <span className="font-medium text-sm">Unassigned Clients</span>
            <Badge variant="secondary">{unassignedClients.length}</Badge>
          </div>
          <div className="space-y-3">
            {unassignedClients.map((client) => (
              <div 
                key={client.id} 
                className="p-3 rounded-lg border border-dashed border-warning/30 bg-warning/5 cursor-pointer hover:border-warning transition-colors"
                onClick={() => handleClientClick(client.name)}
              >
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{client.service}</p>
                <p className="text-xs text-warning mt-1">Waiting: {client.since}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Available Employees */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-4 w-4 text-accent" />
            <span className="font-medium text-sm">Team Members</span>
          </div>
          <div className="space-y-3">
            {activeEmployees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No active employees</p>
            ) : (
              activeEmployees.map((employee) => (
              <div 
                key={employee.id} 
                className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleEmployeeClick(employee.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{employee.name}</p>
                      <p className="text-xs text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                  <Badge variant={employee.currentLoad >= 7 ? 'destructive' : 'secondary'}>
                    {employee.currentLoad}/{employee.maxLoad}
                  </Badge>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${(employee.currentLoad / employee.maxLoad) * 100}%` }}
                  />
                </div>
              </div>
              ))
            )}
          </div>
        </div>
      </div>
      <div className="p-4 border-t">
        <Button 
          className="w-full" 
          variant="outline"
          onClick={handleOpenAssignmentPanel}
        >
          Open Assignment Panel <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
