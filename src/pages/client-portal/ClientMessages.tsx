/**
 * ClientMessages.tsx
 * Real-time messaging with Socket.io for client-to-employee communication
 */
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderType: 'client' | 'employee';
  senderName: string;
  timestamp: string;
}

interface Props {
  clientId: string;
  clientName: string;
}

export default function ClientMessages({ clientId, clientName }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { emit, on, off, isConnected } = useSocket(clientId, 'client');

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await fetch(`${API_URL}/client-portal/messages`, {
          headers: { 'x-client-id': clientId },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages(data || []);
        } else {
          setError('Failed to load messages');
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Unable to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [clientId]);

  // Listen for real-time messages
  useEffect(() => {
    const handleNewMessage = (message: Message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
    };

    on('message:new', handleNewMessage);

    return () => {
      off('message:new', handleNewMessage);
    };
  }, [on, off]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    setError('');

    try {
      // Save to database
      const response = await fetch(`${API_URL}/client-portal/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': clientId,
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to send message');
        setIsSending(false);
        return;
      }

      const savedMessage = await response.json();

      // Emit via socket for real-time delivery
      emit('message:send', {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: clientId,
        senderType: 'client',
        senderName: clientName,
        timestamp: new Date().toISOString(),
        conversationId: `client:${clientId}`, // Room for this client's messages
      });

      // Add to local messages
      setMessages(prev => [...prev, {
        id: savedMessage.id,
        content: savedMessage.content,
        senderId: clientId,
        senderType: 'client',
        senderName: clientName,
        timestamp: new Date().toISOString(),
      }]);

      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Unable to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground mt-2">
          Contact your assigned employee
          {isConnected && <span className="ml-2 text-green-600">● Connected</span>}
          {!isConnected && <span className="ml-2 text-amber-600">● Connecting...</span>}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Alert */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading messages...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages List */}
              <div className="bg-slate-50 rounded-lg p-4 h-96 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No messages yet. Start a conversation with your assigned employee.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderType === 'client' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderType === 'client'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-white border border-slate-200'
                          }`}
                        >
                          <p className="text-xs font-medium opacity-75 mb-1">
                            {msg.senderName}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending || !isConnected}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isSending || !newMessage.trim() || !isConnected}
                  className="gap-2"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
