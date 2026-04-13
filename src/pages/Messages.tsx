import { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAvatarUrl } from '@/utils/auth';
import { Search, Send, MoreVertical, AlertTriangle, Check, CheckCheck, Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessaging } from '@/hooks/useMessaging';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// TODO: Get from AuthContext
const CURRENT_USER_ID = '871d8c21-fed4-4352-935b-dd7dd701ccd0'; // Rahul Verma - Replace with actual employee ID from auth
const CURRENT_USER_TYPE = 'employee';
const CURRENT_USER_NAME = 'Rahul Verma';

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  avatarUrl?: string;
}

interface Conversation {
  id: string;
  clientId: string;
  employeeId: string;
  lastMessageAt?: string;
  unreadCount: number;
  client?: Client;
  lastMessage?: any;
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize messaging hook
  const {
    isConnected,
    messages,
    typingUsers,
    onlineUsers,
    joinConversation,
    leaveConversation,
    startTyping,
    stopTyping,
    sendMessage,
    markConversationAsRead,
    loadMessages,
  } = useMessaging(CURRENT_USER_ID, CURRENT_USER_TYPE);

  // Load conversations and all clients on mount
  useEffect(() => {
    fetchConversationsAndClients();
  }, []);

  const fetchConversationsAndClients = async () => {
    try {
      setLoading(true);
      
      // Fetch existing conversations - POST (PUSH)
      const convResponse = await fetch(`${API_URL}/messages/conversations/${CURRENT_USER_ID}/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      let existingConversations: Conversation[] = [];
      
      if (convResponse.ok) {
        const data = await convResponse.json();
        existingConversations = data.filter((conv: Conversation) => conv.client);
      }
      
      // Fetch all clients - POST (PUSH)
      const clientsResponse = await fetch(`${API_URL}/clients/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setAllClients(clientsData);
        
        // Create conversation objects for all clients
        const allConversations: Conversation[] = clientsData.map((client: Client) => {
          // Check if conversation already exists
          const existingConv = existingConversations.find(c => c.clientId === client.id);
          
          if (existingConv) {
            return existingConv;
          } else {
            // Create a placeholder conversation
            return {
              id: `temp-${client.id}`, // Temporary ID
              clientId: client.id,
              employeeId: CURRENT_USER_ID,
              unreadCount: 0,
              client: client,
              lastMessage: null,
              lastMessageAt: undefined,
            };
          }
        });
        
        // Sort: conversations with messages first, then alphabetically
        allConversations.sort((a, b) => {
          if (a.lastMessageAt && !b.lastMessageAt) return -1;
          if (!a.lastMessageAt && b.lastMessageAt) return 1;
          if (a.lastMessageAt && b.lastMessageAt) {
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          }
          return (a.client?.name || '').localeCompare(b.client?.name || '');
        });
        
        setConversations(allConversations);
        
        // Auto-select first conversation with messages
        const firstWithMessages = allConversations.find(c => c.lastMessage);
        if (firstWithMessages && !selectedConversation) {
          handleSelectConversation(firstWithMessages);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = async (conversation: Conversation) => {
    // Leave previous conversation room
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }

    // If this is a temporary conversation (no real ID yet), create it
    let actualConversation = conversation;
    if (conversation.id.startsWith('temp-')) {
      try {
        const response = await fetch(`${API_URL}/messages/conversation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            employeeId: CURRENT_USER_ID,
            clientId: conversation.clientId,
          }),
        });
        
        if (response.ok) {
          const newConv = await response.json();
          actualConversation = {
            ...conversation,
            id: newConv.id,
          };
          
          // Update conversations list with real ID
          setConversations(prev =>
            prev.map(c => c.id === conversation.id ? actualConversation : c)
          );
        }
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Failed to create conversation');
        return;
      }
    }

    setSelectedConversation(actualConversation);
    
    // Join new conversation room
    joinConversation(actualConversation.id);

    // Load messages
    try {
      await loadMessages(actualConversation.id);
      
      // Mark as read
      await markConversationAsRead(actualConversation.id);
      
      // Update unread count locally
      setConversations(prev =>
        prev.map(conv =>
          conv.id === actualConversation.id ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      console.error('Error loading messages:', error);
      // Don't show error for new conversations
      if (!conversation.id.startsWith('temp-')) {
        toast.error('Failed to load messages');
      }
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedConversation) {
      startTyping(selectedConversation.id, CURRENT_USER_NAME);
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!selectedConversation) return;
    const text = messageInput.trim();
    if (!text) return;

    try {
      setSending(true);
      stopTyping(selectedConversation.id);

      await sendMessage(
        selectedConversation.id,
        text,
        selectedConversation.clientId,
        CURRENT_USER_TYPE
      );

      setMessageInput('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Filter conversations by search
  const filteredConversations = conversations.filter((conv) => {
    const client = conv.client;
    if (!client) return false;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.company || '').toLowerCase().includes(searchLower) ||
      (client.email || '').toLowerCase().includes(searchLower)
    );
  });

  // Get typing indicator text
  const typingText = typingUsers.length > 0
    ? `${typingUsers[0].userName} is typing...`
    : null;

  // Check if client is online
  const isClientOnline = selectedConversation?.client
    ? onlineUsers.has(selectedConversation.clientId)
    : false;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col md:flex-row rounded-xl border bg-card shadow-premium overflow-hidden">
        {/* Chat List */}
        <div className={cn(
          "w-full md:w-80 border-r flex flex-col transition-all",
          selectedConversation ? "hidden md:flex" : "flex"
        )}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-lg">Messages</h2>
              {!isConnected && (
                <Badge variant="outline" className="text-xs">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Connecting...
                </Badge>
              )}
              {isConnected && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  ● Online
                </Badge>
              )}
            </div>
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
            {loading ? (
              <div className="p-4 text-center text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const client = conv.client;
                if (!client) return null;

                const isOnline = onlineUsers.has(conv.clientId);
                const isSelected = selectedConversation?.id === conv.id;
                const hasUnread = conv.unreadCount > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={cn(
                      'p-4 cursor-pointer border-b transition-colors',
                      isSelected ? 'bg-muted' : 'hover:bg-muted/50',
                      hasUnread && 'border-l-4 border-l-primary'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getAvatarUrl(client.avatarUrl)} className="object-cover" />
                          <AvatarFallback className={cn(
                            hasUnread ? 'bg-primary/20 text-primary' : 'bg-muted'
                          )}>
                            {client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-medium truncate",
                            hasUnread && "font-semibold"
                          )}>
                            {client.name}
                          </p>
                          {conv.lastMessageAt && (
                            <span className="text-xs text-muted-foreground shrink-0">
                              {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          )}
                        </div>
                        {client.company && (
                          <p className="text-xs text-muted-foreground truncate">{client.company}</p>
                        )}
                        {conv.lastMessage && (
                          <p className={cn(
                            "text-sm truncate mt-1",
                            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
                          )}>
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                    </div>
                    {hasUnread && (
                      <div className="flex items-center justify-end mt-2">
                        <Badge className="bg-primary text-primary-foreground">
                          {conv.unreadCount}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className={cn(
          "flex-1 flex flex-col transition-all",
          !selectedConversation ? "hidden md:flex" : "flex"
        )}>
          {selectedConversation && selectedConversation.client ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden -ml-2 h-10 w-10"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronRight className="h-6 w-6 rotate-180" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                      <AvatarImage src={getAvatarUrl(selectedConversation.client.avatarUrl)} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {selectedConversation.client.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    {isClientOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{selectedConversation.client.name}</p>
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-1.5 w-1.5 rounded-full", isClientOnline ? "bg-green-500" : "bg-slate-300")} />
                      <p className="text-xs text-slate-500 font-medium">
                        {isClientOnline ? 'Online' : 'Offline'}
                        {selectedConversation.client.company && ` • ${selectedConversation.client.company}`}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-slate-400">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwn = message.senderType === CURRENT_USER_TYPE;
                    
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex',
                          isOwn ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            'max-w-[70%] rounded-2xl px-4 py-2.5',
                            isOwn
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                          <div
                            className={cn(
                              'flex items-center gap-1 mt-1',
                              isOwn ? 'justify-end' : 'justify-start'
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs',
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}
                            >
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {message.isEdited && (
                              <span className={cn(
                                'text-xs',
                                isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              )}>
                                • edited
                              </span>
                            )}
                            {isOwn && (
                              <>
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-blue-400" />
                                ) : message.isDelivered ? (
                                  <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                ) : (
                                  <Check className="h-3 w-3 text-primary-foreground/70" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicator */}
                  {typingText && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-2xl px-4 py-2.5 rounded-bl-md">
                        <p className="text-sm text-muted-foreground italic">{typingText}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Input
                    ref={inputRef}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    className="flex-1"
                    disabled={sending || !isConnected}
                  />
                  <Button onClick={handleSend} disabled={sending || !isConnected || !messageInput.trim()}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Connecting to server...
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                <MoreVertical className="h-10 w-10 text-primary/20 rotate-90" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Select a conversation</h3>
              <p className="text-slate-500 max-w-[240px]">Choose a client from the sidebar to start a secure discussion.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
