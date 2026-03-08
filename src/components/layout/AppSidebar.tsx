import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  Building2, 
  MessageSquare,
  Clock,
  FileText,
  Calendar,
  UserCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { UserRole } from '@/types';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'receptionist'] },
  { title: 'Visitor Log', url: '/visitors', icon: UserPlus, roles: ['receptionist', 'manager'] },
  { title: 'Clients', url: '/clients', icon: Users, roles: ['super_admin', 'manager', 'receptionist'] },
  { title: 'Messages', url: '/messages', icon: MessageSquare, roles: ['manager', 'receptionist'] },
  { title: 'Time Tracking', url: '/time-tracking', icon: Clock, roles: ['manager'] },
  { title: 'Appointments', url: '/appointments', icon: Calendar, roles: ['receptionist', 'manager'] },
  { title: 'Employees', url: '/employees', icon: UserCheck, roles: ['super_admin', 'manager'] },
  { title: 'Departments', url: '/departments', icon: Building2, roles: ['super_admin'] },
  { title: 'Reports', url: '/reports', icon: FileText, roles: ['super_admin', 'manager'] },
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['super_admin'] },
];

export function AppSidebar() {
  const { user, logout, switchRole } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'manager': return 'Manager';
      case 'receptionist': return 'Receptionist';
    }
  };

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-lg">
            SP
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">ServicePro</span>
              <span className="text-xs text-sidebar-foreground/70">Practice Management</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-2 text-sidebar-foreground hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="flex flex-col items-start text-left flex-1">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs text-sidebar-foreground/60">{getRoleLabel(user.role)}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onClick={() => switchRole('super_admin')}>
              Switch to Super Admin
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('manager')}>
              Switch to Manager
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchRole('receptionist')}>
              Switch to Receptionist
            </DropdownMenuItem>
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
