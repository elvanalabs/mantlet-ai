import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, BarChart3, Globe, Coins, Users, Info, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DepegEvent {
  date: string;
  time: string;
  deviation: string;
  price: string;
}

interface AdoptionData {
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
    events: DepegEvent[];
  };
}

interface AdoptionMetricsProps {
  adoptionData: AdoptionData;
}

// Mobile-friendly tooltip component
const MobileTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="relative">
        <div 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="cursor-pointer"
        >
          {children}
        </div>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9998]" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-[9999] bg-popover border rounded-md shadow-lg px-3 py-2 text-sm text-popover-foreground max-w-[200px] whitespace-normal">
              {content}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children}
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

const AdoptionMetrics: React.FC<AdoptionMetricsProps> = ({ adoptionData }) => {
  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const getChainLogo = (chainName: string): string | null => {
    const chainLogos: { [key: string]: string } = {
      'optimism': '/lovable-uploads/c3194579-1e23-4eb9-b649-53e5cea7e618.png',
      'polygon': '/lovable-uploads/8cb30a58-d85d-497a-a440-35a477445205.png',
      'arbitrum': '/lovable-uploads/665b65d1-9659-49ac-b579-5076efe5cee2.png',
      'solana': '/lovable-uploads/a80659c7-3fde-45e0-8f1c-9908c66cfa78.png',
      'ethereum': '/lovable-uploads/87e1a4ce-91d0-4a97-a09d-6cc07774927e.png',
      'tron': '/lovable-uploads/16f45e0e-8229-48ef-a08e-7b5f36dba809.png',
      'bsc': '/lovable-uploads/e0869e6e-cd55-45f8-a4d9-c43ba68b3098.png',
      'binancesmartchain': '/lovable-uploads/e0869e6e-cd55-45f8-a4d9-c43ba68b3098.png',
      'avalanche': '/lovable-uploads/e01e2c59-001f-4e00-bb5e-4e98a291fdcd.png',
      'base': '/lovable-uploads/0d9c5a57-3480-4453-bbcd-a5e18d307317.png',
      'near': '/lovable-uploads/aaf3e3cf-e6ee-4031-93cf-7765c8b0d36f.png',
      'sui': '/lovable-uploads/533fae76-1099-4256-975c-478d24e3c053.png',
      'aptos': '/lovable-uploads/8d7736df-a593-4cda-af6d-4a6e47ed8834.png',
      'zksync': '/lovable-uploads/39a3fce6-4893-4928-90d6-3329b311dabb.png',
      'gnosis': '/lovable-uploads/a2cb7eff-989e-4bf6-8e47-7f2d8e526fcc.png',
      'hedera': '/lovable-uploads/e6dafb87-9343-4c68-a809-9da1aa75a4b2.png',
      'celo': '/lovable-uploads/5f630daa-b5bc-4e96-ad07-1acf1d13b61a.png',
      'xrpledger': '/lovable-uploads/0f17d950-ef5f-4990-83d3-bf136a070b81.png',
      'xrp': '/lovable-uploads/0f17d950-ef5f-4990-83d3-bf136a070b81.png',
      'terraclassic': '/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png',
      'terra': '/lovable-uploads/33de17b2-37de-44c9-994a-e297e6beede9.png',
    };
    
    // Normalize chain name: lowercase, remove spaces, hyphens, and common words
    const normalizedChainName = chainName.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/-/g, '')
      .replace(/chain/g, '')
      .replace(/network/g, '')
      .replace(/ledger/g, '');
    
    return chainLogos[normalizedChainName] || null;
  };

  return (
    <TooltipProvider>
      <div className="w-full mt-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            {adoptionData.stablecoin} Adoption Metrics
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Circulating Supply */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     Total Circulating Supply
                   </CardTitle>
                   <MobileTooltip content="Stablecoin supply in circulation">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                <Coins className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(adoptionData.totalCirculatingSupply)}
              </p>
            </CardContent>
          </Card>

          {/* Market Share */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     Market Share
                   </CardTitle>
                   <MobileTooltip content="Share of total stablecoin market">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                <Users className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {adoptionData.marketSharePercent}%
              </p>
            </CardContent>
          </Card>

          {/* 24H Transaction Volume */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     24H Transaction Volume
                   </CardTitle>
                   <MobileTooltip content="Value moved in last 24h">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">
                {formatNumber(adoptionData.transactionVolume24h)}
              </p>
            </CardContent>
          </Card>

          {/* 30-Day Growth/Decline */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     30-Day Growth/Decline
                   </CardTitle>
                   <MobileTooltip content="Supply change over 30 days">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                {adoptionData.growthDecline30d.direction === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${
                  adoptionData.growthDecline30d.direction === 'up' 
                    ? 'text-green-500' 
                    : 'text-red-500'
                }`}>
                  {adoptionData.growthDecline30d.direction === 'up' ? '+' : '-'}
                  {adoptionData.growthDecline30d.percentage}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Depeg Events */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     Depeg Events (30D)
                   </CardTitle>
                   <MobileTooltip content="Major price deviations from $1.00">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-foreground">
                  {adoptionData.depegEvents.count}
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Events
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {adoptionData.stablecoin} Depeg Events (Last 30 Days)
                      </DialogTitle>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                      {adoptionData.depegEvents.count > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Time (UTC)</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Deviation</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {adoptionData.depegEvents.events.map((event, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{event.date}</TableCell>
                                <TableCell>{event.time}</TableCell>
                                <TableCell>${event.price}</TableCell>
                                <TableCell className={`font-medium ${
                                  parseFloat(event.deviation.replace('%', '')) < 0 
                                    ? 'text-red-500' 
                                    : 'text-green-500'
                                }`}>
                                  {event.deviation}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            No significant depeg events (&gt;1% deviation) found in the last 30 days.
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            This indicates excellent price stability for {adoptionData.stablecoin}.
                          </p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Chain Distribution */}
          <Card className="glass border border-border/50 hover:border-primary/20 transition-colors md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-1">
                   <CardTitle className="text-sm font-medium text-muted-foreground">
                     Chain Distribution
                   </CardTitle>
                   <MobileTooltip content="Supply split across blockchains">
                     <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                   </MobileTooltip>
                 </div>
                <Globe className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
          <CardContent>
            <div className="space-y-3">
                 {adoptionData.chainDistribution.map((chain, index) => {
                 const chainLogo = getChainLogo(chain.chain);
                 return (
                   <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                     <div className="flex items-center gap-2">
                       {chainLogo ? (
                         <img 
                           src={chainLogo} 
                           alt={`${chain.chain} logo`}
                           className="w-5 h-5 rounded-full"
                         />
                       ) : (
                         <div className="w-5 h-5 rounded-full bg-muted border flex items-center justify-center">
                           <span className="text-xs font-bold text-muted-foreground">
                             {chain.chain.charAt(0).toUpperCase()}
                           </span>
                         </div>
                       )}
                       <Badge variant="outline" className="text-xs">
                         {chain.chain}
                       </Badge>
                       <span className="text-sm text-muted-foreground">
                         {formatNumber(chain.amount)}
                       </span>
                     </div>
                     <div className="flex items-center gap-2 ml-7 sm:ml-0">
                       <div className="w-20 sm:w-16 bg-muted rounded-full h-2">
                         <div 
                           className="bg-primary h-2 rounded-full transition-all duration-300"
                           style={{ width: `${Math.min(100, parseFloat(chain.percentage) || 0)}%` }}
                         />
                       </div>
                       <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
                         {parseFloat(chain.percentage || '0').toFixed(1)}%
                       </span>
                     </div>
                   </div>
                 );
               })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default AdoptionMetrics;