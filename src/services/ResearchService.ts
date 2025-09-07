import axios from 'axios';

export interface ResearchResponse {
  contextData: string;
  sources: string[];
}

interface StablecoinData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  market_cap: number;
  circulating: number;
  chains: string[];
  pegType: string;
  pegMechanism: string;
}

export class ResearchService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private static readonly DEFILLAMA_API = 'https://api.llama.fi';

  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      console.log('Processing stablecoin query:', query);
      
      let contextData = '';
      let sources: string[] = [];

      // Check if this is a descriptive/educational question vs market data request
      const isDescriptiveQuery = this.isDescriptiveQuery(query);
      const isMarketDataQuery = this.isMarketDataQuery(query);

      if (isMarketDataQuery && !isDescriptiveQuery) {
        // Only fetch market data for specific market data requests
        console.log('Fetching stablecoin market data for market data query...');
        const stablecoinData = await this.fetchStablecoinData();
        if (stablecoinData) {
          contextData = stablecoinData;
          sources.push('DeFi Llama Stablecoins', 'CoinGecko Market Data');
        }
      }

      // Get specialized stablecoin analysis from Claude
      const analysis = await this.getClaudeAnalysis(query, contextData);
      
      return {
        contextData: analysis || 'I specialize in stablecoin analysis. Please ask me about specific stablecoins, market caps, yields, mechanisms, or stability analysis.',
        sources
      };
    } catch (error) {
      console.error('Stablecoin query processing error:', error);
      throw error;
    }
  }

  private static isDescriptiveQuery(query: string): boolean {
    const descriptiveKeywords = [
      'what are', 'what is', 'how do', 'how does', 'explain', 'define', 'definition',
      'why', 'how', 'tell me about', 'describe', 'difference between', 'compare',
      'mechanism', 'work', 'backed', 'pegged', 'stability', 'risk', 'advantage',
      'disadvantage', 'benefit', 'problem', 'issue', 'future', 'trend', 'history'
    ];
    
    const lowerQuery = query.toLowerCase();
    return descriptiveKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private static isMarketDataQuery(query: string): boolean {
    const marketDataKeywords = [
      'market cap', 'price', 'top', 'list', 'ranking', 'volume', 'supply',
      'largest', 'biggest', 'circulation', 'trading', 'performance', 'chart',
      'current price', 'market size', 'dominance', 'mcap'
    ];
    
    const lowerQuery = query.toLowerCase();
    return marketDataKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  private static async fetchStablecoinData(): Promise<string | null> {
    try {
      console.log('Fetching stablecoin data from DeFi Llama...');
      // Use the correct DeFi Llama API endpoint for stablecoins
      const response = await axios.get(`https://stablecoins.llama.fi/stablecoins`);
      console.log('Stablecoin API response:', response.data);
      
      // The response should have peggedAssets array
      const stablecoins = response.data.peggedAssets || [];
      const topStablecoins = Array.isArray(stablecoins) ? stablecoins.slice(0, 15) : [];
      
      if (topStablecoins.length === 0) {
        console.log('No stablecoin data found');
        // Fallback: fetch top stablecoins from CoinGecko if DeFi Llama fails
        return await this.fetchStablecoinDataFromCoinGecko();
      }

      console.log('Found stablecoins:', topStablecoins.length);
      return `TOP STABLECOINS BY MARKET CAP:\n` +
        topStablecoins.map((coin: any, index: number) => 
          `${index + 1}. ${coin.name} (${coin.symbol}): ` +
          `$${(coin.circulating?.peggedUSD || 0 / 1e9).toFixed(2)}B | ` +
          `Chains: ${coin.chainCirculating ? Object.keys(coin.chainCirculating).slice(0, 3).join(', ') : 'N/A'} | ` +
          `Peg: ${coin.pegType || 'USD'}`
        ).join('\n');
    } catch (error) {
      console.error('Stablecoin data error:', error);
      // Fallback to CoinGecko for stablecoin data
      return await this.fetchStablecoinDataFromCoinGecko();
    }
  }

  private static async fetchStablecoinDataFromCoinGecko(): Promise<string | null> {
    try {
      console.log('Fetching stablecoin data from CoinGecko as fallback...');
      const stablecoinIds = ['tether', 'usd-coin', 'binance-usd', 'dai', 'frax', 'trueusd', 'paxos-standard', 'gemini-dollar', 'terra-usd', 'fei-usd', 'liquity-usd', 'alchemix-usd', 'magic-internet-money', 'neutrino', 'usdd'];
      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: stablecoinIds.join(','),
          order: 'market_cap_desc',
          per_page: 15,
          page: 1,
          price_change_percentage: '24h,7d'
        }
      });

      if (!response.data || response.data.length === 0) return null;

      return `TOP STABLECOINS BY MARKET CAP:\n` +
        response.data.map((coin: any, index: number) => 
          `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): ` +
          `$${(coin.market_cap / 1e9).toFixed(2)}B | ` +
          `Price: $${coin.current_price?.toFixed(4) || '1.0000'} | ` +
          `24h: ${coin.price_change_percentage_24h?.toFixed(2) || '0.00'}% | ` +
          `7d: ${coin.price_change_percentage_7d_in_currency?.toFixed(2) || '0.00'}%`
        ).join('\n');
    } catch (error) {
      console.error('CoinGecko stablecoin fallback error:', error);
      return null;
    }
  }

  private static async searchWeb(query: string): Promise<string | null> {
    try {
      // This would integrate with a web search API
      // For now, return a placeholder that indicates web search capability
      console.log('Web search not yet implemented for query:', query);
      return `Web search results for "${query}" would appear here. This feature requires integration with a search API.`;
    } catch (error) {
      console.error('Web search error:', error);
      return null;
    }
  }

  private static async getClaudeAnalysis(query: string, contextData: string): Promise<string | null> {
    try {
      console.log('Getting Claude analysis for stablecoin query...');
      
      const response = await fetch('/api/claude-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          context: contextData
        }),
      });

      if (!response.ok) {
        console.error('Claude API error:', response.status);
        return null;
      }

      const data = await response.json();
      return data.response || null;
    } catch (error) {
      console.error('Claude analysis error:', error);
      return null;
    }
  }
}