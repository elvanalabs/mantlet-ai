import { supabase } from '@/integrations/supabase/client';

export interface ResearchResponse {
  contextData: string;
  sources: string[];
}

export class ResearchService {
  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      // Get real-time market data if the query is about prices or market info
      let marketData = '';
      if (this.isMarketQuery(query)) {
        marketData = await this.getMarketData(query);
      }
      
      // Generate response using Claude with market data
      const contextData = await this.generateResponse(query, marketData);
      
      return {
        contextData,
        sources: []
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error('Failed to process research query');
    }
  }


  private static isMarketQuery(query: string): boolean {
    const marketKeywords = ['price', 'market', 'trading', 'volume', 'market cap', 'chart'];
    return marketKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
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