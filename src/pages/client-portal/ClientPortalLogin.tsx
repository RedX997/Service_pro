/**
 * ClientPortalLogin.tsx
 * Temporary login for Phase 1 — client enters their Client ID (UUID from DB)
 * Phase 2 will replace this with OTP-based mobile login
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Props {
  onLogin: (clientId: string, clientName: string) => void;
}

export default function ClientPortalLogin({ onLogin }: Props) {
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId.trim()) return;
    setLoading(true);
    setError('');

    try {
      const r = await fetch(`${API_URL}/client-portal/profile`, {
        headers: { 'x-client-id': clientId.trim(), 'Content-Type': 'application/json' },
      });

      if (!r.ok) {
        setError('Client not found. Please check your Client ID.');
        return;
      }

      const data = await r.json();
      if (!data.client) {
        setError('Client not found. Please check your Client ID.');
        return;
      }

      onLogin(clientId.trim(), data.client.name);
    } catch {
      setError('Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">D</div>
            <span className="text-xl font-bold">Deskflo</span>
          </div>
          <h1 className="text-2xl font-bold">Client Portal</h1>
          <p className="text-muted-foreground text-sm mt-1">Access your compliance dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" /> Sign In
            </CardTitle>
            <CardDescription>
              Enter your Client ID provided by your CA firm.
              <br />
              <span className="text-xs text-amber-600 mt-1 block">
                📱 OTP-based mobile login coming in Phase 2
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <Input
                  id="clientId"
                  placeholder="e.g. a98196f8-06fd-4ac2-8a8a-dabc17b14e18"
                  value={clientId}
                  onChange={e => setClientId(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Your Client ID is shared by your CA firm when your account is created.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !clientId.trim()}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Access Portal
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Need help? Contact your CA firm for your Client ID.
        </p>
      </div>
    </div>
  );
}
