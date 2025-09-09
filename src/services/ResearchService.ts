import { supabase } from '@/integrations/supabase/client';

export interface ResearchResponse {
  contextData: string;
  sources: string[];
}

export class ResearchService {
  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      // First, search the knowledge base for relevant information
      const knowledgeBaseResults = await this.searchKnowledgeBase(query);
      
      // Get real-time market data if the query is about prices or market info
      let marketData = '';
      if (this.isMarketQuery(query)) {
        marketData = await this.getMarketData(query);
      }
      
      // Combine knowledge base results with real-time data
      const contextData = await this.generateResponse(query, knowledgeBaseResults, marketData);
      
      // Extract sources from knowledge base results
      const sources = knowledgeBaseResults.map(item => item.url || item.title).filter(Boolean);
      
      return {
        contextData,
        sources
      };
    } catch (error) {
      console.error('Error processing query:', error);
      throw new Error('Failed to process research query');
    }
  }

  private static async searchKnowledgeBase(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase.functions.invoke('knowledge-base-manager', {
        body: {
          action: 'search',
          query
        }
      });

      if (error) {
        console.error('Knowledge base search error:', error);
        return [];
      }

      return data?.data || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
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
    knowledgeBaseResults: any[], 
    marketData: string
  ): Promise<string> {
    try {
      // Prepare context from knowledge base
      const knowledgeContext = knowledgeBaseResults
        .slice(0, 3) // Limit to top 3 results
        .map(item => `${item.title}: ${item.summary}`)
        .join('\n\n');

      // Prepare the prompt for Claude
      const prompt = `You are Mantlet, an AI assistant specialized in stablecoins. Answer the following query using the provided context and market data.

Query: ${query}

Knowledge Base Context:
${knowledgeContext}

${marketData ? `Current Market Data:\n${marketData}\n` : ''}

Please provide a comprehensive and accurate response focused on stablecoins. If the query is about comparisons, provide detailed analysis. If it's about explanations, be thorough but accessible. Always cite your sources when possible.`;

      const { data, error } = await supabase.functions.invoke('claude-chat', {
        body: {
          message: prompt,
          model: 'claude-3-5-sonnet-20241022'
        }
      });

      if (error || !data?.success) {
        console.error('Claude API error:', error);
        // Fallback response using knowledge base data
        return this.generateFallbackResponse(query, knowledgeBaseResults, marketData);
      }

      return data.response;
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(query, knowledgeBaseResults, marketData);
    }
  }

  private static generateFallbackResponse(
    query: string, 
    knowledgeBaseResults: any[], 
    marketData: string
  ): string {
    let response = `Based on the available information about "${query}":\n\n`;
    
    if (knowledgeBaseResults.length > 0) {
      response += knowledgeBaseResults
        .slice(0, 2)
        .map(item => `• ${item.summary}`)
        .join('\n\n');
    }
    
    if (marketData) {
      response += `\n\nCurrent Market Information:\n${marketData}`;
    }
    
    if (knowledgeBaseResults.length === 0 && !marketData) {
      response += "I don't have specific information about this query in my current knowledge base. Please try rephrasing your question or ask about general stablecoin topics.";
    }
    
    return response;
  }

  // Method to populate knowledge base with the provided URLs
  static async populateKnowledgeBase(): Promise<void> {
    const urls = [
      'https://www.ft.com/content/135fb3dd-2395-4f04-8cc6-7fb0e87cd092',
      'https://timesofindia.indiatimes.com/technology/tech-news/meta-reportedly-exploring-stablecoin-deployment-plans-to-bring-crypto-support-to-facebook-whatsapp/articleshow/121107396.cms',
      'https://www.coindesk.com/business/2025/08/12/coinbase-revives-stablecoin-funding-program-to-bolster-defi-liquidity',
      'https://cointelegraph.com/news/stablecoin-users-53-percent-growth-2025',
      'https://bankwatch.ca/2025/06/27/current-government-and-financial-institution-reports-on-stablecoin-trends/',
      'https://arxiv.org/abs/2412.18182',
      'https://minepi.com/',
      'https://stabletoken.wyo.gov/',
      'https://custodiabank.com/press/custodia-issues-Stablecoin',
      'https://resolv.xyz/',
      'https://ripple.com',
      'https://www.avax.network/about/blog/frnt-goes-live-the-first-u-s-state-issued-stablecoin-you-can-actually-use',
      'https://ripple.com/solutions/stablecoin/',
      'https://cointelegraph.com/tags/blockchain',
      'https://cointelegraph.com/markets',
      'https://cointelegraph.com/tags/regulation'
    ];

    try {
      const { data, error } = await supabase.functions.invoke('knowledge-base-manager', {
        body: {
          action: 'populate',
          urls
        }
      });

      if (error) {
        console.error('Error populating knowledge base:', error);
        throw error;
      }

      console.log('Knowledge base populated successfully:', data);
    } catch (error) {
      console.error('Failed to populate knowledge base:', error);
      throw error;
    }
  }
}