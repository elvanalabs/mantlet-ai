import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, Globe, Coins, Users } from 'lucide-react';

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
}

interface AdoptionMetricsProps {
  adoptionData: AdoptionData;
}

const AdoptionMetrics: React.FC<AdoptionMetricsProps> = ({ adoptionData }) => {
  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/[^\d.-]/g, ''));
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  return (
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Circulating Supply
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Market Share
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                24H Transaction Volume
              </CardTitle>
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
              <CardTitle className="text-sm font-medium text-muted-foreground">
                30-Day Growth/Decline
              </CardTitle>
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

        {/* Chain Distribution */}
        <Card className="glass border border-border/50 hover:border-primary/20 transition-colors md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chain Distribution
              </CardTitle>
              <Globe className="w-4 h-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adoptionData.chainDistribution.map((chain, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {chain.chain}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {formatNumber(chain.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${chain.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground min-w-[3rem] text-right">
                      {chain.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdoptionMetrics;