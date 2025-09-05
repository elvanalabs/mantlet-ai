import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, TrendingUp, Database, Globe, Wallet, Settings } from 'lucide-react';
import { ResearchService } from '@/services/ResearchService';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface DemoInterfaceProps {
  onSetupWallet: () => void;
}

export const DemoInterface = ({ onSetupWallet }: DemoInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to the Web3 Research Agent Demo! You can ask me about cryptocurrencies, DeFi protocols, market data, or general Web3 topics. I can pull real-time data from CoinGecko, DeFi Llama, and search the web for you.\n\n⚠️ Demo Mode: Wallet authentication is disabled. Set up your Privy app ID to enable full wallet features.',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ResearchService.processQuery(input.trim());
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.contextData,
        timestamp: new Date(),
        sources: response.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">U</div>;
      case 'assistant':
        return <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent-foreground" /></div>;
      case 'system':
        return <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><Database className="w-4 h-4 text-muted-foreground" /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 glass border-b">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">Demo Mode</p>
            <p className="text-xs text-muted-foreground">Web3 Research Agent</p>
          </div>
        </div>
        <Button
          onClick={onSetupWallet}
          variant="outline"
          size="sm"
          className="hover:border-primary hover:text-primary"
        >
          <Settings className="w-4 h-4 mr-1" />
          Setup Wallet
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-3">
            {getMessageIcon(message.type)}
            <div className="flex-1 min-w-0">
              <Card className={`p-4 ${message.type === 'user' ? 'bg-secondary' : 'glass'}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      Sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-muted rounded-md">
                          {source}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-accent-foreground animate-spin" />
            </div>
            <div className="flex-1">
              <Card className="glass p-4">
                <div className="flex items-center text-muted-foreground">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching your query...
                </div>
              </Card>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border glass">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Web3, DeFi, crypto prices, or any blockchain topic..."
            className="flex-1 bg-input/50 backdrop-blur-sm"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-primary hover:opacity-90 glow-primary"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};