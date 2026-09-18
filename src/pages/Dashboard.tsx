import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/stat-card';
import { TaskList } from '@/components/dashboard/TaskList';
import { RecentVisitors } from '@/components/dashboard/RecentVisitors';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { ClientAssignment } from '@/components/dashboard/ClientAssignment';
import { Users, UserPlus, Clock, MessageSquare, Building2, FileText, AlertTriangle, CheckSquare, UserCheck } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useVisitors } from '@/hooks/useVisitors';
import { useMessages } from '@/hooks/useMessages';
import { useTaskStats } from '@/hooks/useTasks';
import { useDepartments } from '@/hooks/useDepartments';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Send, Calendar, Users as UsersIcon, Eye, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// New Helper Components based on preferences
const WelcomeBanner = ({ roleName, isVisible }: { roleName: string, isVisible: boolean }) => {
  if (!isVisible) return null;
  return (
    <div className="bg-primary/5 border border-primary/10 rounded-lg p-5 mb-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Welcome back!</h2>
      <p className="text-slate-600 dark:text-slate-400 mt-1 text-sm">
        Here is what is happening across your {roleName} workspace today.
      </p>
    </div>
  );
};

const QuickActionsPanel = ({ isVisible, role, onViewClients }: { isVisible: boolean; role?: string; onViewClients?: () => void }) => {
  const navigate = useNavigate();
  if (!isVisible) return null;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <Button onClick={() => navigate('/tasks')} variant="outline" className="flex items-center gap-2 font-medium bg-white dark:bg-slate-900 border-slate-200 shadow-sm h-12">
        <PlusCircle className="h-4 w-4 text-primary" /> New Task
      </Button>
      {role === 'employee' ? (
        <Button onClick={onViewClients} variant="outline" className="flex items-center gap-2 font-medium bg-white dark:bg-slate-900 border-slate-200 shadow-sm h-12">
          <Eye className="h-4 w-4 text-primary" /> View Clients
        </Button>
      ) : (
        <Button onClick={() => navigate('/clients')} variant="outline" className="flex items-center gap-2 font-medium bg-white dark:bg-slate-900 border-slate-200 shadow-sm h-12">
          <UsersIcon className="h-4 w-4 text-primary" /> Add Client
        </Button>
      )}
      <Button onClick={() => navigate('/appointments')} variant="outline" className="flex items-center gap-2 font-medium bg-white dark:bg-slate-900 border-slate-200 shadow-sm h-12">
        <Calendar className="h-4 w-4 text-primary" /> Book Apt
      </Button>
      <Button onClick={() => navigate('/messages')} variant="outline" className="flex items-center gap-2 font-medium bg-white dark:bg-slate-900 border-slate-200 shadow-sm h-12">
        <Send className="h-4 w-4 text-primary" /> Message
      </Button>
    </div>
  );
};

function SuperAdminDashboard() {
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();

  // Calculate active employees
  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status === 'active').length;
  }, [employees]);

  const { user } = useAuth();
  
  const isCompact = user?.compactView ?? false;
  const showWelcome = user?.showWelcome ?? true;
  const showQuickActions = user?.showQuickActions ?? true;
  
  const spaceClass = isCompact ? "space-y-3" : "space-y-6";
  const gapClass = isCompact ? "gap-3" : "gap-6";

  return (
    <div className={spaceClass}>
      <WelcomeBanner roleName="Admin" isVisible={showWelcome} />
      
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and configuration</p>
      </div>

      <QuickActionsPanel isVisible={showQuickActions} />

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${gapClass}`}>
        <StatCard
          title="Total Clients"
          value={clients.length.toString()}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Active Employees"
          value={activeEmployees.toString()}
          icon={<UserPlus className="h-5 w-5" />}
          variant="accent"
        />
        <StatCard
          title="Departments"
          value={departments.length.toString()}
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Services"
          value="5" // Updated to reflect real mock data count
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className={`grid lg:grid-cols-2 ${gapClass}`}>
        <TaskList />
        <ClientAssignment />
      </div>

      <div className={`grid lg:grid-cols-3 ${gapClass}`}>
        <div className="lg:col-span-2">
          <RecentVisitors />
        </div>
        <RecentActivities />
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const { user } = useAuth();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: employees = [] } = useEmployees();
  const { data: messages = [] } = useMessages();
  
  // Find current employee record for ID filtering
  const currentEmployee = useMemo(() => {
    return employees.find(e => e.email === user?.email);
  }, [employees, user]);

  // Calculate my clients (personalized for manager)
  const myClients = useMemo(() => {
    if (!currentEmployee) return 0;
    return clients.filter(c => c.assignedEmployee === currentEmployee.id).length;
  }, [clients, currentEmployee]);

  // Calculate team members (all active employees for manager view)
  const teamMembers = useMemo(() => {
    return employees.filter(e => e.status === 'active').length;
  }, [employees]);

  // Calculate red zone chats (unread messages older than 24 hours)
  const redZoneChats = useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    return messages.filter(m => !m.isRead && m.senderType === 'client' && new Date(m.timestamp) < oneDayAgo).length;
  }, [messages]);

  const isCompact = user?.compactView ?? false;
  const showWelcome = user?.showWelcome ?? true;
  const showQuickActions = user?.showQuickActions ?? true;
  
  const spaceClass = isCompact ? "space-y-3" : "space-y-6";
  const gapClass = isCompact ? "gap-3" : "gap-6";

  return (
    <div className={spaceClass}>
      <WelcomeBanner roleName="Manager" isVisible={showWelcome} />

      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Team oversight and client management</p>
      </div>

      <QuickActionsPanel isVisible={showQuickActions} />

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${gapClass}`}>
        <StatCard
          title="My Clients"
          value={myClients.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Team Members"
          value={teamMembers.toString()}
          icon={<UserPlus className="h-5 w-5" />}
          variant="accent"
        />
        <StatCard
          title="Billable Hours (Today)"
          value="6.5h"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Red Zone Chats"
          value={redZoneChats.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant="danger"
        />
      </div>

      <div className={`grid lg:grid-cols-3 ${gapClass}`}>
        <div className="lg:col-span-2">
          <ClientAssignment />
        </div>
        <RecentActivities />
      </div>

      <div className={`grid lg:grid-cols-2 ${gapClass}`}>
        <TaskList />
        <RecentVisitors />
      </div>
    </div>
  );
}

function ReceptionistDashboard() {
  const { user } = useAuth();
  const { data: visitors = [] } = useVisitors();
  const { data: messages = [] } = useMessages();
  
  // Calculate today's visitors
  const todayVisitors = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitors.filter(v => {
      if (!v.checkInTime) return false;
      const checkInDate = new Date(v.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    });
  }, [visitors]);

  // Calculate visitors in meeting (checked in but not checked out)
  const inMeeting = useMemo(() => {
    return visitors.filter(v => v.status === 'active' && !v.checkOutTime).length;
  }, [visitors]);

  // Calculate unread messages
  const pendingMessages = useMemo(() => {
    return messages.filter(m => !m.isRead && m.senderType === 'client').length;
  }, [messages]);

  // Calculate conversions today (visitors converted to clients)
  const conversionsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitors.filter(v => {
      if (v.status !== 'converted') return false;
      if (!v.checkInTime) return false;
      const checkInDate = new Date(v.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }).length;
  }, [visitors]);

  const isCompact = user?.compactView ?? false;
  const showWelcome = user?.showWelcome ?? true;
  const showQuickActions = user?.showQuickActions ?? true;
  
  const spaceClass = isCompact ? "space-y-3" : "space-y-6";
  const gapClass = isCompact ? "gap-3" : "gap-6";

  return (
    <div className={spaceClass}>
      <WelcomeBanner roleName="Reception" isVisible={showWelcome} />

      <div>
        <h1 className="text-2xl font-bold">Reception Dashboard</h1>
        <p className="text-muted-foreground">Front desk operations</p>
      </div>

      <QuickActionsPanel isVisible={showQuickActions} />

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${gapClass}`}>
        <StatCard
          title="Today's Visitors"
          value={todayVisitors.length.toString()}
          icon={<UserPlus className="h-5 w-5" />}
          variant="accent"
        />
        <StatCard
          title="In Meeting"
          value={inMeeting.toString()}
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Messages"
          value={pendingMessages.toString()}
          icon={<MessageSquare className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Conversions Today"
          value={conversionsToday.toString()}
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className={`grid lg:grid-cols-3 ${gapClass}`}>
        <div className="lg:col-span-2">
          <RecentVisitors />
        </div>
        <TaskList />
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: employees = [] } = useEmployees();
  const { data: clients = [] } = useClients();
  const [showClientsModal, setShowClientsModal] = useState(false);
  
  // Find current employee record
  const currentEmployee = useMemo(() => {
    return employees.find(e => e.email === user?.email);
  }, [employees, user]);

  // Get clients assigned to this employee
  const myClients = useMemo(() => {
    if (!currentEmployee) return [];
    return clients.filter(c => c.assignedEmployee === currentEmployee.id);
  }, [clients, currentEmployee]);

  const { data: stats } = useTaskStats(currentEmployee?.id || '');
  
  const assignedCount = useMemo(() => {
    return stats?.statusBreakdown.reduce((sum, s) => sum + s._count.status, 0) || 0;
  }, [stats]);

  const completedCount = useMemo(() => {
    return stats?.statusBreakdown.find(s => s.status === 'completed')?._count.status || 0;
  }, [stats]);

  const isCompact = user?.compactView ?? false;
  const showWelcome = user?.showWelcome ?? true;
  const showQuickActions = user?.showQuickActions ?? true;
  
  const spaceClass = isCompact ? "space-y-3" : "space-y-6";
  const gapClass = isCompact ? "gap-3" : "gap-6";

  return (
    <div className={spaceClass}>
      <WelcomeBanner roleName="Employee" isVisible={showWelcome} />

      <div>
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Your personal task and workspace overview</p>
      </div>

      <QuickActionsPanel isVisible={showQuickActions} role="employee" onViewClients={() => setShowClientsModal(true)} />

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 ${gapClass}`}>
        <StatCard
          title="Assigned Tasks"
          value={assignedCount.toString()}
          icon={<CheckSquare className="h-5 w-5" />}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          variant="accent"
        />
        <StatCard
          title="Avg. Completion"
          value="2.4 days"
          icon={<Clock className="h-5 w-5" />}
        />
        <StatCard
          title="Overdue Tasks"
          value={stats?.overdueTasks?.toString() || "0"}
          icon={<AlertTriangle className="h-5 w-5" />}
          variant={stats?.overdueTasks && stats.overdueTasks > 0 ? "danger" : "default"}
        />
      </div>

      <div className={`grid lg:grid-cols-3 ${gapClass}`}>
        <div className="lg:col-span-2">
          <TaskList employeeId={currentEmployee?.id} />
        </div>
        <RecentActivities />
      </div>

      {/* View Clients Modal */}
      <Dialog open={showClientsModal} onOpenChange={setShowClientsModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" /> My Assigned Clients
            </DialogTitle>
          </DialogHeader>
          {myClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No clients assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-3 mt-2">
              {myClients.map(client => {
                const serviceProgress = client.services?.length ? Math.min((client.services.length / 5) * 100, 100) : 0;
                return (
                  <div key={client.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.company || client.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                          {client.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => { setShowClientsModal(false); navigate('/messages'); }}
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> Chat
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Services</span>
                        <span>{client.services?.length || 0} / 5</span>
                      </div>
                      <Progress value={serviceProgress} className="h-2" />
                    </div>
                    {client.services && client.services.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {client.services.map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <DashboardLayout>
      {user.role === 'super_admin' && <SuperAdminDashboard />}
      {user.role === 'manager' && <ManagerDashboard />}
      {user.role === 'receptionist' && <ReceptionistDashboard />}
      {user.role === 'employee' && <EmployeeDashboard />}
    </DashboardLayout>
  );
}
