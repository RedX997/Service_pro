import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Clock, MessageCircle, Building2, Settings, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useClientCompanies } from '@/hooks/useClientPortal';

interface ClientPortalLayoutProps {
  children: React.ReactNode;
  clientId: string;
  clientName: string;
  onLogout: () => void;
  onSwitchCompany?: (clientId: string) => void;
}

const navItems = [
  { path: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/client/services', label: 'My Services', icon: FileText },
  { path: '/client/deadlines', label: 'Deadlines', icon: Clock },
  { path: '/client/messages', label: 'Messages', icon: MessageCircle },
  { path: '/client/profile', label: 'Profile', icon: Settings },
];

export default function ClientPortalLayout({ children, clientId, clientName, onLogout, onSwitchCompany }: ClientPortalLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const { data: companies = [] } = useClientCompanies(clientId);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r flex flex-col shadow-sm">
        {/* Logo + Company Switcher */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-bold text-slate-800 dark:text-slate-100">Client Portal</span>
          </div>

          {/* Company Switcher */}
          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium truncate">{clientName}</span>
            </div>
            <div className="flex items-center gap-1">
              {companies.length > 0 && (
                <Badge variant="secondary" className="text-xs px-1.5">{companies.length + 1}</Badge>
              )}
              <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', showSwitcher && 'rotate-180')} />
            </div>
          </button>

          {/* Dropdown */}
          {showSwitcher && companies.length > 0 && (
            <div className="mt-1 rounded-lg border bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
              {companies.map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => { onSwitchCompany?.(c.clientId); setShowSwitcher(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 text-left text-sm"
                >
                  <div className={cn('h-2 w-2 rounded-full', c.urgentDeadlines > 0 ? 'bg-red-500' : 'bg-green-500')} />
                  <span className="truncate">{c.client?.name || c.clientId}</span>
                  <Badge variant="outline" className="ml-auto text-xs">{c.profile?.entityType || 'Client'}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-500" onClick={onLogout}>
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
