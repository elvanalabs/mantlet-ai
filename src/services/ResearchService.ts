import axios from 'axios';

export interface ResearchResponse {
  answer: string;
  sources: string[];
}

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_date: string;
  atl: number;
  atl_date: string;
}

interface CoinGeckoDetailedCoin {
  id: string;
  name: string;
  symbol: string;
  description: { en: string };
  market_cap_rank: number;
  coingecko_rank: number;
  developer_score: number;
  community_score: number;
  liquidity_score: number;
  public_interest_score: number;
}

interface DeFiLlamaProtocol {
  id: string;
  name: string;
  address?: string;
  symbol?: string;
  url?: string;
  description?: string;
  chain?: string;
  logo?: string;
  audits?: string;
  audit_note?: string;
  gecko_id?: string;
  cmcId?: string;
  category?: string;
  chains?: string[];
  module?: string;
  twitter?: string;
  forkedFrom?: string[];
  oracles?: string[];
  listedAt?: number;
  methodology?: string;
  slug?: string;
  tvl: number;
  chainTvls?: { [chain: string]: number };
  change_1h?: number;
  change_1d?: number;
  change_7d?: number;
  tokenBreakdowns?: any;
  mcap?: number;
}

interface GlobalMarketData {
  total_market_cap: { [currency: string]: number };
  total_volume: { [currency: string]: number };
  market_cap_percentage: { [symbol: string]: number };
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

export class ResearchService {
  private static readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';
  private static readonly DEFILLAMA_API = 'https://api.llama.fi';

  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      const queryLower = query.toLowerCase();
      const sources: string[] = [];
      let contextData = '';

      // Always fetch comprehensive data for better analysis
      const dataPromises: Promise<string | null>[] = [];

      // Comprehensive market data
      dataPromises.push(this.fetchCoinGeckoMarketData(query));
      dataPromises.push(this.fetchGlobalMarketData());
      dataPromises.push(this.fetchTrendingData());
      
      // DeFi comprehensive data
      dataPromises.push(this.fetchDeFiProtocolData(query));
      dataPromises.push(this.fetchChainTVLData());
      dataPromises.push(this.fetchYieldData());

      // Specific query-based data
      if (this.isPriceQuery(queryLower)) {
        dataPromises.push(this.fetchDetailedCoinData(query));
        dataPromises.push(this.fetchPriceHistoryData(query));
      }

      if (this.isDeFiQuery(queryLower)) {
        dataPromises.push(this.fetchProtocolDetailsData(query));
        dataPromises.push(this.fetchStablecoinData());
      }

      if (this.isChainQuery(queryLower)) {
        dataPromises.push(this.fetchChainSpecificData(query));
      }

      // Fetch all data concurrently
      const results = await Promise.allSettled(dataPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          contextData += result.value + '\n\n';
          
          // Add appropriate source labels
          if (index === 0) sources.push('CoinGecko Market Data');
          else if (index === 1) sources.push('Global Market Stats');
          else if (index === 2) sources.push('Trending Cryptocurrencies');
          else if (index === 3) sources.push('DeFi Protocol Data');
          else if (index === 4) sources.push('Chain TVL Analytics');
          else if (index === 5) sources.push('Yield Farming Data');
          else if (index === 6) sources.push('Detailed Coin Analysis');
          else if (index === 7) sources.push('Price History');
          else if (index === 8) sources.push('Protocol Details');
          else if (index === 9) sources.push('Stablecoin Data');
          else if (index === 10) sources.push('Chain-Specific Data');
        }
      });

      // Generate comprehensive response using Claude AI
      const answer = await this.generateClaudeResponse(query, contextData);

      return {
        answer,
        sources: sources.length > 0 ? sources : ['Web3 Knowledge Base']
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
    const priceKeywords = [
      'price', 'cost', 'value', 'worth', 'market cap', 'volume', 'high', 'low', 'ath', 'atl',
      'bitcoin', 'ethereum', 'btc', 'eth', 'token', 'coin', 'crypto', 'cryptocurrency',
      'solana', 'ada', 'bnb', 'xrp', 'doge', 'matic', 'avax', 'dot', 'link', 'uni',
      'near', 'atom', 'icp', 'fil', 'vet', 'algo', 'mana', 'sand', 'axs', 'chr'
    ];
    return priceKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private static isDeFiQuery(query: string): boolean {
    const defiKeywords = [
      'defi', 'protocol', 'tvl', 'yield', 'liquidity', 'staking', 'lending', 'borrowing',
      'aave', 'uniswap', 'compound', 'makerdao', 'curve', 'convex', 'yearn', 'synthetix',
      'pancakeswap', 'sushiswap', 'balancer', 'trader joe', 'gmx', 'dydx', 'perpetual',
      'farm', 'farming', 'pool', 'amm', 'dex', 'exchange', 'swap'
    ];
    return defiKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private static isChainQuery(query: string): boolean {
    const chainKeywords = [
      'ethereum', 'polygon', 'bsc', 'avalanche', 'solana', 'fantom', 'arbitrum', 'optimism',
      'terra', 'cosmos', 'near', 'harmony', 'moonriver', 'cronos', 'aurora', 'celo',
      'chain', 'network', 'blockchain', 'layer 1', 'layer 2', 'l1', 'l2'
    ];
    return chainKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private static isGeneralQuery(query: string): boolean {
    const generalKeywords = ['what', 'how', 'why', 'when', 'where', 'explain', 'tell me', 'define'];
    return generalKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  // === COINGECKO API METHODS ===
  
  private static async fetchCoinGeckoMarketData(query: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 20,
          page: 1,
          sparkline: false,
          price_change_percentage: '1h,24h,7d,30d'
        }
      });

      const coins: CoinGeckoPrice[] = response.data;
      
      return `MARKET DATA OVERVIEW:\n` +
        coins.slice(0, 10).map(coin => 
          `${coin.name} (${coin.symbol.toUpperCase()}): $${coin.current_price.toLocaleString()} ` +
          `| 24h: ${coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}% ` +
          `| Rank: #${coin.market_cap_rank} ` +
          `| MCap: $${(coin.market_cap / 1e9).toFixed(2)}B ` +
          `| Vol: $${(coin.total_volume / 1e6).toFixed(0)}M`
        ).join('\n');
    } catch (error) {
      console.error('CoinGecko market data error:', error);
      return null;
    }
  }

  private static async fetchGlobalMarketData(): Promise<string | null> {
    try {
      const response = await axios.get(`${this.COINGECKO_API}/global`);
      const global = response.data.data;
      
      return `GLOBAL MARKET STATS:\n` +
        `Total Market Cap: $${(global.total_market_cap.usd / 1e12).toFixed(2)} Trillion\n` +
        `24h Trading Volume: $${(global.total_volume.usd / 1e9).toFixed(0)} Billion\n` +
        `Bitcoin Dominance: ${global.market_cap_percentage.btc?.toFixed(1) || 'N/A'}%\n` +
        `Ethereum Dominance: ${global.market_cap_percentage.eth?.toFixed(1) || 'N/A'}%\n` +
        `Market Cap Change 24h: ${global.market_cap_change_percentage_24h_usd?.toFixed(2) || 'N/A'}%\n` +
        `Active Cryptocurrencies: ${global.active_cryptocurrencies?.toLocaleString() || 'N/A'}\n` +
        `Markets: ${global.markets?.toLocaleString() || 'N/A'}`;
    } catch (error) {
      console.error('Global market data error:', error);
      return null;
    }
  }

  private static async fetchTrendingData(): Promise<string | null> {
    try {
      const [trendingResponse, gainersResponse] = await Promise.all([
        axios.get(`${this.COINGECKO_API}/search/trending`),
        axios.get(`${this.COINGECKO_API}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            order: 'price_change_percentage_24h_desc',
            per_page: 5,
            page: 1
          }
        })
      ]);

      const trending = trendingResponse.data.coins.slice(0, 5);
      const gainers = gainersResponse.data.slice(0, 5);
      
      const trendingText = trending.map((item: any) => 
        `${item.item.name} (${item.item.symbol}) - Rank: #${item.item.market_cap_rank || 'N/A'}`
      ).join('\n');
      
      const gainersText = gainers.map((coin: CoinGeckoPrice) => 
        `${coin.name}: +${coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}%`
      ).join('\n');

      return `TRENDING COINS:\n${trendingText}\n\nTOP GAINERS 24H:\n${gainersText}`;
    } catch (error) {
      console.error('Trending data error:', error);
      return null;
    }
  }

  private static async fetchDetailedCoinData(query: string): Promise<string | null> {
    try {
      // Extract potential coin ID from query
      const coinId = this.extractCoinId(query);
      if (!coinId) return null;

      const response = await axios.get(`${this.COINGECKO_API}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: true,
          developer_data: true
        }
      });

      const coin = response.data;
      const marketData = coin.market_data;

      return `DETAILED ANALYSIS - ${coin.name} (${coin.symbol.toUpperCase()}):\n` +
        `Current Price: $${marketData.current_price?.usd?.toLocaleString() || 'N/A'}\n` +
        `All-Time High: $${marketData.ath?.usd?.toLocaleString() || 'N/A'} (${marketData.ath_date?.usd?.split('T')[0] || 'N/A'})\n` +
        `All-Time Low: $${marketData.atl?.usd?.toLocaleString() || 'N/A'} (${marketData.atl_date?.usd?.split('T')[0] || 'N/A'})\n` +
        `Market Cap: $${marketData.market_cap?.usd ? (marketData.market_cap.usd / 1e9).toFixed(2) + 'B' : 'N/A'}\n` +
        `Fully Diluted Valuation: $${marketData.fully_diluted_valuation?.usd ? (marketData.fully_diluted_valuation.usd / 1e9).toFixed(2) + 'B' : 'N/A'}\n` +
        `Circulating Supply: ${marketData.circulating_supply?.toLocaleString() || 'N/A'}\n` +
        `Total Supply: ${marketData.total_supply?.toLocaleString() || 'N/A'}\n` +
        `Max Supply: ${marketData.max_supply?.toLocaleString() || 'Unlimited'}\n` +
        `Price Changes: 1h: ${marketData.price_change_percentage_1h_in_currency?.usd?.toFixed(2) || 'N/A'}% | ` +
        `24h: ${marketData.price_change_percentage_24h?.toFixed(2) || 'N/A'}% | ` +
        `7d: ${marketData.price_change_percentage_7d?.toFixed(2) || 'N/A'}% | ` +
        `30d: ${marketData.price_change_percentage_30d?.toFixed(2) || 'N/A'}%`;
    } catch (error) {
      console.error('Detailed coin data error:', error);
      return null;
    }
  }

  private static async fetchPriceHistoryData(query: string): Promise<string | null> {
    try {
      const coinId = this.extractCoinId(query);
      if (!coinId) return null;

      const response = await axios.get(`${this.COINGECKO_API}/coins/${coinId}/market_chart`, {
        params: {
          vs_currency: 'usd',
          days: '7'
        }
      });

      const prices = response.data.prices;
      if (!prices || prices.length === 0) return null;

      const last7Days = prices.slice(-7);
      const priceHistory = last7Days.map((price: [number, number]) => {
        const date = new Date(price[0]).toLocaleDateString();
        return `${date}: $${price[1].toFixed(2)}`;
      }).join('\n');

      return `7-DAY PRICE HISTORY:\n${priceHistory}`;
    } catch (error) {
      console.error('Price history data error:', error);
      return null;
    }
  }

  // === DEFILLAMA API METHODS ===

  private static async fetchDeFiProtocolData(query: string): Promise<string | null> {
    try {
      const response = await axios.get(`${this.DEFILLAMA_API}/protocols`);
      const protocols: DeFiLlamaProtocol[] = response.data.slice(0, 15);
      
      return `TOP DEFI PROTOCOLS BY TVL:\n` +
        protocols.map((protocol, index) => 
          `${index + 1}. ${protocol.name}: $${(protocol.tvl / 1e9).toFixed(2)}B TVL ` +
          `| 1d: ${protocol.change_1d ? (protocol.change_1d > 0 ? '+' : '') + protocol.change_1d.toFixed(2) + '%' : 'N/A'} ` +
          `| Category: ${protocol.category || 'N/A'} ` +
          `| Chain: ${protocol.chain || (protocol.chains ? protocol.chains[0] : 'Multi-chain')}`
        ).join('\n');
    } catch (error) {
      console.error('DeFi protocol data error:', error);
      return null;
    }
  }

  private static async fetchChainTVLData(): Promise<string | null> {
    try {
      const response = await axios.get(`${this.DEFILLAMA_API}/chains`);
      const chains = response.data.slice(0, 10);
      
      return `CHAIN TVL RANKINGS:\n` +
        chains.map((chain: any, index: number) => 
          `${index + 1}. ${chain.name}: $${(chain.tvl / 1e9).toFixed(2)}B TVL ` +
          `| 1d: ${chain.change_1d ? (chain.change_1d > 0 ? '+' : '') + chain.change_1d.toFixed(2) + '%' : 'N/A'}`
        ).join('\n');
    } catch (error) {
      console.error('Chain TVL data error:', error);
      return null;
    }
  }

  private static async fetchYieldData(): Promise<string | null> {
    try {
      const response = await axios.get(`${this.DEFILLAMA_API}/yields`);
      const pools = response.data.data?.slice(0, 10) || [];
      
      if (pools.length === 0) return null;

      return `TOP YIELD OPPORTUNITIES:\n` +
        pools.map((pool: any) => 
          `${pool.project || 'Unknown'} - ${pool.symbol || 'N/A'}: ${pool.apy?.toFixed(2) || 'N/A'}% APY ` +
          `| Chain: ${pool.chain || 'N/A'} ` +
          `| TVL: $${pool.tvlUsd ? (pool.tvlUsd / 1e6).toFixed(1) + 'M' : 'N/A'}`
        ).join('\n');
    } catch (error) {
      console.error('Yield data error:', error);
      return null;
    }
  }

  private static async fetchProtocolDetailsData(query: string): Promise<string | null> {
    try {
      const protocolName = this.extractProtocolName(query);
      if (!protocolName) return null;

      const response = await axios.get(`${this.DEFILLAMA_API}/protocol/${protocolName}`);
      const protocol = response.data;
      
      return `PROTOCOL DETAILS - ${protocol.name}:\n` +
        `Current TVL: $${(protocol.currentChainTvls?.Total || protocol.tvl || 0 / 1e9).toFixed(2)}B\n` +
        `Description: ${protocol.description || 'No description available'}\n` +
        `Category: ${protocol.category || 'N/A'}\n` +
        `Chains: ${protocol.chains?.join(', ') || 'N/A'}\n` +
        `Website: ${protocol.url || 'N/A'}\n` +
        `Twitter: ${protocol.twitter || 'N/A'}\n` +
        `Audit: ${protocol.audits || 'No audit info'}`;
    } catch (error) {
      console.error('Protocol details error:', error);
      return null;
    }
  }

  private static async fetchStablecoinData(): Promise<string | null> {
    try {
      const response = await axios.get(`${this.DEFILLAMA_API}/stablecoins`);
      const stablecoins = response.data.peggedAssets?.slice(0, 10) || [];
      
      if (stablecoins.length === 0) return null;

      return `TOP STABLECOINS BY MARKET CAP:\n` +
        stablecoins.map((stable: any, index: number) => 
          `${index + 1}. ${stable.name} (${stable.symbol}): $${(stable.circulating / 1e9).toFixed(2)}B ` +
          `| Price: $${stable.price?.toFixed(4) || '1.0000'} ` +
          `| Peg: ${stable.pegType || 'USD'}`
        ).join('\n');
    } catch (error) {
      console.error('Stablecoin data error:', error);
      return null;
    }
  }

  private static async fetchChainSpecificData(query: string): Promise<string | null> {
    try {
      const chainName = this.extractChainName(query);
      if (!chainName) return null;

      const response = await axios.get(`${this.DEFILLAMA_API}/protocols`);
      const chainProtocols = response.data.filter((p: DeFiLlamaProtocol) => 
        p.chain?.toLowerCase() === chainName.toLowerCase() || 
        p.chains?.some(chain => chain.toLowerCase() === chainName.toLowerCase())
      ).slice(0, 10);

      if (chainProtocols.length === 0) return null;

      return `${chainName.toUpperCase()} ECOSYSTEM PROTOCOLS:\n` +
        chainProtocols.map((protocol: DeFiLlamaProtocol) => 
          `${protocol.name}: $${(protocol.tvl / 1e9).toFixed(2)}B TVL ` +
          `| Category: ${protocol.category || 'N/A'}`
        ).join('\n');
    } catch (error) {
      console.error('Chain specific data error:', error);
      return null;
    }
  }

  // === HELPER METHODS ===

  private static extractCoinId(query: string): string | null {
    const coinMap: { [key: string]: string } = {
      'bitcoin': 'bitcoin', 'btc': 'bitcoin',
      'ethereum': 'ethereum', 'eth': 'ethereum',
      'solana': 'solana', 'sol': 'solana',
      'cardano': 'cardano', 'ada': 'cardano',
      'binance': 'binancecoin', 'bnb': 'binancecoin',
      'xrp': 'ripple', 'ripple': 'ripple',
      'dogecoin': 'dogecoin', 'doge': 'dogecoin',
      'polygon': 'matic-network', 'matic': 'matic-network',
      'avalanche': 'avalanche-2', 'avax': 'avalanche-2',
      'polkadot': 'polkadot', 'dot': 'polkadot',
      'chainlink': 'chainlink', 'link': 'chainlink',
      'uniswap': 'uniswap', 'uni': 'uniswap',
      'near': 'near', 'near protocol': 'near'
    };

    const queryLower = query.toLowerCase();
    for (const [key, value] of Object.entries(coinMap)) {
      if (queryLower.includes(key)) {
        return value;
      }
    }
    return null;
  }

  private static extractProtocolName(query: string): string | null {
    const protocolMap: { [key: string]: string } = {
      'uniswap': 'uniswap',
      'aave': 'aave',
      'compound': 'compound',
      'makerdao': 'makerdao',
      'curve': 'curve',
      'convex': 'convex-finance',
      'yearn': 'yearn-finance',
      'synthetix': 'synthetix',
      'pancakeswap': 'pancakeswap',
      'sushiswap': 'sushiswap'
    };

    const queryLower = query.toLowerCase();
    for (const [key, value] of Object.entries(protocolMap)) {
      if (queryLower.includes(key)) {
        return value;
      }
    }
    return null;
  }

  private static extractChainName(query: string): string | null {
    const chainMap: { [key: string]: string } = {
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BSC',
      'binance smart chain': 'BSC',
      'avalanche': 'Avalanche',
      'solana': 'Solana',
      'fantom': 'Fantom',
      'arbitrum': 'Arbitrum',
      'optimism': 'Optimism'
    };

    const queryLower = query.toLowerCase();
    for (const [key, value] of Object.entries(chainMap)) {
      if (queryLower.includes(key)) {
        return value;
      }
    }
    return null;
  }

  private static async generateClaudeResponse(query: string, contextData: string): Promise<string> {
    try {
      const response = await fetch('https://djozrzgevluayzcvenby.supabase.co/functions/v1/claude-chat', {
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
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.response;
    } catch (error) {
      console.error('Claude response error:', error);
      
      // Fallback response
      if (contextData) {
        return `Based on the latest data:\n\n${contextData}\n\nRegarding your question "${query}":\n\nThis is a comprehensive analysis based on real-time Web3 data. The market shows current trends and the DeFi ecosystem continues to evolve with new protocols and innovations. For more specific analysis, please provide additional details about what aspects you'd like me to focus on.`;
      }

      return `I understand you're asking about "${query}". While I don't have specific real-time data for this query right now, I can provide general insights about Web3 and blockchain topics. For more accurate and current information, please try asking about specific tokens, protocols, or include keywords like "price", "DeFi", or "market data".`;
    }
  }
}