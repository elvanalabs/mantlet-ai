import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ChartData {
  symbol: string;
  data: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
}

interface StablecoinChartProps {
  chartData: ChartData;
}

const StablecoinChart: React.FC<StablecoinChartProps> = ({ chartData }) => {
  console.log('📈 StablecoinChart received data:', chartData);
  const { symbol, data } = chartData;
  
  // Calculate price trend
  const firstPrice = data[0]?.price || 1;
  const lastPrice = data[data.length - 1]?.price || 1;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(4);
  
  const getTrendIcon = () => {
    if (Math.abs(priceChange) < 0.0001) return <Minus className="w-4 h-4 text-muted-foreground" />;
    return priceChange > 0 
      ? <TrendingUp className="w-4 h-4 text-green-500" />
      : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (Math.abs(priceChange) < 0.0001) return 'text-muted-foreground';
    return priceChange > 0 ? 'text-green-500' : 'text-red-500';
  };

  // Format data for chart
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }));

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{symbol} Price Chart (30 Days)</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {priceChange > 0 ? '+' : ''}{priceChangePercent}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                domain={['dataMin - 0.002', 'dataMax + 0.002']}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
                labelFormatter={(label) => `Date: ${label}`}
                formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'hsl(var(--primary))', strokeWidth: 2, fill: 'hsl(var(--background))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <span>Current Price: ${lastPrice.toFixed(6)}</span>
          <span>30-day Range: ${Math.min(...data.map(d => d.price)).toFixed(4)} - ${Math.max(...data.map(d => d.price)).toFixed(4)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StablecoinChart;