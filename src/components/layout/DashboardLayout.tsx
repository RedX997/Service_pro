import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { DashboardErrorBoundary } from './DashboardErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { formatRoleName } from '@/utils/auth';
import { NotificationBell } from '@/components/NotificationBell';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();

  return (
    <DashboardErrorBoundary>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-card flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="h-8 w-px bg-border" />
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium">{user?.name || 'Guest'}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {formatRoleName(user?.role)}
                  </p>
                </div>
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
