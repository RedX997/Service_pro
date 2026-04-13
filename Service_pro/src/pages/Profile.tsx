import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Phone, MapPin, Building2, Briefcase, Calendar, CheckCircle2, FileText, Edit, Loader2, Camera } from 'lucide-react';
import { formatRoleName, getAvatarUrl } from '@/utils/auth';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api-client';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    job_title: user?.job_title || '',
    department: user?.department || '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', user.id.toString());
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('job_title', formData.job_title);
      formDataToSend.append('department', formData.department);
      
      if (avatarFile) {
        console.log('Appending avatar file:', avatarFile.name, avatarFile.size);
        formDataToSend.append('avatar', avatarFile);
      }

      // Using native fetch to ensure no interference with FormData and headers
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/profile`, {
        method: 'POST',
        headers: {
          'x-user-id': user.id.toString(),
        },
        body: formDataToSend,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      console.log('Update response:', updatedUser);
      
      if (updatedUser) {
        if (updatedUser._debug) {
          console.log('Server Debug:', updatedUser._debug);
        }
        updateUser(updatedUser);
        setIsEditDialogOpen(false);
        setAvatarFile(null);
        setPreviewUrl(null);
        toast({
          title: "Profile Updated",
          description: "Your profile information and photo have been successfully updated.",
        });
      }
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      let errorMsg = "Failed to update profile. Please try again.";
      
      // Try to extract server-side error message if available
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.error) errorMsg = errorData.error;
      } catch (e) {
        if (error.message && !error.message.includes('Failed to update profile')) {
          errorMsg = error.message;
        }
      }

      toast({
        title: "Update Failed",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Dummy data extending the available user data
  const profileDetails = {
    department: 'Operations',
    position: 'Senior Specialist',
    joinedDate: '1/15/2022',
    skills: ['Management', 'Communications', 'Operations', 'Client Relations'],
    manager: {
      name: 'John Manager',
      role: 'Director'
    }
  };

  const getPermissions = (role: string) => {
    switch(role) {
      case 'super_admin':
        return ['System Settings', 'User Management', 'Full Access', 'Communications', 'Billing', 'Security'];
      case 'manager':
        return ['Client Management', 'Task Management', 'Employee Management', 'Communications', 'Department Management'];
      default:
        return ['Client Management', 'Task Management', 'Communications'];
    }
  };

  const [activeClients, setActiveClients] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.id) return;
      setIsLoadingData(true);
      try {
        const [clientsRes, activityRes] = await Promise.all([
          apiClient.get('/auth/profile/clients'),
          apiClient.get('/auth/profile/activity')
        ]);
        setActiveClients(clientsRes as any[] || []);
        setActivityLogs(activityRes as any[] || []);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProfileData();
  }, [user?.id]);

  const permissions = getPermissions(user?.role || 'user');

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Profile</h1>
            <p className="text-sm text-slate-500">View and manage your profile information</p>
          </div>
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white flex items-center shadow-sm"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - ID Card */}
          <div className="space-y-6">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="h-24 w-24 bg-slate-100 text-slate-600 border-2 border-slate-200 dark:border-slate-800">
                    <AvatarImage 
                      key={user?.avatar_url}
                      src={getAvatarUrl(user?.avatar_url)} 
                      alt={user?.name || 'User'} 
                      className="object-cover" 
                    />
                    <AvatarFallback className="text-2xl font-bold bg-slate-100 dark:bg-slate-900">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h2>
                    <Badge variant="secondary" className="mt-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground">
                      {formatRoleName(user?.role)}
                    </Badge>
                  </div>
                </div>

                <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Mail className="h-4 w-4 mr-3 text-slate-400" />
                    {user?.email || 'email@example.com'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 mr-3 text-slate-400" />
                    {user?.phone || '+1 (555) 000-0000'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 mr-3 text-slate-400" />
                    {user?.address || '123 Main St, City, State, Zip'}
                  </div>
                </div>

                <div className="mt-6 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-500"><Building2 className="w-4 h-4 mr-2" /> Department</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{user?.department || profileDetails.department}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-500"><Briefcase className="w-4 h-4 mr-2" /> Position</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{user?.job_title || profileDetails.position}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="flex items-center text-slate-500"><Calendar className="w-4 h-4 mr-2" /> Joined</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{profileDetails.joinedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Skills & Expertise</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profileDetails.skills.map(skill => (
                    <Badge variant="outline" key={skill} className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Reporting Manager</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-slate-100 text-slate-600">
                    <AvatarFallback className="text-xs font-semibold">
                      {profileDetails.manager.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profileDetails.manager.name}</p>
                    <p className="text-xs text-slate-500">{profileDetails.manager.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Main Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-transparent border-b border-slate-200 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 mb-6 space-x-6">
                <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 data-[state=active]:shadow-none rounded-none px-0 py-2 bg-transparent text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 font-medium pb-2">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="clients" className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 data-[state=active]:shadow-none rounded-none px-0 py-2 bg-transparent text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 font-medium pb-2">
                  Clients
                </TabsTrigger>
                <TabsTrigger value="activity" className="data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-slate-100 data-[state=active]:shadow-none rounded-none px-0 py-2 bg-transparent text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-slate-100 font-medium pb-2">
                  Activity
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 outline-none">
                
                {/* Account Details Block */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Account Information</CardTitle>
                    <CardDescription>Your account and personal details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Full Name</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Email Address</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.email || 'email@example.com'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Phone Number</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.phone || '+1 (555) 000-0000'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Role</p>
                        <Badge variant="secondary" className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-primary dark:text-primary-foreground">
                          {formatRoleName(user?.role)}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Department</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profileDetails.department}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Position</p>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profileDetails.position}</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs text-slate-500 mb-1">Address</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.address || '123 Main St, City, State, Zip'}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Role Permissions Block */}
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-100">Role Permissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                      {permissions.map((perm) => (
                        <div key={perm} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">{perm}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>



              </TabsContent>

              <TabsContent value="clients">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    {isLoadingData ? (
                      <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                    ) : activeClients.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activeClients.map((client) => (
                          <div key={client.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold uppercase">
                                {client.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{client.name}</p>
                                <p className="text-xs text-slate-500">{client.company || 'Private Client'}</p>
                              </div>
                            </div>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {client.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500">
                        No assigned clients to display.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                  <CardContent className="p-0">
                    {isLoadingData ? (
                      <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                    ) : activityLogs.length > 0 ? (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {activityLogs.map((log) => (
                          <div key={log.id} className="p-4 flex gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-slate-900 dark:text-slate-100 font-medium">{log.description}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{new Date(log.createdAt).toLocaleString()}</span>
                                <span>•</span>
                                <span className="font-mono">{log.action}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-slate-500">
                        No recent activity to display.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </div>
        </div>

        {/* Edit Profile Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="relative group">
                  <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-slate-100 ring-offset-2 dark:ring-slate-800 dark:ring-offset-slate-950">
                    <AvatarImage src={previewUrl || getAvatarUrl(user?.avatar_url)} />
                    <AvatarFallback className="text-2xl">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="w-6 h-6" />
                  </label>
                  <input 
                    id="avatar-upload"
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
                <p className="text-xs text-slate-500">Click to change profile picture</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    placeholder="e.g. Receptionist"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Operations"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

