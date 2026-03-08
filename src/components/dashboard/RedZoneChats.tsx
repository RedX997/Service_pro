import { useNavigate } from 'react-router-dom';
import { MessageSquare, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useMessages } from '@/hooks/useMessages';
import { useClients } from '@/hooks/useClients';
import { useMemo } from 'react';

export function RedZoneChats() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: clients = [] } = useClients();
  
  // Get messages from localStorage
  const messages = useMemo(() => {
    const stored = localStorage.getItem('servicepro_messages');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Get unread messages older than 1 hour (red zone)
  const redZoneChats = useMemo(() => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    return messages
      .filter(m => !m.isRead && new Date(m.timestamp) < oneHourAgo)
      .slice(0, 3)
      .map(m => {
        const client = clients.find(c => c.id === m.clientId);
        const messageDate = new Date(m.timestamp);
        const now = new Date();
        const diffMs = now.getTime() - messageDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        const waitTime = diffHours > 0 
          ? `${diffHours}h ${diffMinutes}m`
          : `${diffMinutes}m`;
        
        return {
          id: m.id,
          clientName: client?.name || 'Unknown Client',
          lastMessage: m.content,
          waitTime,
          isUrgent: diffHours >= 2
        };
      });
  }, [messages, clients]);

  const handleReplyNow = (chatId: string, clientName: string) => {
    toast({
      title: "Opening Chat",
      description: `Redirecting to conversation with ${clientName}...`,
    });
    navigate('/messages');
  };

  return (
    <div className="bg-card rounded-xl border shadow-card animate-slide-up">
      <div className="p-6 border-b">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-redzone/10">
            <AlertTriangle className="h-5 w-5 text-redzone" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Red Zone Chats</h3>
            <p className="text-sm text-muted-foreground">Awaiting response - SLA breach risk</p>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {redZoneChats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No pending messages</p>
          </div>
        ) : (
          redZoneChats.map((chat) => (
          <div 
            key={chat.id} 
            className={cn(
              'p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md',
              chat.isUrgent ? 'border-redzone/30 bg-redzone/5' : 'border-warning/30 bg-warning/5'
            )}
            onClick={() => handleReplyNow(chat.id, chat.clientName)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  'p-2 rounded-full shrink-0',
                  chat.isUrgent ? 'bg-redzone/20' : 'bg-warning/20'
                )}>
                  <MessageSquare className={cn(
                    'h-4 w-4',
                    chat.isUrgent ? 'text-redzone' : 'text-warning'
                  )} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{chat.clientName}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{chat.lastMessage}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-sm shrink-0">
                <Clock className={cn(
                  'h-3.5 w-3.5',
                  chat.isUrgent ? 'text-redzone' : 'text-warning'
                )} />
                <span className={chat.isUrgent ? 'text-redzone font-medium' : 'text-warning'}>{chat.waitTime}</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-3 w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleReplyNow(chat.id, chat.clientName);
              }}
            >
              Reply Now
            </Button>
          </div>
          ))
        )}
      </div>
    </div>
  );
}
