import { useState, useEffect } from 'react';
import { useClientProfile, useSaveClientProfile } from '@/hooks/useClientPortal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ENTITY_TYPES = ['Individual', 'Proprietorship', 'Partnership', 'LLP', 'Pvt Ltd', 'Public Ltd', 'Trust', 'HUF'];

const STEPS = ['Entity Type', 'PAN & GSTIN', 'Business Info', 'Contact Details', 'Review'];

interface Props { clientId: string; }

export default function ClientProfilePage({ clientId }: Props) {
  const { data, isLoading } = useClientProfile(clientId);
  const saveMutation = useSaveClientProfile(clientId);
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    entityType: '', pan: '', gstin: '', businessName: '',
    altMobile: '', email: '', address: '',
  });

  useEffect(() => {
    if (data?.profile) {
      setForm({
        entityType: data.profile.entityType || '',
        pan: data.profile.pan || '',
        gstin: data.profile.gstin || '',
        businessName: data.profile.businessName || '',
        altMobile: data.profile.altMobile || '',
        email: data.profile.email || '',
        address: data.profile.address || '',
      });
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(form);
      toast({ title: 'Profile saved', description: 'Your profile has been updated.' });
      if (step < STEPS.length - 1) setStep(s => s + 1);
    } catch {
      toast({ title: 'Error', description: 'Failed to save profile.', variant: 'destructive' });
    }
  };

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  if (isLoading) return <div className="animate-pulse space-y-4"><div className="h-8 bg-slate-200 rounded w-1/3" /><div className="h-64 bg-slate-200 rounded" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Complete your profile to unlock all compliance features.</p>
      </div>

      {/* Step indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}: {STEPS[step]}</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex gap-1">
          {STEPS.map((s, i) => (
            <button
              key={s}
              onClick={() => setStep(i)}
              className={`flex-1 h-1.5 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">{STEPS[step]}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="space-y-2">
              <Label>Entity Type *</Label>
              <Select value={form.entityType} onValueChange={v => setForm({ ...form, entityType: v })}>
                <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                <SelectContent>
                  {ENTITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label>PAN Number</Label>
                <Input
                  placeholder="ABCDE1234F"
                  value={form.pan}
                  onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">10-character alphanumeric PAN</p>
              </div>
              <div className="space-y-2">
                <Label>GSTIN</Label>
                <Input
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">15-character GST Identification Number</p>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <Label>Business / Registered Name</Label>
              <Input
                placeholder="As per ROC / GST certificate"
                value={form.businessName}
                onChange={e => setForm({ ...form, businessName: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label>Alternate Mobile</Label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={form.altMobile}
                  onChange={e => setForm({ ...form, altMobile: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Registered Address</Label>
                <Input
                  placeholder="Full address"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>
            </>
          )}

          {step === 4 && (
            <div className="space-y-3">
              {[
                ['Entity Type', form.entityType],
                ['PAN', form.pan],
                ['GSTIN', form.gstin],
                ['Business Name', form.businessName],
                ['Alternate Mobile', form.altMobile],
                ['Email', form.email],
                ['Address', form.address],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm border-b pb-2 last:border-0">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value || '—'}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
          Back
        </Button>
        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {step === STEPS.length - 1 ? (
            <><CheckCircle2 className="h-4 w-4 mr-2" /> Save Profile</>
          ) : 'Save & Continue'}
        </Button>
      </div>
    </div>
  );
}
