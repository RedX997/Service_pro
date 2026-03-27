import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, RefreshCw, ShieldCheck, UserX, UserCheck, LogOut, Eye, EyeOff, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface ManagedUser {
  id: number;
  name: string;
  email: string;
  personal_email: string | null;
  is_active: boolean;
  last_login_at: string | null;
  job_title: string | null;
  created_at: string;
  role: { role_name: string };
}

interface CredentialRecord {
  id: number;
  full_name: string;
  role_name: string;
  system_email: string;
  personal_email: string;
  plain_password: string;
  is_active: boolean;
  created_at: string;
}

const roleLabels: Record<string, string> = {
  receptionist: 'Receptionist',
  manager: 'Manager',
  super_admin: 'Super Admin',
};

const roleBadgeClass: Record<string, string> = {
  receptionist: 'bg-blue-100 text-blue-800',
  manager: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-orange-100 text-orange-800',
};

export default function CascadeAdminDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [credentials, setCredentials] = useState<CredentialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [credsLoading, setCredsLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<number | null>(null);
  const [sessionUserId, setSessionUserId] = useState<number | null>(null);
  const [sessionUserName, setSessionUserName] = useState('');
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [form, setForm] = useState({ fullName: '', personalEmail: '', role: '' });

  const headers = {
    'Content-Type': 'application/json',
    'x-user-id': String(user?.id ?? ''),
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/cascade-admin/users`, { headers });
      if (res.ok) setUsers(await res.json());
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredentials = async () => {
    try {
      const res = await fetch(`${API_URL}/cascade-admin/credentials`, { headers });
      if (res.ok) setCredentials(await res.json());
    } catch (err) {
      console.error('Failed to fetch credentials', err);
    } finally {
      setCredsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); fetchCredentials(); }, []);

  const togglePasswordVisibility = (id: number) => {
    setVisiblePasswords(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openSessions = async (userId: number, userName: string) => {
    setSessionUserId(userId);
    setSessionUserName(userName);
    setSessionsLoading(true);
    setSessions([]);
    try {
      const res = await fetch(`${API_URL}/cascade-admin/users/${userId}/sessions`, { headers });
      if (res.ok) setSessions(await res.json());
    } catch {}
    finally { setSessionsLoading(false); }
  };

  // Preview system email as user types
  const previewEmail = () => {
    if (!form.fullName || !form.role) return '';
    const slug = form.fullName.trim().toLowerCase().replace(/\s+/g, '.');
    const roleTag = form.role.replace('_', '');
    return `${slug}.${roleTag}ca@gmail.com`;
  };

  const handleCreate = async () => {
    if (!form.fullName || !form.personalEmail || !form.role) {
      toast({ title: 'Error', description: 'All fields are required', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/cascade-admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: 'User Created', description: `Credentials sent to ${form.personalEmail}` });
      setForm({ fullName: '', personalEmail: '', role: '' });
      setIsDialogOpen(false);
      fetchUsers();
      fetchCredentials();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = async (id: number, name: string) => {
    if (!confirm(`Regenerate password for ${name}? New credentials will be emailed.`)) return;
    setRegeneratingId(id);
    try {
      const res = await fetch(`${API_URL}/cascade-admin/users/${id}/regenerate`, {
        method: 'PATCH', headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast({ title: 'Password Regenerated', description: 'New credentials emailed successfully' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      const res = await fetch(`${API_URL}/cascade-admin/users/${id}/toggle`, {
        method: 'PATCH', headers,
      });
      if (!res.ok) throw new Error('Failed to toggle');
      setUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !isActive } : u));
      toast({ title: isActive ? 'User Deactivated' : 'User Activated' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    receptionist: users.filter(u => u.role.role_name === 'receptionist').length,
    manager: users.filter(u => u.role.role_name === 'manager').length,
    super_admin: users.filter(u => u.role.role_name === 'super_admin').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-800 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">Cascade Admin</h1>
            <p className="text-xs text-muted-foreground">Credential Management System</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-red-500 hover:text-red-600">
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Total Users', value: stats.total },
            { label: 'Active', value: stats.active },
            { label: 'Receptionists', value: stats.receptionist },
            { label: 'Managers', value: stats.manager },
            { label: 'Super Admins', value: stats.super_admin },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="pt-4 pb-3">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs: Users + Credentials Log */}
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Managed Users</TabsTrigger>
            <TabsTrigger value="credentials">Credentials Log</TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Managed Users</CardTitle>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Create User
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No users yet. Create the first one.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Name</th>
                          <th className="pb-3 pr-4 font-medium">System Email</th>
                          <th className="pb-3 pr-4 font-medium">Personal Email</th>
                          <th className="pb-3 pr-4 font-medium">Role</th>
                          <th className="pb-3 pr-4 font-medium">Job Title</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 pr-4 font-medium">Created</th>
                          <th className="pb-3 pr-4 font-medium">Last Login</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {users.map(u => (
                          <tr key={u.id} className={!u.is_active ? 'opacity-50' : ''}>
                            <td className="py-3 pr-4 font-medium">{u.name}</td>
                            <td className="py-3 pr-4 text-muted-foreground font-mono text-xs">{u.email}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{u.personal_email || '—'}</td>
                            <td className="py-3 pr-4">
                              <Badge className={roleBadgeClass[u.role.role_name] || ''}>
                                {roleLabels[u.role.role_name] || u.role.role_name}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-sm text-muted-foreground">
                              {u.job_title || '—'}
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className={u.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                                {u.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 pr-4 text-xs text-muted-foreground">
                              {u.last_login_at ? new Date(u.last_login_at).toLocaleString() : 'Never'}
                            </td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline" size="sm"
                                  onClick={() => openSessions(u.id, u.name)}
                                  title="View login history"
                                >
                                  <Clock className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline" size="sm"
                                  onClick={() => handleRegenerate(u.id, u.name)}
                                  disabled={regeneratingId === u.id}
                                  title="Regenerate password"
                                >
                                  {regeneratingId === u.id
                                    ? <Loader2 className="h-3 w-3 animate-spin" />
                                    : <RefreshCw className="h-3 w-3" />}
                                </Button>
                                <Button
                                  variant="outline" size="sm"
                                  onClick={() => handleToggle(u.id, u.is_active)}
                                  title={u.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {u.is_active
                                    ? <UserX className="h-3 w-3 text-red-500" />
                                    : <UserCheck className="h-3 w-3 text-green-500" />}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credentials Log Tab */}
          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Credentials Log</CardTitle>
                <p className="text-sm text-muted-foreground">Full credential record — company access only. Passwords shown here are the ones sent to users.</p>
              </CardHeader>
              <CardContent>
                {credsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : credentials.length === 0 ? (
                  <p className="text-center text-muted-foreground py-12">No credentials logged yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-3 pr-4 font-medium">Name</th>
                          <th className="pb-3 pr-4 font-medium">Role</th>
                          <th className="pb-3 pr-4 font-medium">System Email</th>
                          <th className="pb-3 pr-4 font-medium">Personal Email</th>
                          <th className="pb-3 pr-4 font-medium">Password</th>
                          <th className="pb-3 pr-4 font-medium">Status</th>
                          <th className="pb-3 font-medium">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {credentials.map(c => (
                          <tr key={c.id} className={!c.is_active ? 'opacity-50' : ''}>
                            <td className="py-3 pr-4 font-medium">{c.full_name}</td>
                            <td className="py-3 pr-4">
                              <Badge className={roleBadgeClass[c.role_name] || ''}>
                                {roleLabels[c.role_name] || c.role_name}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{c.system_email}</td>
                            <td className="py-3 pr-4 text-muted-foreground">{c.personal_email}</td>
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs">
                                  {visiblePasswords.has(c.id) ? c.plain_password : '••••••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(c.id)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  {visiblePasswords.has(c.id)
                                    ? <EyeOff className="h-3 w-3" />
                                    : <Eye className="h-3 w-3" />}
                                </button>
                              </div>
                            </td>
                            <td className="py-3 pr-4">
                              <Badge className={c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                                {c.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground text-xs">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Session History Dialog */}
      <Dialog open={sessionUserId !== null} onOpenChange={() => setSessionUserId(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Login History — {sessionUserName}</DialogTitle>
            <DialogDescription>Last 50 sessions</DialogDescription>
          </DialogHeader>
          {sessionsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : sessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No login history yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Login</th>
                  <th className="pb-2 pr-4 font-medium">Logout</th>
                  <th className="pb-2 pr-4 font-medium">Duration</th>
                  <th className="pb-2 font-medium">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sessions.map((s: any) => (
                  <tr key={s.id}>
                    <td className="py-2 pr-4 text-xs">{new Date(s.logged_in_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {s.logged_out_at ? new Date(s.logged_out_at).toLocaleString() : <span className="text-green-600">Active</span>}
                    </td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {s.duration_minutes != null ? `${s.duration_minutes} min` : '—'}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">{s.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Credentials will be auto-generated and emailed to the personal address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input
                placeholder="John Doe"
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Personal Email</Label>
              <Input
                type="email"
                placeholder="john@gmail.com"
                value={form.personalEmail}
                onChange={e => setForm({ ...form, personalEmail: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="receptionist">Receptionist</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {previewEmail() && (
              <div className="rounded-md bg-muted px-3 py-2">
                <p className="text-xs text-muted-foreground mb-1">System email preview</p>
                <p className="text-sm font-mono font-medium">{previewEmail()}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Send Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
