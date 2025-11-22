import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useNavigate, useParams } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading || !user) return;

    const loadConversation = async (convId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', user.id)
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load conversation messages',
          variant: 'destructive',
        });
      } else {
        setMessages(data as Message[]);
      }
    };

    if (id) {
      setConversationId(id);
      loadConversation(id);
    } else if (!conversationId) {
      createNewConversation();
    }
  }, [authLoading, user, id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: 'New Chat',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        variant: 'destructive',
      });
    } else {
      setConversationId(data.id);
      setMessages([]);
      navigate(`/chat/${data.id}`);
    }
  };

  const saveMessage = async (role: 'user' | 'assistant', content: string) => {
    if (!user || !conversationId) return;

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role,
      content,
    });

    if (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = async () => {
    console.log('sendMessage called', { input, conversationId, user: !!user });
    
    if (!input.trim()) {
      console.log('No input');
      return;
    }
    
    if (!conversationId) {
      console.log('No conversationId');
      toast({
        title: 'Error',
        description: 'No conversation found. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!user) {
      console.log('No user');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newUserMessage]);

    // Save user message to database
    await saveMessage('user', userMessage);

    try {
      console.log('Calling chat function...');
      // Call the chat edge function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { message: userMessage, conversationId },
      });

      console.log('Chat function response:', { data, error });

      if (error) throw error;

      // Add AI response to UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);

      // Save AI message to database
      await saveMessage('assistant', data.response);

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        await supabase
          .from('conversations')
          .update({ title: userMessage.substring(0, 50) })
          .eq('id', conversationId);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center px-4 shadow-sm">
            <SidebarTrigger />
            <h1 className="ml-4 text-xl font-semibold">EngiBot AI Assistant</h1>
          </header>

          <main className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <Card className="p-8 max-w-2xl mx-auto text-center bg-gradient-primary shadow-elevated">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-white" />
                    <h2 className="text-2xl font-bold mb-2 text-white">Welcome to EngiBot AI!</h2>
                    <p className="text-white/90">
                      Your AI-powered study companion for engineering topics. Ask me anything about MERN stack,
                      Machine Learning, Data Structures, Algorithms, and more!
                    </p>
                  </Card>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <Card
                      className={`max-w-[70%] p-4 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </Card>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                ))
              )}
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <Card className="max-w-[70%] p-4 bg-card">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t bg-card p-4">
              <div className="max-w-4xl mx-auto flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about engineering topics..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={loading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Chat;
