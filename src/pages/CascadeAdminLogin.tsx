import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Loader2, Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function CascadeAdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      // Only allow cascade_admin through this login
      if (data.role?.role_name !== 'cascade_admin') {
        setError('Access denied. This portal is for Cascade Admin only.');
        return;
      }

      login({
        id: data.id,
        name: data.name,
        role: 'cascade_admin',
      });

      navigate('/cascade-admin', { replace: true });
    } catch {
      setError('Unable to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Cascade Admin</h1>
          <p className="text-slate-400 text-sm mt-1">Company credential management portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Email</Label>
            <Input
              type="email"
              placeholder="cascade@admin.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-white/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300 text-sm">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-500 focus:border-white/40 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>

        <p className="text-center text-slate-600 text-xs mt-6">
          This portal is restricted to authorized company personnel only.
        </p>
      </div>
    </div>
  );
}
