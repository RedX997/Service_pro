import { ReactNode, useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { formatRoleName, getAvatarUrl } from '@/utils/auth';
import { NotificationBell } from '@/components/NotificationBell';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Settings, HelpCircle, LogOut } from 'lucide-react';
import { useEmployeeSocket } from '@/hooks/useEmployeeSocket';
import { useToast } from '@/hooks/use-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── Real-time employee updates ───────────────────────────────────────────
  // Mount once per session; updates React Query cache & triggers toast
  const { lastCreatedEmployee } = useEmployeeSocket(user?.id?.toString());

  useEffect(() => {
    if (!lastCreatedEmployee) return;
    // Only notify admins and managers about new employee onboarding
    if (user?.role !== 'super_admin' && user?.role !== 'manager') return;
    toast({
      title: '🎉 New Employee Onboarded',
      description: lastCreatedEmployee.message,
      duration: 6000,
    });
  }, [lastCreatedEmployee, user?.role]);
  // ────────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <DashboardErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
                <h2 className="text-lg font-semibold tracking-tight hidden md:block">ServicePro</h2>
                <h2 className="text-lg font-semibold tracking-tight block md:hidden">SP</h2>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <NotificationBell />
                <div className="h-8 w-px bg-border" />
                
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-3 focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10 bg-primary/10 border-2 border-background shadow-md">
                      <AvatarImage 
                        key={user?.avatar_url}
                        src={getAvatarUrl(user?.avatar_url)} 
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'G'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden sm:block">
                      <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">{user?.name || 'Guest'}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {formatRoleName(user?.role)}
                      </p>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2 shadow-card border-border">
                    <DropdownMenuLabel className="font-normal border-b pb-2 mb-1">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground capitalize">
                          {formatRoleName(user?.role)}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer py-2">
                      <User className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer py-2">
                      <Settings className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/support')} className="cursor-pointer py-2">
                      <HelpCircle className="mr-2 h-4 w-4 text-slate-500" />
                      <span>Support</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-700 py-2">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DashboardErrorBoundary>
  );
}
