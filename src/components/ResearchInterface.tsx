import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Send, Loader2, TrendingUp, Database, Globe, ExternalLink, ArrowUpRight, GitCompare, HelpCircle, BarChart3, Newspaper, Info, Copy, Download, Check } from 'lucide-react';
import { ResearchService } from '@/services/ResearchService';
import { validateStablecoin, validateStablecoinComparison } from '@/utils/stablecoinValidation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import StablecoinChart from '@/components/StablecoinChart';
import NewsGrid from '@/components/NewsGrid';
import ComparisonTable from '@/components/ComparisonTable';
import AdoptionMetrics from '@/components/AdoptionMetrics';
import { getStablecoinExplanation, isBasicStablecoinQuery, type StablecoinExplanation } from '@/data/stablecoinExplanations';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: string[];
  chartData?: {
    symbol: string;
    data: Array<{
      date: string;
      price: number;
      volume?: number;
    }>;
  };
  newsResults?: Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
    thumbnail?: string;
    position: number;
  }>;
  comparisonData?: {
    coins: Array<{
      symbol: string;
      name: string;
      backing: string;
      marketCap: string;
      chain: string;
      yield: string;
      issuer: string;
      regulation: string;
      use_case: string;
      risk_level: string;
    }>;
  };
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
      content: 'Hello! I am Mantlet, your AI assistant specialized in stablecoins. Start with the below given quick start options',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [compareStablecoin1, setCompareStablecoin1] = useState('');
  const [compareStablecoin2, setCompareStablecoin2] = useState('');
  const [explainStablecoin, setExplainStablecoin] = useState('');
  const [adoptionStablecoin, setAdoptionStablecoin] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
            content: cachedExplanation.explanation.replace(/https?:\/\/[^\s\)\]>,]+/g, '').replace(/\s+/g, ' ').trim(),
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
      
      // API call for queries
      console.log('Using API for query:', query);
      const response = await ResearchService.processQuery(query);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.contextData || 'Here are the latest results:',
        timestamp: new Date(),
        sources: response.sources,
        chartData: response.chartData,
        newsResults: response.newsResults,
        comparisonData: response.comparisonData,
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

  const handleCompareSubmit = () => {
    const input1 = compareStablecoin1.trim();
    const input2 = compareStablecoin2.trim();
    if (!input1 || !input2) {
      toast({
        title: "Input Required",
        description: "Please enter both stablecoins to compare.",
        variant: "destructive"
      });
      return;
    }
    const validation = validateStablecoinComparison(input1, input2);
    if (!validation.isValid) {
      toast({
        title: "Invalid Stablecoin",
        description: validation.errorMessage || "Please enter valid stablecoin symbols or names.",
        variant: "destructive"
      });
      return;
    }

    const symbol1 = validation.stablecoin1.matchedSymbol;
    const symbol2 = validation.stablecoin2.matchedSymbol;
    handleQuickAction(`Compare ${symbol1} and ${symbol2} stablecoins`);
    setCompareStablecoin1('');
    setCompareStablecoin2('');
  };

  const handleExplainSubmit = () => {
    const input = explainStablecoin.trim();
    if (!input) {
      toast({
        title: "Input Required",
        description: "Please enter a stablecoin to explain.",
        variant: "destructive"
      });
      return;
    }
    const validation = validateStablecoin(input);
    if (!validation.isValid) {
      toast({
        title: "Invalid Stablecoin",
        description: validation.errorMessage || "Please enter a valid stablecoin symbol or name.",
        variant: "destructive"
      });
      return;
    }

    const symbol = validation.matchedSymbol;
    handleQuickAction(`Explain ${symbol} stablecoin`);
    setExplainStablecoin('');
  };

  const handleAdoptionSubmit = () => {
    const input = adoptionStablecoin.trim();
    if (!input) {
      toast({
        title: "Input Required",
        description: "Please enter a stablecoin for adoption tracking.",
        variant: "destructive"
      });
      return;
    }
    const validation = validateStablecoin(input);
    if (!validation.isValid) {
      toast({
        title: "Invalid Stablecoin",
        description: validation.errorMessage || "Please enter a valid stablecoin symbol or name.",
        variant: "destructive"
      });
      return;
    }

    const symbol = validation.matchedSymbol;
    handleQuickAction(`Adoption tracker for ${symbol}`);
    setAdoptionStablecoin('');
  };

  const handleLatestNews = () => {
    handleQuickAction('Latest news about stablecoins');
  };

  const handleCopyMessage = async (message: Message) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      toast({
        title: "Copied!",
        description: "Response copied to clipboard successfully."
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadPDF = async (message: Message) => {
    try {
      const messageElement = document.getElementById(`message-${message.id}`);
      if (!messageElement) {
        toast({
          title: "Download Failed",
          description: "Unable to find message content for PDF generation.",
          variant: "destructive"
        });
        return;
      }

      // Create a temporary container for clean PDF rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '800px';
      tempContainer.style.padding = '20px';
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Clone the message content and clean up styling
      const clonedContent = messageElement.cloneNode(true) as HTMLElement;
      const elementsToClean = clonedContent.querySelectorAll('*');
      elementsToClean.forEach(el => {
        const element = el as HTMLElement;
        element.style.background = 'white';
        element.style.color = 'black';
        element.style.border = 'none';
        element.style.boxShadow = 'none';
      });
      tempContainer.appendChild(clonedContent);

      // Generate PDF
      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      document.body.removeChild(tempContainer);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      pdf.save(`mantlet-research-${timestamp}.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Research response saved as PDF successfully."
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
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
              <Card className={`p-4 ${message.type === 'user' ? 'bg-secondary' : 'glass'}`} id={`message-${message.id}`}>
                <div className="max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                  {(() => {
                    const parts = message.content.split(/(\[([^\]]+)\]\(([^)]+)\)|https?:\/\/[^\s\)\]>,\n]+)/g);
                    console.log('Message content:', message.content);
                    console.log('Split parts:', parts);
                    
                    return parts.map((part, index) => {
                      // Handle markdown links [text](url)
                      const markdownMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (markdownMatch) {
                        const [, linkText, url] = markdownMatch;
                        console.log('Found markdown link:', linkText, url);
                        return (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium break-all transition-colors duration-200 cursor-pointer inline-block"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Markdown link clicked:', url);
                              window.open(url, '_blank');
                            }}
                          >
                            {linkText} ↗
                          </a>
                        );
                      }
                      
                      // Handle plain URLs
                      if (part.match(/^https?:\/\//)) {
                        console.log('Found plain URL:', part);
                        return (
                          <a
                            key={index}
                            href={part}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline font-medium break-all transition-colors duration-200 cursor-pointer inline-block"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Plain URL clicked:', part);
                              window.open(part, '_blank');
                            }}
                          >
                            {part} ↗
                          </a>
                        );
                      }
                      
                      return <span key={index}>{part}</span>;
                    });
                  })()}
                </div>
                {message.adoptionData && (
                  <div className="mt-3">
                    <AdoptionMetrics adoptionData={message.adoptionData} />
                  </div>
                 )}
                 {message.chartData && (
                   <div className="mt-3">
                     <StablecoinChart 
                       chartData={message.chartData} 
                     />
                   </div>
                 )}
                 {message.newsResults && (
                   <div className="mt-3">
                     <NewsGrid newsResults={message.newsResults} />
                   </div>
                 )}
                 {message.comparisonData && (
                   <div className="mt-3">
                     <ComparisonTable comparisonData={message.comparisonData} />
                   </div>
                 )}
                 
                 {/* Copy and Download buttons for assistant messages (except when showing news or adoption metrics) */}
                 {message.type === 'assistant' && !message.newsResults && !message.adoptionData && (
                   <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                     <Button variant="ghost" size="sm" onClick={() => handleCopyMessage(message)} className="text-muted-foreground hover:text-foreground">
                       {copiedMessageId === message.id ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                       {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                     </Button>
                     <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(message)} className="text-muted-foreground hover:text-foreground">
                       <Download className="w-4 h-4 mr-1" />
                       PDF
                     </Button>
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

      {/* Quick Actions */}
      <div className="border-t border-border glass">
        <div className="p-4">
          <div className="flex gap-2 flex-wrap">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
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
                      onChange={e => setCompareStablecoin1(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stablecoin2">Second Stablecoin</Label>
                    <Input 
                      id="stablecoin2" 
                      placeholder="e.g., USDC" 
                      value={compareStablecoin2} 
                      onChange={e => setCompareStablecoin2(e.target.value)} 
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
                <Button variant="outline" size="sm">
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
                    <Label htmlFor="explain-stablecoin">Stablecoin Name/Ticker</Label>
                    <Input 
                      id="explain-stablecoin" 
                      placeholder="e.g., DAI, USDC, USDT" 
                      value={explainStablecoin} 
                      onChange={e => setExplainStablecoin(e.target.value)} 
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

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Onchain Metrics
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stablecoin Adoption Tracker</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adoption-stablecoin">Stablecoin Name/Ticker</Label>
                    <Input 
                      id="adoption-stablecoin" 
                      placeholder="e.g., USDT, USDC, DAI" 
                      value={adoptionStablecoin} 
                      onChange={e => setAdoptionStablecoin(e.target.value)} 
                    />
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <Info className="w-3 h-3" />
                      <span>Data is precise only for widely-used stablecoins</span>
                    </div>
                  </div>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={handleAdoptionSubmit} 
                      className="w-full" 
                      disabled={!adoptionStablecoin.trim()}
                    >
                      Track Adoption Metrics
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" size="sm" onClick={handleLatestNews} disabled={isLoading}>
              <Newspaper className="w-4 h-4 mr-2" />
              Latest News
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};