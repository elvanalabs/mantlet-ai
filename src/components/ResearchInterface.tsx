import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, TrendingUp, Database, Globe, ExternalLink, ArrowUpRight } from 'lucide-react';
import { ResearchService } from '@/services/ResearchService';
import { validateStablecoin } from '@/utils/stablecoinValidation';
import AdoptionMetrics from '@/components/AdoptionMetrics';
import { getStablecoinExplanation, isBasicStablecoinQuery, type StablecoinExplanation } from '@/data/stablecoinExplanations';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: string[];
  adoptionData?: {
    stablecoin: string;
    totalCirculatingSupply: string;
    marketSharePercent: string;
    chainDistribution: Array<{
      chain: string;
      percentage: string;
      amount: string;
    }>;
    transactionVolume24h: string;
    growthDecline30d: {
      percentage: string;
      direction: 'up' | 'down';
    };
    depegEvents: {
      count: number;
      events: Array<{
        date: string;
        time: string;
        deviation: string;
        price: string;
      }>;
    };
  };
}

export const ResearchInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to your Stablecoin Research Agent. I am your specialized AI assistant for everything stablecoin-related. Ask me about stablecoin market caps, prices, mechanisms, stability, yields, protocols, or any stablecoin analysis you need.',
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

  const validateQuery = (query: string): boolean => {
    // Allow common stablecoin-related keywords
    const stablecoinKeywords = [
      'stablecoin', 'usdt', 'usdc', 'dai', 'tether', 'circle', 'maker', 
      'price', 'market', 'adoption', 'compare', 'explain', 'news',
      'backing', 'collateral', 'mechanism', 'yield', 'protocol',
      'ethena', 'usde', 'pyusd', 'paypal', 'fdusd', 'paxg', 'xaut',
      'eurs', 'eurc', 'frax', 'mim', 'gho', 'aave', 'curve', 'crvusd',
      'treasury', 'reserves', 'defi', 'celsius', 'terra', 'anchor'
    ];

    const lowerQuery = query.toLowerCase();
    
    // Check if query contains stablecoin-related terms
    const hasStablecoinTerms = stablecoinKeywords.some(keyword => 
      lowerQuery.includes(keyword)
    );
    
    // Check if query mentions specific stablecoin symbols/names
    const mentionsStablecoin = validateStablecoin(query).isValid;
    
    return hasStablecoinTerms || mentionsStablecoin;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Validate if query is stablecoin-related
    if (!validateQuery(input.trim())) {
      toast({
        title: "Invalid Query",
        description: "I can only provide information about stablecoins. Please ask about stablecoin prices, mechanisms, comparisons, or other stablecoin-related topics.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Check if this is a basic stablecoin query that we have cached
      if (isBasicStablecoinQuery(query)) {
        const cachedExplanation = getStablecoinExplanation(query);
        
        if (cachedExplanation) {
          console.log('Using cached explanation for:', cachedExplanation.symbol);
          
          // Convert chainDistribution from object to array format
          const chainDistributionArray = cachedExplanation.adoptionData?.chainDistribution 
            ? Object.entries(cachedExplanation.adoptionData.chainDistribution).map(([chain, percentage]) => ({
                chain,
                percentage,
                amount: `${Math.round(parseFloat(percentage) * parseFloat(cachedExplanation.adoptionData!.circulatingSupply) / 100)} tokens`
              }))
            : [];
          
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'assistant',
            content: cachedExplanation.explanation,
            timestamp: new Date(),
            sources: cachedExplanation.sources,
            adoptionData: cachedExplanation.adoptionData ? {
              stablecoin: cachedExplanation.symbol,
              totalCirculatingSupply: cachedExplanation.adoptionData.circulatingSupply,
              marketSharePercent: cachedExplanation.adoptionData.marketShare,
              chainDistribution: chainDistributionArray,
              transactionVolume24h: cachedExplanation.adoptionData.volume24h,
              growthDecline30d: {
                percentage: '2.1%',
                direction: 'up' as const
              },
              depegEvents: {
                count: cachedExplanation.adoptionData.depegEvents.length,
                events: cachedExplanation.adoptionData.depegEvents.map(event => ({
                  date: event.date,
                  time: '00:00',
                  deviation: event.severity,
                  price: '$0.95'
                }))
              }
            } : undefined,
          };

          setMessages(prev => [...prev, assistantMessage]);
          toast({
            title: "Response Served from Cache",
            description: `Retrieved ${cachedExplanation.symbol} information instantly from our knowledge base.`,
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Fall back to API call for complex queries or unknown stablecoins
      console.log('Using API for query:', query);
      const response = await ResearchService.processQuery(query);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.contextData,
        timestamp: new Date(),
        sources: response.sources,
        adoptionData: response.adoptionData ? {
          ...response.adoptionData,
          depegEvents: (response.adoptionData as any).depegEvents || { count: 0, events: [] }
        } : undefined,
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
        return <img src="/lovable-uploads/9a5386b5-d005-44f8-9022-6aba34a15e19.png" alt="AI Agent" className="w-8 h-8 object-contain" />;
      case 'system':
        return <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><Database className="w-4 h-4 text-muted-foreground" /></div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex space-x-3">
            {getMessageIcon(message.type)}
            <div className="flex-1 min-w-0">
              <Card className={`p-4 ${message.type === 'user' ? 'bg-secondary' : 'glass'}`}>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {message.content.split(/(https?:\/\/[^\s\)\]>,]+)/g).map((part, index) => {
                    if (part.match(/^https?:\/\//)) {
                      return (
                        <a
                          key={index}
                          href={part}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 underline font-medium break-all transition-colors duration-200 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(part, '_blank');
                          }}
                        >
                          {part} ↗
                        </a>
                      );
                    }
                    return part;
                  })}
                </div>
                {message.adoptionData && (
                  <div className="mt-3">
                    <AdoptionMetrics adoptionData={message.adoptionData} />
                  </div>
                )}
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
            placeholder="Ask about stablecoin market caps, yields, mechanisms, USDT vs USDC, or any stablecoin analysis..."
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