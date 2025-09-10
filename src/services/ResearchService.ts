import { supabase } from '@/integrations/supabase/client';

export interface ResearchResponse {
  contextData: string;
  sources: string[];
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
}

export class ResearchService {
  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      // Check if query is about a specific stablecoin
      const stablecoinSymbols = this.extractStablecoinSymbols(query);
      
      // Check if query is about news
      const isNewsQuery = this.isNewsQuery(query);
      
      // Get real-time market data if the query is about prices or market info
      let marketData = '';
      if (this.isMarketQuery(query)) {
        marketData = await this.getMarketData(query);
      }
      
      // Get news results if it's a news query
      let newsResults = undefined;
      if (isNewsQuery) {
        newsResults = await this.getNewsData(query);
      }
      
      // Generate response using Claude with market data
      const contextData = await this.generateResponse(query, marketData);
      
      // Get chart data if it's a single stablecoin query
      let chartData = undefined;
      if (stablecoinSymbols.length === 1) {
        chartData = await this.getChartData(stablecoinSymbols[0]);
      }
      
      return {
        contextData,
        sources: [],
        chartData,
        newsResults
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error('Failed to process research query');
    }
  }


  private static isNewsQuery(query: string): boolean {
    const newsKeywords = ['news', 'latest', 'recent', 'updates', 'headlines', 'breaking'];
    return newsKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private static isMarketQuery(query: string): boolean {
    const marketKeywords = ['price', 'market', 'trading', 'volume', 'market cap', 'chart'];
    return marketKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private static async getNewsData(query: string): Promise<Array<{
    title: string;
    link: string;
    snippet: string;
    date: string;
    source: string;
    thumbnail?: string;
    position: number;
  }> | undefined> {
    try {
      // Create a stablecoin-focused search query
      const searchQuery = query.toLowerCase().includes('stablecoin') 
        ? query 
        : `${query} stablecoins`;

      const { data, error } = await supabase.functions.invoke('serp-search', {
        body: {
          query: searchQuery,
          location: 'United States',
          num: 6
        }
      });

      if (error || !data?.success) {
        console.error('News search error:', error);
        return undefined;
      }

      return data.results;
    } catch (error) {
      console.error('Error getting news data:', error);
      return undefined;
    }
  }

  private static async getMarketData(query: string): Promise<string> {
    try {
      // Extract stablecoin symbols from query
      const symbols = this.extractStablecoinSymbols(query);
      
      if (symbols.length === 0) {
        return '';
      }

      const { data, error } = await supabase.functions.invoke('moralis-api', {
        body: {
          action: 'getTokenPrices',
          symbols
        }
      });

      if (error || !data?.success) {
        console.error('Market data error:', error);
        return '';
      }

      return this.formatMarketData(data.data);
    } catch (error) {
      console.error('Error getting market data:', error);
      return '';
    }
  }

  private static extractStablecoinSymbols(query: string): string[] {
    const stablecoinMap: { [key: string]: string } = {
      'usdt': 'USDT',
      'usdc': 'USDC', 
      'dai': 'DAI',
      'busd': 'BUSD',
      'frax': 'FRAX',
      'tusd': 'TUSD',
      'usdp': 'USDP',
      'lusd': 'LUSD'
    };

    const symbols: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    Object.keys(stablecoinMap).forEach(key => {
      if (lowerQuery.includes(key)) {
        symbols.push(stablecoinMap[key]);
      }
    });

    return symbols;
  }

  private static formatMarketData(marketData: any): string {
    if (!marketData || !Array.isArray(marketData)) {
      return '';
    }

    return marketData.map(token => 
      `${token.symbol}: $${token.usdPrice} (24h: ${token.priceChange24h || 'N/A'}%)`
    ).join('\n');
  }

  private static async generateResponse(
    query: string, 
    marketData: string
  ): Promise<string> {
    try {
      // Improve the query format for single words
      let formattedQuery = query;
      if (query.trim().split(' ').length === 1) {
        // If it's a single word (like "USDT"), make it a proper question
        formattedQuery = `What is ${query}? Please provide comprehensive information.`;
      }

      // Prepare the prompt for Claude
      const prompt = `Query: ${formattedQuery}

${marketData ? `Current Market Data:\n${marketData}` : ''}`;

      console.log('Calling Claude with prompt:', prompt);

      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: prompt,
          model: 'claude-opus-4-20250514'
        }
      });

      if (error || !data?.success) {
        console.error('Claude API error details:', { error, data });
        return this.generateFallbackResponse(query, marketData);
      }

      console.log('Claude response received:', data);
      return data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(query, marketData);
    }
  }

  private static async getChartData(symbol: string): Promise<{
    symbol: string;
    data: Array<{
      date: string;
      price: number;
      volume?: number;
    }>;
  } | undefined> {
    try {
      // Generate mock historical data for now (can be replaced with real API later)
      const mockData = this.generateMockChartData(symbol);
      
      return {
        symbol,
        data: mockData
      };
    } catch (error) {
      console.error('Error getting chart data:', error);
      return undefined;
    }
  }

  private static generateMockChartData(symbol: string): Array<{
    date: string;
    price: number;
    volume?: number;
  }> {
    const data = [];
    const basePrice = symbol === 'USDT' ? 1.0005 : 0.9998; // Slight variation around $1
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const variation = (Math.random() - 0.5) * 0.003; // Small price variations
      const price = Math.max(0.995, Math.min(1.005, basePrice + variation));
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(6)),
        volume: Math.floor(Math.random() * 100000000) + 50000000
      });
    }
    
    return data;
  }

  private static generateFallbackResponse(
    query: string, 
    marketData: string
  ): string {
    let response = `Based on the available information about "${query}":\n\n`;
    
    if (marketData) {
      response += `Current Market Information:\n${marketData}`;
    } else {
      response += "I don't have specific market information for this query. Please try rephrasing your question or ask about general stablecoin topics.";
    }
    
    return response;
  }
}