import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Send, Loader2, TrendingUp, Database, Globe, Wallet, Settings, GitCompare, HelpCircle, Newspaper, Copy, Download, Check, BarChart3 } from 'lucide-react';
import { ResearchService } from '@/services/ResearchService';
import { validateStablecoin, validateStablecoinComparison } from '@/utils/stablecoinValidation';
import StablecoinChart from './StablecoinChart';
import NewsGrid from './NewsGrid';
import ComparisonTable from './ComparisonTable';
import AdoptionMetrics from './AdoptionMetrics';
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
interface DemoInterfaceProps {
  onSetupWallet: () => void;
}
export const DemoInterface = ({
  onSetupWallet
}: DemoInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    type: 'system',
    content: 'Hello! I am Mantlet, your AI assistant specialized in stablecoins. I can help you with everything related to stablecoins - comparisons, explanations, market analysis, news, and more!',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [compareStablecoin1, setCompareStablecoin1] = useState('');
  const [compareStablecoin2, setCompareStablecoin2] = useState('');
  const [explainStablecoin, setExplainStablecoin] = useState('');
  const [adoptionStablecoin, setAdoptionStablecoin] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    toast
  } = useToast();
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
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
    
    // Check query limit in demo mode
    if (queryCount >= 2) {
      toast({
        title: "Demo Limit Reached", 
        description: "You've used your 2 free queries! Please authenticate with Privy to continue asking questions.",
        variant: "destructive"
      });
      // Show authentication modal after a short delay
      setTimeout(() => {
        onSetupWallet();
      }, 1500);
      return;
    }
    
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
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Increment query count
    setQueryCount(prev => prev + 1);
    
    try {
      const response = await ResearchService.processQuery(input.trim());
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.contextData || 'Here are the latest news results:',
        timestamp: new Date(),
        sources: response.sources,
        chartData: response.chartData,
        newsResults: response.newsResults,
        comparisonData: response.comparisonData,
        adoptionData: response.adoptionData ? {
          ...response.adoptionData,
          depegEvents: (response.adoptionData as any).depegEvents || { count: 0, events: [] }
        } : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleQuickAction = async (query: string) => {
    if (isLoading) return;
    
    // Check query limit in demo mode
    if (queryCount >= 2) {
      toast({
        title: "Demo Limit Reached", 
        description: "You've used your 2 free queries! Please authenticate with Privy to continue asking questions.",
        variant: "destructive"
      });
      // Show authentication modal after a short delay
      setTimeout(() => {
        onSetupWallet();
      }, 1500);
      return;
    }
    
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Increment query count
    setQueryCount(prev => prev + 1);
    
    try {
      const response = await ResearchService.processQuery(query);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.contextData || 'Here are the latest news results:',
        timestamp: new Date(),
        sources: response.sources,
        chartData: response.chartData,
        newsResults: response.newsResults,
        comparisonData: response.comparisonData,
        adoptionData: response.adoptionData ? {
          ...response.adoptionData,
          depegEvents: (response.adoptionData as any).depegEvents || { count: 0, events: [] }
        } : undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Research error:', error);
      toast({
        title: "Research Error",
        description: "Failed to process your query. Please try again.",
        variant: "destructive"
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

    // Use the validated symbols
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

    // Use the validated symbol
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

    // Use the validated symbol
    const symbol = validation.matchedSymbol;
    
    handleQuickAction(`Adoption tracker for ${symbol}`);
    setAdoptionStablecoin('');
  };
  const handleLatestNews = () => {
    handleQuickAction('Latest news about stablecoins');
  };
  const formatTextWithBoldTitles = (text: string): string => {
    if (!text) return '';

    // Split text into lines for processing
    const lines = text.split('\n');
    const formattedLines = lines.map(line => {
      // Pattern 1: Text followed by colon (e.g., "Key Benefits:")
      if (line.match(/^[A-Z][^:]*:$/)) {
        return `<strong>${line}</strong>`;
      }

      // Pattern 2: Text with year in parentheses (e.g., "Current Market Status (2025)")
      if (line.match(/^[A-Z][^(]*\(\d{4}\)$/)) {
        return `<strong>${line}</strong>`;
      }

      // Pattern 3: Standalone titles that are not bullet points and start with capital
      if (line.match(/^[A-Z][A-Za-z\s-]+$/) && !line.match(/^[A-Z][a-z]/) &&
      // Not just a sentence
      !line.includes('.') &&
      // No periods
      !line.includes(',') &&
      // No commas
      line.length < 60 &&
      // Not too long
      line.length > 3) {
        // Not too short
        return `<strong>${line}</strong>`;
      }

      // Pattern 4: Section headers with specific keywords
      if (line.match(/^(TYPES?|CATEGORIES|BENEFITS?|FEATURES?|MECHANISMS?|BACKING|COLLATERAL|RISKS?|ADVANTAGES?|DISADVANTAGES?|COMPARISON|OVERVIEW|SUMMARY|CONCLUSION)[A-Za-z\s]*$/i)) {
        return `<strong>${line}</strong>`;
      }

      // Pattern 5: Numbered or lettered section titles
      if (line.match(/^\d+\.\s+[A-Z][A-Za-z\s-]*:?$/) || line.match(/^[A-Z]\.\s+[A-Z][A-Za-z\s-]*:?$/)) {
        return `<strong>${line}</strong>`;
      }

      // Pattern 6: Text in ALL CAPS (but not too long to avoid false positives)
      if (line.match(/^[A-Z\s]{4,25}$/) && !line.match(/^\s*$/)) {
        return `<strong>${line}</strong>`;
      }

      // Pattern 7: Common stablecoin terminology titles
      if (line.match(/^(Fiat-Collateralized|Crypto-Collateralized|Algorithmic|Hybrid|Market Cap|Trading Volume|Supply|Circulation|Protocol|Technology|Governance|Regulation|Compliance)[A-Za-z\s()]*$/)) {
        return `<strong>${line}</strong>`;
      }
      return line;
    });
    return formattedLines.join('\n');
  };
  const handleCopyMessage = async (message: Message) => {
    try {
      let textToCopy = message.content;

      // Add chart data info if present
      if (message.chartData) {
        textToCopy += `\n\n--- ${message.chartData.symbol} Chart Data ---\n`;
        textToCopy += `Price Range: $${Math.min(...message.chartData.data.map(d => d.price)).toFixed(4)} - $${Math.max(...message.chartData.data.map(d => d.price)).toFixed(4)}\n`;
        textToCopy += `Current Price: $${message.chartData.data[message.chartData.data.length - 1]?.price.toFixed(6)}`;
      }

      // Add news results if present
      if (message.newsResults && message.newsResults.length > 0) {
        textToCopy += '\n\n--- Related News ---\n';
        message.newsResults.forEach((news, index) => {
          textToCopy += `${index + 1}. ${news.title}\n   ${news.snippet}\n   Source: ${news.source} | ${news.link}\n\n`;
        });
      }

      // Add comparison data if present
      if (message.comparisonData) {
        textToCopy += '\n\n--- Stablecoin Comparison ---\n';
        message.comparisonData.coins.forEach((coin, index) => {
          textToCopy += `${index + 1}. ${coin.symbol} (${coin.name})\n`;
          textToCopy += `   Backing: ${coin.backing}\n`;
          textToCopy += `   Market Cap: ${coin.marketCap}\n`;
          textToCopy += `   Issuer: ${coin.issuer}\n`;
          textToCopy += `   Risk Level: ${coin.risk_level}\n\n`;
        });
      }
      await navigator.clipboard.writeText(textToCopy);
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

      // Create a temporary container for better PDF rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.cssText = `
        position: absolute;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        padding: 20px;
        font-family: Arial, sans-serif;
        color: black;
      `;
      document.body.appendChild(tempContainer);

      // Clone and style the content for PDF
      const clonedContent = messageElement.cloneNode(true) as HTMLElement;

      // Remove the copy/download buttons section from the cloned content
      const buttonsSection = clonedContent.querySelector('.border-t.border-border');
      if (buttonsSection && buttonsSection.textContent?.includes('Copy')) {
        buttonsSection.remove();
      }

      // Style the cloned content for PDF
      clonedContent.style.cssText = `
        background: white !important;
        color: black !important;
        font-size: 12px;
        line-height: 1.5;
      `;

      // Fix styling for all nested elements
      const allElements = clonedContent.querySelectorAll('*');
      allElements.forEach(el => {
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
      pdf.save(`mantlet-response-${timestamp}.pdf`);
      toast({
        title: "PDF Downloaded!",
        description: "Response saved as PDF successfully."
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
  return <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-2 sm:px-4 glass border-b h-16 overflow-visible">
        <div className="flex items-center space-x-3">
          <img src="/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png" alt="Logo" className="w-24 h-24 object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-sm text-muted-foreground">
            Demo: {queryCount}/2 queries used
          </div>
          <Button onClick={onSetupWallet} variant="outline" size="sm">
            <Wallet className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        </div>
      </div>

      {/* Mobile Demo Counter */}
      <div className="sm:hidden px-4 py-2 glass border-b">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Demo mode: {queryCount}/2 queries used
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => <div key={message.id} className="flex space-x-3">
            {getMessageIcon(message.type)}
            <div className="flex-1 min-w-0">
              <Card className={`p-4 ${message.type === 'user' ? 'bg-secondary' : 'glass'}`} id={`message-${message.id}`}>
                {message.content && message.content.trim() && <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{
                __html: formatTextWithBoldTitles(message.content).replace(/\n/g, '<br/>')
              }} />
                  </div>}
                {message.sources && message.sources.length > 0 && <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2 flex items-center">
                      <Globe className="w-3 h-3 mr-1" />
                      Sources:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {message.sources.map((source, index) => <span key={index} className="text-xs px-2 py-1 bg-muted rounded-md">
                          {source}
                        </span>)}
                    </div>
                  </div>}
                {message.chartData && <div className="mt-3">
                    <StablecoinChart chartData={message.chartData} />
                  </div>}
                {message.newsResults && message.newsResults.length > 0 && <div className="mt-3">
                    <NewsGrid newsResults={message.newsResults} />
                  </div>}
                {message.comparisonData && <div className="mt-3">
                    <ComparisonTable comparisonData={message.comparisonData} />
                  </div>}
                {message.adoptionData && <div className="mt-3">
                    <AdoptionMetrics adoptionData={message.adoptionData} />
                  </div>}
                
                {/* Copy and Download buttons for assistant messages (except when showing news or adoption metrics) */}
                {message.type === 'assistant' && !message.newsResults && !message.adoptionData && <div className="mt-4 pt-3 border-t border-border flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleCopyMessage(message)} className="text-muted-foreground hover:text-foreground">
                      {copiedMessageId === message.id ? <Check className="w-4 h-4 mr-1 text-green-500" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copiedMessageId === message.id ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadPDF(message)} className="text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4 mr-1" />
                      PDF
                    </Button>
                  </div>}
              </Card>
              <p className="text-xs text-muted-foreground mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>)}
        {isLoading && <div className="flex space-x-3">
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
          </div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Demo Notice */}
      {queryCount > 0 && queryCount < 2 && (
        <div className="px-4 py-2">
          <Card className="p-3 bg-accent/50 border-accent">
            <div className="flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4" />
              <span>Demo mode: {2 - queryCount} {2 - queryCount === 1 ? 'query' : 'queries'} remaining. Connect wallet for unlimited access!</span>
            </div>
          </Card>
        </div>
      )}

      {/* Input */}
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
                    <Input id="stablecoin1" placeholder="e.g., USDT" value={compareStablecoin1} onChange={e => setCompareStablecoin1(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stablecoin2">Second Stablecoin</Label>
                    <Input id="stablecoin2" placeholder="e.g., USDC" value={compareStablecoin2} onChange={e => setCompareStablecoin2(e.target.value)} />
                  </div>
                  <DialogTrigger asChild>
                    <Button onClick={handleCompareSubmit} className="w-full" disabled={!compareStablecoin1.trim() || !compareStablecoin2.trim()}>
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
                    <Input id="explain-stablecoin" placeholder="e.g., DAI, USDC, USDT" value={explainStablecoin} onChange={e => setExplainStablecoin(e.target.value)} />
                  </div>
                  <DialogTrigger asChild>
                    <Button onClick={handleExplainSubmit} className="w-full" disabled={!explainStablecoin.trim()}>
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
                    <Input id="adoption-stablecoin" placeholder="e.g., USDT, USDC, DAI" value={adoptionStablecoin} onChange={e => setAdoptionStablecoin(e.target.value)} />
                  </div>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdoptionSubmit} className="w-full" disabled={!adoptionStablecoin.trim()}>
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
    </div>;
};