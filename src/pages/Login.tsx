import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { executeLoginFlow } from '@/utils/loginHandler';
import { getDashboardRoute } from '@/utils/rbac';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated — go to the right dashboard for their role
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDashboardRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await executeLoginFlow(email, password, {
      login,
      navigate,
      onError: setError
    });

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex w-full">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] animate-pulse-soft" />
          <div className="absolute top-[40%] right-[10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[100px] animate-pulse-soft" style={{ animationDelay: '1s' }} />
          <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[100px]" />
        </div>

        <div className="relative z-10 w-full flex flex-col justify-between p-16">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-xl shadow-primary/20">
              <span className="font-bold text-2xl">SP</span>
            </div>
            <span className="text-3xl font-bold text-white tracking-tight">ServicePro</span>
          </div>

          <div className="space-y-8 max-w-lg">
            <h1 className="text-5xl font-extrabold text-white leading-[1.15]">
              Practice <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-foreground to-accent">Management</span> Redefined.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed">
              Experience seamless end-to-end visibility. From walk-in visitors to retainer clients, we ensure accountability and SLA compliance at every step.
            </p>

            <div className="flex gap-8 pt-4 border-t border-white/10">
              <div>
                <p className="text-4xl font-bold text-white mb-1">500+</p>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Active Clients</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-white mb-1">99%</p>
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">SLA Score</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            © 2024 ServicePro Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute top-0 right-0 p-8 hidden md:block">
          <Button variant="ghost" className="gap-2">
            Need help? <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-full max-w-md animate-slide-up space-y-8">
          <div className="lg:hidden text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
                SP
              </div>
              <span className="text-2xl font-bold">ServicePro</span>
            </div>
          </div>

          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <Card className="border-0 shadow-none lg:shadow-xl lg:border lg:bg-card/50 lg:backdrop-blur-sm">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 pr-10 bg-background/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 text-base shadow-lg hover:shadow-primary/25 transition-all" loading={isLoading}>
                  {!isLoading && <LogIn className="mr-2 h-4 w-4" />}
                  Sign In
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">Test Credentials</span>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">Available Test Accounts:</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Super Admin:</strong> admin@servicepro.com / admin123</p>
                  <p><strong>Manager:</strong> manager@servicepro.com / manager123</p>
                  <p><strong>Receptionist:</strong> receptionist@servicepro.com / receptionist123</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            By clicking "Sign In", you agree to our <a href="#" className="underline hover:text-primary">Terms of Service</a> and <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
