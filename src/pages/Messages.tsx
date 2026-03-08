import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send, Paperclip, MoreVertical, AlertTriangle, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClients } from '@/hooks/useClients';
import { Message as MsgType, Client } from '@/types';

const STORAGE_KEY = 'servicepro_messages';

// Default sample messages
const defaultMessages: MsgType[] = [
  {
    id: '1',
    clientId: '',
    content: 'Hello, I need help with my GST filing',
    senderId: 'client-1',
    senderType: 'client',
    isRead: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

export default function Messages() {
  const { data: clients = [] } = useClients();
  const [messages, setMessages] = useState<MsgType[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : defaultMessages;
  });

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!selectedClient && clients.length > 0) {
      setSelectedClient(clients[0]);
    }
  }, [clients, selectedClient]);

  // When opening a conversation, mark client-sent messages as read
  useEffect(() => {
    if (!selectedClient) return;
    const unreadForClient = messages.filter(
      (m: MsgType) => m.clientId === selectedClient.id && !m.isRead && m.senderType === 'client'
    );
    if (unreadForClient.length > 0) {
      setMessages(prev => prev.map(m => 
        unreadForClient.find(um => um.id === m.id) ? { ...m, isRead: true } : m
      ));
    }
  }, [selectedClient]);

  const buildChats = () => {
    return clients
      .map((c) => {
        const clientMsgs = messages.filter((m) => m.clientId === c.id);
        const last = clientMsgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        const unread = clientMsgs.filter((m) => !m.isRead && m.senderType === 'client').length;
        return {
          id: c.id,
          clientName: c.name,
          company: c.company,
          lastMessage: last ? last.content : 'No messages yet',
          time: last ? new Date(last.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unread,
          isRedZone: unread > 0,
          waitTime: undefined,
        };
      })
      .filter((c) =>
        c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.company || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
  };

  const chats = buildChats();
  const filteredMessages = selectedClient
    ? messages
        .filter((m) => m.clientId === selectedClient.id)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    : [];

  useEffect(() => {
    // scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length]);

  const handleSend = () => {
    if (!selectedClient) return;
    const text = messageInput.trim();
    if (!text) return;

    const newMessage: MsgType = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      senderId: 'emp1',
      senderType: 'employee',
      content: text,
      isRead: true,
      timestamp: new Date(),
      createdAt: new Date(),
    };

    setMessages(prev => [...prev, newMessage]);
    setMessageInput('');
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex rounded-xl border bg-card shadow-card overflow-hidden">
        {/* Chat List */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedClient(clients.find((c) => c.id === chat.id) || null)}
                className={cn(
                  'p-4 cursor-pointer border-b transition-colors',
                  selectedClient?.id === chat.id ? 'bg-muted' : 'hover:bg-muted/50',
                  chat.isRedZone && 'border-l-4 border-l-redzone'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        chat.isRedZone ? 'bg-redzone/20 text-redzone' : 'bg-primary/10 text-primary'
                      )}>
                        {chat.clientName.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {chat.isRedZone && (
                      <div className="absolute -top-1 -right-1 h-4 w-4 bg-redzone rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{chat.clientName}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.company}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  {chat.isRedZone && (
                    <Badge variant="destructive" className="text-xs">
                      Waiting
                    </Badge>
                  )}
                  {chat.unread > 0 && (
                    <Badge className="bg-accent text-accent-foreground ml-auto">{chat.unread}</Badge>
                  )}
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      chats.find((c) => c.id === selectedClient.id)?.isRedZone
                        ? 'bg-redzone/20 text-redzone'
                        : 'bg-primary/10 text-primary'
                    )}>
                      {selectedClient.name.split(' ').map((n) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.company}</p>
                  </div>
                  {chats.find((c) => c.id === selectedClient.id)?.isRedZone && (
                    <Badge variant="destructive" className="ml-2">Red Zone</Badge>
                  )}
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {filteredMessages.map((message: MsgType) => (
                    <div
                      key={message.id}
                      className={cn(
                        'flex',
                        message.senderType === 'employee' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-4 py-2.5',
                          message.senderType === 'employee'
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted rounded-bl-md'
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div
                          className={cn(
                            'flex items-center gap-1 mt-1',
                            message.senderType === 'employee' ? 'justify-end' : 'justify-start'
                          )}
                        >
                          <span
                            className={cn(
                              'text-xs',
                              message.senderType === 'employee' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            )}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.senderType === 'employee' && (
                            message.isRead ? (
                              <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                            ) : (
                              <Check className="h-3 w-3 text-primary-foreground/70" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSend();
                    }}
                  />
                  <Button onClick={handleSend}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start messaging</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
