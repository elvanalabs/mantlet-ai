import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitCompare, Shield, TrendingUp, Building, Globe, Award } from 'lucide-react';

interface ComparisonCoin {
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
}

interface ComparisonData {
  coins: ComparisonCoin[];
}

interface ComparisonTableProps {
  comparisonData: ComparisonData;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ comparisonData }) => {
  const { coins } = comparisonData;

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'default';
      case 'medium': return 'secondary';  
      case 'high': return 'destructive';
      default: return 'outline';
    }
  };

  const comparisonRows = [
    { 
      key: 'backing', 
      label: 'Backing Type', 
      icon: <Shield className="w-4 h-4 text-blue-500" />,
      getValue: (coin: ComparisonCoin) => coin.backing 
    },
    { 
      key: 'marketCap', 
      label: 'Market Cap', 
      icon: <TrendingUp className="w-4 h-4 text-green-500" />,
      getValue: (coin: ComparisonCoin) => coin.marketCap 
    },
    { 
      key: 'issuer', 
      label: 'Issuer', 
      icon: <Building className="w-4 h-4 text-purple-500" />,
      getValue: (coin: ComparisonCoin) => coin.issuer 
    },
    { 
      key: 'chain', 
      label: 'Blockchain', 
      icon: <Globe className="w-4 h-4 text-cyan-500" />,
      getValue: (coin: ComparisonCoin) => coin.chain 
    },
    { 
      key: 'yield', 
      label: 'Yield/APY', 
      icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
      getValue: (coin: ComparisonCoin) => coin.yield 
    },
    { 
      key: 'regulation', 
      label: 'Regulation', 
      icon: <Award className="w-4 h-4 text-indigo-500" />,
      getValue: (coin: ComparisonCoin) => coin.regulation 
    },
    { 
      key: 'use_case', 
      label: 'Primary Use Case', 
      icon: <GitCompare className="w-4 h-4 text-pink-500" />,
      getValue: (coin: ComparisonCoin) => coin.use_case 
    }
  ];

  return (
    <Card className="w-full mt-4 glass">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GitCompare className="w-5 h-5 text-primary" />
          Stablecoin Comparison
          <Badge variant="secondary" className="text-xs">
            {coins.length} coins
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left p-4 font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <GitCompare className="w-4 h-4 text-muted-foreground" />
                    Criteria
                  </div>
                </th>
                {coins.map((coin) => (
                  <th key={coin.symbol} className="text-center p-4 min-w-[160px]">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                          {coin.symbol.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{coin.symbol}</div>
                          <div className="text-xs text-muted-foreground">{coin.name}</div>
                        </div>
                      </div>
                      <Badge 
                        variant={getRiskBadgeVariant(coin.risk_level)}
                        className="text-xs"
                      >
                        {coin.risk_level} Risk
                      </Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody>
              {comparisonRows.map((row, index) => (
                <tr 
                  key={row.key} 
                  className={`border-b border-border/30 hover:bg-muted/20 transition-colors ${
                    index % 2 === 0 ? 'bg-muted/5' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2 font-medium text-foreground">
                      {row.icon}
                      {row.label}
                    </div>
                  </td>
                  {coins.map((coin) => (
                    <td key={`${coin.symbol}-${row.key}`} className="p-4 text-center">
                      <span className="text-sm text-muted-foreground">
                        {row.getValue(coin)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-muted/10 border-t border-border/30">
          <div className="text-xs text-muted-foreground text-center">
            Data is approximate and for comparison purposes. Always verify current information from official sources.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonTable;