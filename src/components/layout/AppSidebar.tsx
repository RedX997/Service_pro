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
  ChevronRight,
  CheckSquare,
  Briefcase,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import { UserRole } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  url?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  subItems?: MenuItem[];
}

const mainMenuItems: MenuItem[] = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard, roles: ['super_admin', 'manager', 'receptionist', 'employee'] },
  { 
    title: 'Users', 
    icon: Users, 
    roles: ['super_admin', 'manager', 'receptionist'],
    subItems: [
      { title: 'Employees', url: '/employees', icon: UserCheck, roles: ['super_admin', 'manager'] },
      { title: 'Clients', url: '/clients', icon: Users, roles: ['super_admin', 'manager', 'receptionist'] },
      { title: 'Visitors', url: '/visitors', icon: UserPlus, roles: ['receptionist', 'manager'] },
    ]
  },
  { 
    title: 'Organization', 
    icon: Building2, 
    roles: ['super_admin'],
    subItems: [
      { title: 'Departments', url: '/departments', icon: Building2, roles: ['super_admin'] },
      { title: 'Services', url: '/services', icon: Briefcase, roles: ['super_admin'] }
    ]
  },
  { title: 'Communications', url: '/messages', icon: MessageSquare, roles: ['manager', 'receptionist', 'employee'] },
  { title: 'Tasks', url: '/tasks', icon: CheckSquare, roles: ['super_admin', 'manager', 'receptionist', 'employee'] },
  { title: 'Calendar', url: '/appointments', icon: Calendar, roles: ['super_admin', 'receptionist', 'manager', 'employee'] },
  { title: 'Time Tracking', url: '/time-tracking', icon: Clock, roles: ['manager'] },
  { title: 'Reports', url: '/reports', icon: FileText, roles: ['super_admin', 'manager'] },
];

const bottomMenuItems: MenuItem[] = [
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['super_admin', 'manager', 'receptionist', 'employee'] },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const collapsed = state === 'collapsed';

  if (!user) return null;

  const filteredMainMenuItems = mainMenuItems.filter(item => item.roles.includes(user.role));
  const filteredBottomMenuItems = bottomMenuItems.filter(item => item.roles.includes(user.role));

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'manager': return 'Manager';
      case 'receptionist': return 'Receptionist';
      case 'employee': return 'Employee';
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
        {/* Go Back Button */}
        <div className="px-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className={cn(
              "w-full justify-start gap-3 h-9 px-3 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200",
              collapsed ? "px-0 justify-center" : ""
            )}
            title="Go Back"
          >
            <ArrowLeft className="h-4 w-4" />
            {!collapsed && <span className="text-xs font-medium uppercase tracking-wider">Go Back</span>}
          </Button>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-2">
            {!collapsed && 'Main Menu'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainMenuItems.map((item) => {
                if (item.subItems) {
                  const filteredSubItems = item.subItems.filter(sub => sub.roles.includes(user.role));
                  if (filteredSubItems.length === 0) return null;

                  return (
                    <Collapsible key={item.title} className="group/collapsible" defaultOpen>
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full cursor-pointer">
                            <item.icon className="h-5 w-5 shrink-0" />
                            {!collapsed && (
                              <>
                                <span className="flex-1 text-left">{item.title}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                              </>
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {!collapsed && (
                            <SidebarMenuSub className="pl-6 pr-0 py-1 space-y-1">
                              {filteredSubItems.map(subItem => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink 
                                      to={subItem.url!} 
                                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors w-full"
                                      activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                                    >
                                      <subItem.icon className="h-4 w-4 shrink-0" />
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url!} 
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground font-medium"
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            
            {filteredBottomMenuItems.length > 0 && (
              <>
                <SidebarSeparator className="my-4 mx-2" />
                <SidebarMenu>
                  {filteredBottomMenuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink 
                          to={item.url!} 
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
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 h-auto p-2 text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage key={user?.avatar_url} src={getAvatarUrl(user?.avatar_url)} className="object-cover" />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col items-start text-left flex-1">
                <span className="text-sm font-medium">{user?.name || 'User'}</span>
                <span className="text-xs text-sidebar-foreground/60">{user?.role ? getRoleLabel(user.role) : 'No role'}</span>
              </div>
            )}
          </Button>
          
          {!collapsed && (
            <Button
              onClick={logout}
              variant="ghost"
              className="w-full justify-start gap-3 p-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all duration-200 animate-in slide-in-from-top-2 fade-in-0"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
