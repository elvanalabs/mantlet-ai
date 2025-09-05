import axios from 'axios';

export interface ResearchResponse {
  answer: string;
  sources: string[];
}

interface CoinGeckoPrice {
  id: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  market_cap_rank: number;
}

interface DeFiLlamaProtocol {
  name: string;
  tvl: number;
  change_1d: number;
  category: string;
}

export class ResearchService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private static readonly DEFILLAMA_API = 'https://api.llama.fi';

  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      // Analyze query to determine data sources needed
      const queryLower = query.toLowerCase();
      const sources: string[] = [];
      let contextData = '';

      // Check if query is about price/market data
      if (this.isPriceQuery(queryLower)) {
        const priceData = await this.fetchCoinGeckoData(query);
        if (priceData) {
          contextData += `Market Data: ${priceData}\n\n`;
          sources.push('CoinGecko');
        }
      }

      // Check if query is about DeFi protocols
      if (this.isDeFiQuery(queryLower)) {
        const defiData = await this.fetchDeFiLlamaData(query);
        if (defiData) {
          contextData += `DeFi Data: ${defiData}\n\n`;
          sources.push('DeFi Llama');
        }
      }

      // For general web search
      if (this.isGeneralQuery(queryLower) || !contextData) {
        sources.push('Web Search');
      }

      // Generate response using Claude (placeholder - would need actual API integration)
      const answer = await this.generateClaudeResponse(query, contextData);

      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('Research service error:', error);
      return {
        answer: 'I apologize, but I encountered an error while processing your query. Please try again with a different question.',
        sources: []
      };
    }
  }

  private static isPriceQuery(query: string): boolean {
    const priceKeywords = ['price', 'cost', 'value', 'worth', 'market cap', 'bitcoin', 'ethereum', 'btc', 'eth', 'token'];
    return priceKeywords.some(keyword => query.includes(keyword));
  }

  private static isDeFiQuery(query: string): boolean {
    const defiKeywords = ['defi', 'protocol', 'tvl', 'yield', 'liquidity', 'aave', 'uniswap', 'compound', 'makerdao'];
    return defiKeywords.some(keyword => query.includes(keyword));
  }

  private static isGeneralQuery(query: string): boolean {
    const generalKeywords = ['what', 'how', 'why', 'when', 'where', 'explain', 'tell me'];
    return generalKeywords.some(keyword => query.includes(keyword));
  }

  private static async fetchCoinGeckoData(query: string): Promise<string | null> {
    try {
      // Extract potential coin names from query
      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 10,
          page: 1
        }
      });

      const topCoins: CoinGeckoPrice[] = response.data;
      
      // Format price data
      return topCoins.map(coin => 
        `${coin.id}: $${coin.current_price.toLocaleString()} (${coin.price_change_percentage_24h > 0 ? '+' : ''}${coin.price_change_percentage_24h.toFixed(2)}% 24h)`
      ).join(', ');
    } catch (error) {
      console.error('CoinGecko API error:', error);
      return null;
    }
  }

  private static async fetchDeFiLlamaData(query: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.DEFILLAMA_API}/protocols`);
      const protocols: DeFiLlamaProtocol[] = response.data.slice(0, 10);
      
      return protocols.map(protocol => 
        `${protocol.name}: $${(protocol.tvl / 1e9).toFixed(2)}B TVL (${protocol.change_1d > 0 ? '+' : ''}${protocol.change_1d.toFixed(2)}% 1d)`
      ).join(', ');
    } catch (error) {
      console.error('DeFi Llama API error:', error);
      return null;
    }
  }

  private static async generateClaudeResponse(query: string, contextData: string): Promise<string> {
    // Placeholder for Claude API integration
    // In a real implementation, you would call the Anthropic API here
    
    if (contextData) {
      return `Based on the latest data:\n\n${contextData}\n\nRegarding your question "${query}":\n\nThis is a comprehensive analysis based on real-time Web3 data. The market shows current trends and the DeFi ecosystem continues to evolve with new protocols and innovations. For more specific analysis, please provide additional details about what aspects you'd like me to focus on.`;
    }

    return `I understand you're asking about "${query}". While I don't have specific real-time data for this query right now, I can provide general insights about Web3 and blockchain topics. For more accurate and current information, please try asking about specific tokens, protocols, or include keywords like "price", "DeFi", or "market data".`;
  }
}