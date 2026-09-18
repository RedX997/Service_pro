import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Mail, Phone, MessageSquare, ExternalLink, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatRoleName } from '@/utils/auth';
import { useCreateSupportTicket, useUserSupportTickets } from '@/hooks/useSupport';
import { formatDistanceToNow } from 'date-fns';

export default function Support() {
  const { user } = useAuth();
  const { toast } = useToast();
  const createTicketMutation = useCreateSupportTicket();
  const { data: userTickets = [] } = useUserSupportTickets(user?.id);
  const [ticketData, setTicketData] = useState({
    subject: '',
    category: '',
    priority: '',
    message: ''
  });

  const role = user?.role || 'receptionist';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.subject || !ticketData.category || !ticketData.priority || !ticketData.message) {
      toast({
        title: "Missing fields",
        description: "Please fill out all fields before submitting your ticket.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Session issue",
        description: "You must be logged in to submit a ticket.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        userId: user.id,
        ...ticketData
      });
      
      toast({
        title: "Ticket Submitted Successfully",
        description: "Our IT Support team has received your request and will respond shortly.",
      });
      setTicketData({ subject: '', category: '', priority: '', message: '' });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to connect to the support server. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const isSubmitting = createTicketMutation.isPending;

  // Dynamic FAQs based on Role
  const getFaqs = () => {
    const commonFaqs = [
      {
        q: "I am not receiving real-time notifications.",
        a: "Ensure that your browser has notification permissions enabled for this application. You can also view missed notifications in the 'Notifications' tab inside your settings."
      }
    ];

    if (role === 'super_admin') {
      return [
        ...commonFaqs,
        {
          q: "How do I configure role-based access for new staff?",
          a: "Navigate to the Employee Management module. When adding a new user, select the 'Role' dropdown to restrict their system access dynamically."
        },
        {
          q: "How do I view system-wide logs or performance diagnostics?",
          a: "System metrics and database stability logs are available under the 'Diagnostics' routing node in your super admin sidebar."
        }
      ];
    }

    if (role === 'manager') {
      return [
        ...commonFaqs,
        {
          q: "How do I generate accurate workload reports?",
          a: "Go to your 'Reports' tab. You can export time tracking and client load metrics filtered by specific departments or individual employees."
        },
        {
          q: "How do I reassign clients to different departments?",
          a: "Access the 'Clients' database from your sidebar. Click 'Edit' on a client profile to re-route their assigned representative or department."
        }
      ];
    }

    return [
      ...commonFaqs,
      {
        q: "How do I successfully check-in a walk-in visitor?",
        a: "Use the 'Visitors' module to quickly log a walk-in. Enter their details, and the system will automatically notify the manager or host."
      },
      {
        q: "What if a booked appointment overlaps with another?",
        a: "The 'Appointments' calendar module will prevent double-booking. If an overlap is forced, the relevant staff member will receive an immediate schedule conflict notification."
      }
    ];
  };

  const faqs = getFaqs();

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Help & Support</h1>
          <p className="text-sm text-slate-500 mt-1">Get assistance, submit a ticket, or browse our knowledge base.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - FAQS & Contact */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* System Status Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-lg p-4 flex items-start gap-4 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">All Systems Operational</h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Database clusters, API endpoints, and real-time notification socket connections are currently running normally.
                </p>
              </div>
            </div>

            <Card className="shadow-sm border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Frequently Asked Questions</CardTitle>
                <CardDescription>Tailored troubleshooting guides for your {formatRoleName(role)} role.</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-slate-100 dark:border-slate-800">
                      <AccordionTrigger className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-primary text-left">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Email IT Support</h3>
                  <p className="text-xs text-slate-500 mb-3">Response time: ~2 hours</p>
                  <a href="mailto:support@deskflow.com" className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                    support@deskflow.com <ExternalLink className="h-3 w-3" />
                  </a>
                </CardContent>
               </Card>
               <Card className="shadow-sm border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Emergency Hotline</h3>
                  <p className="text-xs text-slate-500 mb-3">For critical outages only</p>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    +1 (800) 555-0100
                  </span>
                </CardContent>
               </Card>
            </div>

            {/* My Tickets Section */}
            {userTickets.length > 0 && (
              <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">My Recent Tickets</CardTitle>
                  <CardDescription>Track the status of your submitted support requests.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userTickets.map((t) => (
                      <div key={t.id} className="p-4 rounded-lg border bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{t.subject}</h4>
                            <Badge className={cn(
                              "text-[10px] px-1.5 py-0 h-4 uppercase border-0 font-bold",
                              t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            )}>
                              {t.status}
                            </Badge>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{t.message}"</p>
                        
                        {t.adminReply && (
                          <div className="mt-3 p-3 rounded bg-white dark:bg-slate-950 border border-green-100 dark:border-green-900/30">
                            <div className="flex items-center gap-1.5 mb-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span className="text-[10px] font-bold text-green-600 uppercase">Support Response</span>
                            </div>
                            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              {t.adminReply}
                            </p>
                            {t.resolvedAt && (
                              <p className="text-[9px] text-slate-400 mt-2">
                                Resolved on {new Date(t.resolvedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Support Ticket Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm border-slate-200 dark:border-slate-800 h-full">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">Submit a Ticket</CardTitle>
                </div>
                <CardDescription>
                  Need direct assistance? Open a tracked support ticket.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-medium text-slate-700 dark:text-slate-300">Subject</Label>
                    <Input 
                      id="subject"
                      placeholder="Brief summary of the issue"
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Category</Label>
                    <Select value={ticketData.category} onValueChange={(val) => setTicketData({...ticketData, category: val})}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select issue category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">Software Bug</SelectItem>
                        <SelectItem value="access">Access / Account Issue</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="billing">Billing / Subscription</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-slate-700 dark:text-slate-300">Urgency Level</Label>
                    <Select value={ticketData.priority} onValueChange={(val) => setTicketData({...ticketData, priority: val})}>
                      <SelectTrigger className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Standard Request)</SelectItem>
                        <SelectItem value="medium">Medium (Impeding Work)</SelectItem>
                        <SelectItem value="high">High (System Critical)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-medium text-slate-700 dark:text-slate-300">Description</Label>
                    <Textarea 
                      id="message"
                      placeholder="Describe the problem in detail..."
                      className="min-h-[120px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none"
                      value={ticketData.message}
                      onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-500/10 p-3 rounded-md flex gap-2 items-start text-xs border border-amber-200 dark:border-amber-500/20 mt-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-amber-700 dark:text-amber-400">
                      Including detailed steps to reproduce the bug accelerates ticket resolution times.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 text-white mt-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      'Sending Request...'
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" /> Submit IT Ticket
                      </>
                    )}
                  </Button>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
