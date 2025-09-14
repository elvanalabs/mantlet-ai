import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, BarChart3, Globe, Coins, Users, Info, AlertTriangle, Clock, ExternalLink, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoralisService, TokenHolder } from '@/services/MoralisService';

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
  tokenAddress?: string; // Added for Moralis API calls
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
  const [concentrationData, setConcentrationData] = useState<{
    top10Percentage: number;
    largestHolderPercentage: number;
    riskLevel: 'Decentralized' | 'Semi-Decentralized' | 'Centralized' | 'Highly Centralized';
    riskColor: 'green' | 'yellow' | 'orange' | 'red';
    loading: boolean;
    error?: string;
  }>({
    top10Percentage: 0,
    largestHolderPercentage: 0,
    riskLevel: 'Decentralized',
    riskColor: 'green',
    loading: false
  });

  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Transparency report URLs for specific stablecoins
  const transparencyReports: { [key: string]: string } = {
    'USDC': 'https://www.circle.com/transparency',
    'USDT': 'https://tether.to/transparency/',
    'USDP': 'https://www.paxos.com/usdp-transparency',
    'TUSD': 'https://tusd.io/transparency',
    'PYUSD': 'https://www.paypal.com/us/digital-wallet/manage-money/crypto/pyusd',
    'GUSD': 'https://www.gemini.com/dollar',
    'LUSD': 'https://www.liquity.org/',
    'FRAX': 'https://frax.com/transparency',
    'USDG': 'https://www.paxos.com/usdg-transparency',
    'USDL': 'https://liftdollar.com/transparency',
    'PAXG': 'https://www.paxos.com/paxg-transparency',
    'EURT': 'https://tether.to/en/transparency/',
    'CNHT': 'https://tether.to/en/transparency/',
    'MXNT': 'https://tether.to/en/transparency/'
  };

  const hasTransparencyReport = transparencyReports[adoptionData.stablecoin];

  // TOP 10 STABLECOINS - VERIFIED CONTRACT ADDRESSES (Ethereum Mainnet)
  const tokenAddresses: { [key: string]: string } = {
    // Top tier stablecoins by market cap
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Tether USD
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USD Coin (Circle)
    'USDE': '0x4c19596f5aAfF459fA38B0f7eD92F11AE6543398', // Ethena USDe  
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',  // Dai Stablecoin (MakerDAO)
    'FDUSD': '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409', // First Digital USD
    'USDP': '0x8E870D67F660D95d5be530380D0eC0bd388289E1', // Pax Dollar (Paxos)
    'TUSD': '0x0000000000085d4780B73119b644AE5ecd22b376', // TrueUSD
    'PYUSD': '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8', // PayPal USD
    'FRAX': '0x853d955aCEf822Db058eb8505911ED77F175b99e', // Frax
    'GUSD': '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd'  // Gemini Dollar
  };

  // Fetch concentration risk data
  useEffect(() => {
    const fetchConcentrationData = async () => {
      const tokenAddress = tokenAddresses[adoptionData.stablecoin];
      if (!tokenAddress) return;

      setConcentrationData(prev => ({ ...prev, loading: true, error: undefined }));

      try {
        console.log(`Fetching concentration data for ${adoptionData.stablecoin} (${tokenAddress})`);
        
        const holders = await MoralisService.getTokenHolders(tokenAddress, 'eth', 100);
        
        // Validate that we received proper data
        if (!holders || holders.length === 0) {
          throw new Error('No holder data received from Moralis API');
        }
        
        console.log(`Received ${holders.length} holders from API`);
        
        const riskData = MoralisService.calculateConcentrationRisk(holders);
        
        // Validate that we got meaningful results
        if (riskData.top10Percentage === 0 && riskData.largestHolderPercentage === 0) {
          throw new Error('Unable to calculate concentration metrics - data may be incomplete');
        }
        
        setConcentrationData({
          ...riskData,
          loading: false
        });
        
        console.log(`Successfully calculated concentration risk for ${adoptionData.stablecoin}:`, riskData);
      } catch (error) {
        console.error('Error fetching concentration data:', error);
        setConcentrationData(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to load concentration data' 
        }));
      }
    };

    fetchConcentrationData();
  }, [adoptionData.stablecoin]);

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

          {/* Transparency */}
          {hasTransparencyReport && (
            <Card className="glass border border-border/50 hover:border-primary/20 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Transparency
                    </CardTitle>
                    <MobileTooltip content="Official reserve and audit reports">
                      <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                    </MobileTooltip>
                  </div>
                  <FileText className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">
                    View official attestations and reserve reports
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => window.open(hasTransparencyReport, '_blank')}
                    className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Concentration Risk */}
          {tokenAddresses[adoptionData.stablecoin] && (
            <Card className="glass border border-border/50 hover:border-primary/20 transition-colors md:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Concentration Risk
                    </CardTitle>
                    <MobileTooltip content="Distribution of token ownership among holders">
                      <Info className="w-3 h-3 text-muted-foreground hover:text-primary cursor-help" />
                    </MobileTooltip>
                  </div>
                  <Shield className="w-4 h-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                {concentrationData.loading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : concentrationData.error ? (
                  <div className="text-sm text-muted-foreground py-4 text-center">
                    {concentrationData.error}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Top 10 Holders hold</p>
                        <p className="text-2xl font-bold">{concentrationData.top10Percentage}%</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`${
                          concentrationData.riskColor === 'green' ? 'bg-green-100 text-green-800 border-green-300' :
                          concentrationData.riskColor === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                          concentrationData.riskColor === 'orange' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                          'bg-red-100 text-red-800 border-red-300'
                        }`}
                      >
                        {concentrationData.riskLevel}
                      </Badge>
                    </div>
                    <div className="pt-2 border-t border-border/20">
                      <p className="text-sm font-medium text-muted-foreground">Largest Holder holds</p>
                      <p className="text-lg font-semibold">{concentrationData.largestHolderPercentage}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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