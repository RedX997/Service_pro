import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Building2, Bell, Shield, Users, Mail, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { LocalStorage, STORAGE_KEYS } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface SettingsData {
  organization: {
    name: string;
    email: string;
    phone: string;
    website: string;
    address: string;
  };
  businessHours: {
    startTime: string;
    endTime: string;
    weekendOperations: boolean;
  };
  notifications: {
    redZoneAlerts: boolean;
    newClientNotifications: boolean;
    taskReminders: boolean;
    employeeUpdates: boolean;
    emailDigests: boolean;
  };
  email: {
    replyTo: string;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: boolean;
    ipWhitelisting: boolean;
  };
}

const defaultSettings: SettingsData = {
  organization: {
    name: 'ServicePro CA Firm',
    email: 'contact@servicepro.com',
    phone: '+91 22 1234 5678',
    website: 'https://servicepro.com',
    address: '123 Business Park, Mumbai, Maharashtra 400001',
  },
  businessHours: {
    startTime: '09:00',
    endTime: '18:00',
    weekendOperations: false,
  },
  notifications: {
    redZoneAlerts: true,
    newClientNotifications: true,
    taskReminders: true,
    employeeUpdates: false,
    emailDigests: true,
  },
  email: {
    replyTo: 'support@servicepro.com',
  },
  security: {
    twoFactorAuth: true,
    sessionTimeout: true,
    ipWhitelisting: false,
  },
};

export default function Settings() {
  const { toast } = useToast();
  
  // Load settings from localStorage
  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = LocalStorage.get(STORAGE_KEYS.SETTINGS, null);
    if (!saved) {
      LocalStorage.set(STORAGE_KEYS.SETTINGS, defaultSettings);
      return defaultSettings;
    }
    return saved;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    LocalStorage.set(STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  const updateOrganization = (field: keyof SettingsData['organization'], value: string) => {
    setSettings(prev => ({
      ...prev,
      organization: { ...prev.organization, [field]: value }
    }));
  };

  const updateBusinessHours = (field: keyof SettingsData['businessHours'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      businessHours: { ...prev.businessHours, [field]: value }
    }));
  };

  const updateNotifications = (field: keyof SettingsData['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  const updateEmail = (field: keyof SettingsData['email'], value: string) => {
    setSettings(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }));
  };

  const updateSecurity = (field: keyof SettingsData['security'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      security: { ...prev.security, [field]: value }
    }));
  };

  const handleSave = (section: string) => {
    toast({
      title: "Settings Saved",
      description: `${section} settings have been saved successfully`,
    });
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>Basic information about your practice</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <Input 
                      id="orgName" 
                      value={settings.organization.name}
                      onChange={(e) => updateOrganization('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={settings.organization.email}
                      onChange={(e) => updateOrganization('email', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={settings.organization.phone}
                      onChange={(e) => updateOrganization('phone', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input 
                      id="website" 
                      value={settings.organization.website}
                      onChange={(e) => updateOrganization('website', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={settings.organization.address}
                    onChange={(e) => updateOrganization('address', e.target.value)}
                  />
                </div>
                <Button onClick={() => handleSave('Organization')}>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Business Hours</CardTitle>
                    <CardDescription>Set your standard working hours</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      type="time" 
                      value={settings.businessHours.startTime}
                      onChange={(e) => updateBusinessHours('startTime', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      type="time" 
                      value={settings.businessHours.endTime}
                      onChange={(e) => updateBusinessHours('endTime', e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekend">Weekend Operations</Label>
                    <p className="text-sm text-muted-foreground">Enable Saturday operations</p>
                  </div>
                  <Switch 
                    id="weekend" 
                    checked={settings.businessHours.weekendOperations}
                    onCheckedChange={(checked) => updateBusinessHours('weekendOperations', checked)}
                  />
                </div>
                <Button onClick={() => handleSave('Business Hours')}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Configure how you receive alerts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Red Zone Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified when chats breach SLA</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.redZoneAlerts}
                      onCheckedChange={(checked) => updateNotifications('redZoneAlerts', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Client Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alert when new clients are onboarded</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.newClientNotifications}
                      onCheckedChange={(checked) => updateNotifications('newClientNotifications', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">Daily digest of pending tasks</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.taskReminders}
                      onCheckedChange={(checked) => updateNotifications('taskReminders', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Employee Updates</Label>
                      <p className="text-sm text-muted-foreground">Notifications about team activities</p>
                    </div>
                    <Switch 
                      checked={settings.notifications.employeeUpdates}
                      onCheckedChange={(checked) => updateNotifications('employeeUpdates', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Email Settings</CardTitle>
                    <CardDescription>Configure automated email notifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="replyTo">Reply-To Email</Label>
                  <Input 
                    id="replyTo" 
                    type="email" 
                    value={settings.email.replyTo}
                    onChange={(e) => updateEmail('replyTo', e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Digests</Label>
                    <p className="text-sm text-muted-foreground">Send daily summary emails</p>
                  </div>
                  <Switch 
                    checked={settings.notifications.emailDigests}
                    onCheckedChange={(checked) => updateNotifications('emailDigests', checked)}
                  />
                </div>
                <Button onClick={() => handleSave('Email')}>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>Manage access and authentication</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
                  </div>
                  <Switch 
                    checked={settings.security.twoFactorAuth}
                    onCheckedChange={(checked) => updateSecurity('twoFactorAuth', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto logout after inactivity</p>
                  </div>
                  <Switch 
                    checked={settings.security.sessionTimeout}
                    onCheckedChange={(checked) => updateSecurity('sessionTimeout', checked)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IP Whitelisting</Label>
                    <p className="text-sm text-muted-foreground">Restrict access to specific IPs</p>
                  </div>
                  <Switch 
                    checked={settings.security.ipWhitelisting}
                    onCheckedChange={(checked) => updateSecurity('ipWhitelisting', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <CardTitle>Access Control</CardTitle>
                    <CardDescription>Manage role-based permissions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button>Manage Roles & Permissions</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Services</CardTitle>
                <CardDescription>Manage third-party integrations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <span className="text-lg">📧</span>
                    </div>
                    <div>
                      <p className="font-medium">Email Service</p>
                      <p className="text-sm text-success">Connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <span className="text-lg">💬</span>
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Business</p>
                      <p className="text-sm text-success">Connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                <div className="p-4 rounded-lg border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-lg">📱</span>
                    </div>
                    <div>
                      <p className="font-medium">SMS Gateway</p>
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
