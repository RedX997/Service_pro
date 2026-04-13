import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Monitor, Save, Check, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { notifications, markAsRead, deleteNotification, markAllAsRead } = useNotifications();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize data matching the DB structure and user context
  const [accountData, setAccountData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || 'user',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    zip: user?.zip || '',
    timezone: user?.timezone || 'System Default'
  });

  const [appearanceData, setAppearanceData] = useState(() => ({
    theme: user?.theme || localStorage.getItem('theme') || 'light',
    compactView: user?.compactView ?? JSON.parse(localStorage.getItem('compactView') || 'false'),
    showWelcome: user?.showWelcome ?? JSON.parse(localStorage.getItem('showWelcome') || 'true'),
    showQuickActions: user?.showQuickActions ?? JSON.parse(localStorage.getItem('showQuickActions') || 'true'),
    highContrast: user?.highContrast ?? JSON.parse(localStorage.getItem('highContrast') || 'false'),
    fontSize: user?.fontSize || localStorage.getItem('fontSize') || 'Medium',
  }));

  // Live preview effect for theme, contrast, and font size
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'high-contrast');

    const applyTheme = appearanceData.theme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : appearanceData.theme;
      
    root.classList.add(applyTheme);
    if (appearanceData.highContrast) root.classList.add('high-contrast');

    switch(appearanceData.fontSize) {
      case 'Small': root.style.fontSize = '14px'; break;
      case 'Medium': root.style.fontSize = '16px'; break;
      case 'Large': root.style.fontSize = '18px'; break;
      case 'Extra Large': root.style.fontSize = '20px'; break;
      default: root.style.fontSize = '16px';
    }
  }, [appearanceData.theme, appearanceData.highContrast, appearanceData.fontSize]);

  const handleAppearanceSave = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    
    // Save locally
    localStorage.setItem('theme', appearanceData.theme);
    localStorage.setItem('compactView', JSON.stringify(appearanceData.compactView));
    localStorage.setItem('showWelcome', JSON.stringify(appearanceData.showWelcome));
    localStorage.setItem('showQuickActions', JSON.stringify(appearanceData.showQuickActions));
    localStorage.setItem('highContrast', JSON.stringify(appearanceData.highContrast));
    localStorage.setItem('fontSize', appearanceData.fontSize);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          theme: appearanceData.theme,
          compactView: appearanceData.compactView,
          showWelcome: appearanceData.showWelcome,
          showQuickActions: appearanceData.showQuickActions,
          highContrast: appearanceData.highContrast,
          fontSize: appearanceData.fontSize
        }),
      });

      if (!response.ok) throw new Error('Failed to save settings');
      const updatedDbUser = await response.json();
      updateUser(updatedDbUser);

      toast({
        title: "Appearance Saved",
        description: "Your appearance preferences have been applied and synced everywhere.",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name: accountData.fullName,
          email: accountData.email,
          phone: accountData.phone,
          address: accountData.address,
          city: accountData.city,
          state: accountData.state,
          zip: accountData.zip,
          timezone: accountData.timezone
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const updatedDbUser = await response.json();
      
      // Update global auth context
      updateUser({
        name: updatedDbUser.name,
        email: updatedDbUser.email,
        phone: updatedDbUser.phone,
        address: updatedDbUser.address,
        city: updatedDbUser.city,
        state: updatedDbUser.state,
        zip: updatedDbUser.zip,
        timezone: updatedDbUser.timezone
      });

      toast({
        title: "Settings Saved",
        description: "Your account preferences have been saved successfully.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const navItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Monitor },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account preferences and application settings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Navigation */}
          <Card className="w-full md:w-[240px] h-fit p-2 shadow-sm border-slate-200">
             <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => setActiveTab(item.id)}
                    className={`justify-start w-full px-4 font-normal ${
                      isActive 
                        ? 'bg-slate-100 text-slate-900 font-medium' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`h-4 w-4 mr-3 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                    {item.label}
                  </Button>
                );
              })}
             </nav>
          </Card>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'account' && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-slate-900">Account Information</CardTitle>
                  <CardDescription className="text-slate-500">
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-xs text-slate-700 font-medium">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={accountData.fullName}
                        onChange={(e) => setAccountData({...accountData, fullName: e.target.value})}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs text-slate-700 font-medium">Email Address</Label>
                      <Input 
                        id="email" 
                        type="email"
                        value={accountData.email}
                        onChange={(e) => setAccountData({...accountData, email: e.target.value})}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-xs text-slate-700 font-medium">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={accountData.phone}
                        onChange={(e) => setAccountData({...accountData, phone: e.target.value})}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-xs text-slate-700 font-medium">Role</Label>
                      <Input 
                        id="role" 
                        value={accountData.role}
                        readOnly
                        disabled
                        className="bg-slate-50 border-slate-200 text-slate-500"
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Address Grid */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-xs text-slate-700 font-medium">Address</Label>
                      <Input 
                        id="address" 
                        value={accountData.address}
                        onChange={(e) => setAccountData({...accountData, address: e.target.value})}
                        className="bg-white border-slate-200"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="city" className="text-xs text-slate-700 font-medium">City</Label>
                        <Input 
                          id="city" 
                          value={accountData.city}
                          onChange={(e) => setAccountData({...accountData, city: e.target.value})}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-xs text-slate-700 font-medium">State</Label>
                        <Input 
                          id="state" 
                          value={accountData.state}
                          onChange={(e) => setAccountData({...accountData, state: e.target.value})}
                          className="bg-white border-slate-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip" className="text-xs text-slate-700 font-medium">Zip Code</Label>
                        <Input 
                          id="zip" 
                          value={accountData.zip}
                          onChange={(e) => setAccountData({...accountData, zip: e.target.value})}
                          className="bg-white border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Timezone */}
                  <div className="space-y-2 pb-8">
                    <Label className="text-xs text-slate-700 font-medium">Timezone</Label>
                    <Select value={accountData.timezone} onValueChange={(val) => setAccountData({...accountData, timezone: val})}>
                      <SelectTrigger className="w-full bg-white border-slate-200">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="System Default">System Default</SelectItem>
                        <SelectItem value="EST">Eastern Standard Time (EST)</SelectItem>
                        <SelectItem value="CST">Central Standard Time (CST)</SelectItem>
                        <SelectItem value="PST">Pacific Standard Time (PST)</SelectItem>
                        <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white flex items-center shadow-sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4 flex flex-row items-center justify-between border-b border-slate-100">
                  <div>
                    <CardTitle className="text-lg font-bold text-slate-900">Notifications</CardTitle>
                    <CardDescription className="text-slate-500">
                      View all your recent real-time system alerts
                    </CardDescription>
                  </div>
                  {notifications.some(n => !n.read) && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-slate-500 hover:text-slate-900">
                      <Check className="h-4 w-4 mr-2" /> Mark all read
                    </Button>
                  )}
                </CardHeader>
                <div className="divide-y divide-slate-100 max-h-[600px] overflow-auto">
                  {notifications.length === 0 ? (
                     <div className="py-12 text-center text-slate-500">No notifications to display</div>
                  ) : (
                    notifications.map((notification) => {
                      const getTypeIcon = (type: string) => {
                        switch (type) {
                          case 'visitor': return '👤';
                          case 'message': return '💬';
                          case 'appointment': return '📅';
                          case 'timer': return '⏱️';
                          case 'task': return '✓';
                          case 'system': return '⚙️';
                          default: return '📬';
                        }
                      };
                      return (
                        <div key={notification.id} className={`p-4 flex gap-4 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}>
                          <div className="text-2xl mt-1 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-slate-900 pr-4">{notification.title}</h4>
                              {!notification.read && <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>}
                            </div>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-3">{notification.message}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs text-slate-500">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </span>
                              <div className="flex items-center gap-2">
                                {!notification.read && (
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => markAsRead(notification.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => deleteNotification(notification.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card className="shadow-sm border-slate-200">
                <CardHeader className="pb-4 border-b border-slate-100">
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Appearance Settings</CardTitle>
                  <CardDescription className="text-slate-500">
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  
                  {/* Theme Section */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Light */}
                      <div 
                        onClick={() => setAppearanceData({...appearanceData, theme: 'light'})}
                        className={`cursor-pointer border-2 rounded-lg p-2 ${appearanceData.theme === 'light' ? 'border-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="h-20 w-full mb-2 rounded border bg-white shadow-sm"></div>
                        <p className="text-center text-sm font-medium text-slate-900 dark:text-slate-100">Light</p>
                      </div>
                      
                      {/* Dark */}
                      <div 
                        onClick={() => setAppearanceData({...appearanceData, theme: 'dark'})}
                        className={`cursor-pointer border-2 rounded-lg p-2 ${appearanceData.theme === 'dark' ? 'border-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="h-20 w-full mb-2 rounded bg-slate-900 shadow-sm border border-slate-800"></div>
                        <p className="text-center text-sm font-medium text-slate-900 dark:text-slate-100">Dark</p>
                      </div>
                      
                      {/* System */}
                      <div 
                        onClick={() => setAppearanceData({...appearanceData, theme: 'system'})}
                        className={`cursor-pointer border-2 rounded-lg p-2 ${appearanceData.theme === 'system' ? 'border-primary' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                      >
                        <div className="h-20 w-full mb-2 rounded border bg-gradient-to-b from-slate-900 to-white shadow-sm"></div>
                        <p className="text-center text-sm font-medium text-slate-900 dark:text-slate-100">System</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Dashboard Layout Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Dashboard Layout</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Compact View</Label>
                        <p className="text-xs text-slate-500">Display more content with less spacing</p>
                      </div>
                      <Switch 
                        checked={appearanceData.compactView} 
                        onCheckedChange={(c) => setAppearanceData({...appearanceData, compactView: c})} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Show Welcome Message</Label>
                        <p className="text-xs text-slate-500">Display welcome message on dashboard</p>
                      </div>
                      <Switch 
                        checked={appearanceData.showWelcome} 
                        onCheckedChange={(c) => setAppearanceData({...appearanceData, showWelcome: c})} 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Show Quick Actions</Label>
                        <p className="text-xs text-slate-500">Display quick action buttons on dashboard</p>
                      </div>
                      <Switch 
                        checked={appearanceData.showQuickActions} 
                        onCheckedChange={(c) => setAppearanceData({...appearanceData, showQuickActions: c})} 
                      />
                    </div>
                  </div>

                  <Separator className="bg-slate-100" />

                  {/* Accessibility Section */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Accessibility</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">High Contrast Mode</Label>
                        <p className="text-xs text-slate-500">Increase contrast for better visibility</p>
                      </div>
                      <Switch 
                        checked={appearanceData.highContrast} 
                        onCheckedChange={(c) => setAppearanceData({...appearanceData, highContrast: c})} 
                      />
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-0.5 min-w-0">
                        <Label className="text-sm font-medium text-slate-800 dark:text-slate-200">Font Size</Label>
                        <p className="text-xs text-slate-500">Adjust the text size of the application</p>
                      </div>
                      <Select 
                        value={appearanceData.fontSize} 
                        onValueChange={(val) => setAppearanceData({...appearanceData, fontSize: val})}
                      >
                        <SelectTrigger className="w-full md:w-[150px] bg-white border-slate-200">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Small">Small</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Large">Large</SelectItem>
                          <SelectItem value="Extra Large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleAppearanceSave} disabled={isSaving} className="bg-slate-900 hover:bg-slate-800 text-white flex items-center shadow-sm">
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Stub content for other tabs */}
            {!['account', 'notifications', 'appearance'].includes(activeTab) && (
              <Card className="shadow-sm border-slate-200 h-[400px] flex items-center justify-center">
                 <p className="text-slate-400 capitalize">{activeTab} settings coming soon...</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
