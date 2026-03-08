import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/ui/stat-card';
import { RecentVisitors } from '@/components/dashboard/RecentVisitors';
import { RedZoneChats } from '@/components/dashboard/RedZoneChats';
import { TaskList } from '@/components/dashboard/TaskList';
import { ClientAssignment } from '@/components/dashboard/ClientAssignment';
import { Users, UserPlus, Clock, MessageSquare, Building2, FileText, AlertTriangle } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useVisitors } from '@/hooks/useVisitors';
import { useMemo } from 'react';

function SuperAdminDashboard() {
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();

  // Calculate active employees
  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status === 'active').length;
  }, [employees]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          value="8"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Services"
          value="32"
          icon={<FileText className="h-5 w-5" />}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TaskList />
        <ClientAssignment />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentVisitors />
        </div>
        <RedZoneChats />
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const { user } = useAuth();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: employees = [] } = useEmployees();
  
  // Get messages from localStorage
  const messages = useMemo(() => {
    const stored = localStorage.getItem('servicepro_messages');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Debug logging
  console.log('Manager Dashboard - Clients:', clients.length, clients);
  console.log('Manager Dashboard - Employees:', employees.length);
  console.log('Manager Dashboard - Messages:', messages.length);

  // Calculate my clients (all clients for manager view)
  const myClients = useMemo(() => {
    // Show all clients for managers (they oversee all)
    return clients.length;
  }, [clients]);

  // Calculate team members (all active employees for manager view)
  const teamMembers = useMemo(() => {
    return employees.filter(e => e.status === 'active').length;
  }, [employees]);

  // Calculate red zone chats (unread messages older than 24 hours)
  const redZoneChats = useMemo(() => {
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    return messages.filter(m => !m.isRead && new Date(m.timestamp) < oneDayAgo).length;
  }, [messages]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Team oversight and client management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ClientAssignment />
        </div>
        <RedZoneChats />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TaskList />
        <RecentVisitors />
      </div>
    </div>
  );
}

function ReceptionistDashboard() {
  const { data: visitors = [] } = useVisitors();
  
  // Get messages from localStorage
  const messages = useMemo(() => {
    const stored = localStorage.getItem('servicepro_messages');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Calculate today's visitors
  const todayVisitors = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitors.filter(v => {
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
    return messages.filter(m => !m.isRead).length;
  }, [messages]);

  // Calculate conversions today (visitors converted to clients)
  const conversionsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return visitors.filter(v => {
      if (v.status !== 'converted') return false;
      const checkInDate = new Date(v.checkInTime);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }).length;
  }, [visitors]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reception Dashboard</h1>
        <p className="text-muted-foreground">Front desk operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentVisitors />
        </div>
        <TaskList />
      </div>
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
    </DashboardLayout>
  );
}
