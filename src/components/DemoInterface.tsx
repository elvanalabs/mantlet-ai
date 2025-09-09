import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, Loader2, TrendingUp, Database, Globe, Wallet, Settings, GitCompare, HelpCircle, Newspaper } from 'lucide-react';
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
      content: 'Welcome to Mantlet Research! Your expert AI Agent for everything related to Stablecoins',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [compareStablecoin1, setCompareStablecoin1] = useState('');
  const [compareStablecoin2, setCompareStablecoin2] = useState('');
  const [explainStablecoin, setExplainStablecoin] = useState('');
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

  const handleQuickAction = async (query: string) => {
    if (isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await ResearchService.processQuery(query);
      
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

  const handleCompareSubmit = () => {
    if (compareStablecoin1.trim() && compareStablecoin2.trim()) {
      handleQuickAction(`Compare ${compareStablecoin1.trim()} and ${compareStablecoin2.trim()} stablecoins`);
      setCompareStablecoin1('');
      setCompareStablecoin2('');
    }
  };

  const handleExplainSubmit = () => {
    if (explainStablecoin.trim()) {
      handleQuickAction(`Explain ${explainStablecoin.trim()} stablecoin`);
      setExplainStablecoin('');
    }
  };

  const handleLatestNews = () => {
    handleQuickAction('Latest news about stablecoins');
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">U</div>;
      case 'assistant':
        return <img src="/lovable-uploads/9a5386b5-d005-44f8-9022-6aba34a15e19.png" alt="AI Agent" className="w-8 h-8 object-contain" />;
      case 'system':
        return <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><Database className="w-4 h-4 text-muted-foreground" /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 glass border-b h-16 overflow-visible">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png" 
            alt="Logo" 
            className="w-24 h-24 object-contain"
          />
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
      <div className="border-t border-border glass">
        <div className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:border-primary">
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Stablecoins
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Compare Stablecoins</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stablecoin1">First Stablecoin</Label>
                    <Input
                      id="stablecoin1"
                      placeholder="e.g., USDT"
                      value={compareStablecoin1}
                      onChange={(e) => setCompareStablecoin1(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stablecoin2">Second Stablecoin</Label>
                    <Input
                      id="stablecoin2"
                      placeholder="e.g., USDC"
                      value={compareStablecoin2}
                      onChange={(e) => setCompareStablecoin2(e.target.value)}
                    />
                  </div>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleCompareSubmit}
                      className="w-full"
                      disabled={!compareStablecoin1.trim() || !compareStablecoin2.trim()}
                    >
                      Compare Stablecoins
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hover:border-primary">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Explain Stablecoin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Explain a Stablecoin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="explain-stablecoin">Stablecoin Name</Label>
                    <Input
                      id="explain-stablecoin"
                      placeholder="e.g., DAI, USDC, USDT"
                      value={explainStablecoin}
                      onChange={(e) => setExplainStablecoin(e.target.value)}
                    />
                  </div>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleExplainSubmit}
                      className="w-full"
                      disabled={!explainStablecoin.trim()}
                    >
                      Explain Stablecoin
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="sm"
              className="hover:border-primary"
              onClick={handleLatestNews}
              disabled={isLoading}
            >
              <Newspaper className="w-4 h-4 mr-2" />
              Latest News
            </Button>
          </div>
        </div>
        
        {/* Text Input */}
        <div className="p-4 border-t border-border">
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
    </div>
  );
};