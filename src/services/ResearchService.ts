import axios from 'axios';
import { MoralisService } from './MoralisService';

export interface ResearchResponse {
  contextData: string;
  sources: string[];
}

interface CoinGeckoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number;
  max_supply: number;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi?: any;
  last_updated: string;
}

interface DeFiLlamaProtocol {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string;
  gecko_id: string;
  cmcId: string;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  audit_links: string[];
  listedAt: number;
  methodology: string;
  slug: string;
  tvl: number;
  chainTvls: { [chain: string]: number };
  change_1h: number;
  change_1d: number;
  change_7d: number;
  tokenBreakdowns: any;
  mcap: number;
}

interface CoinGeckoGlobalData {
  active_cryptocurrencies: number;
  upcoming_icos: number;
  ongoing_icos: number;
  ended_icos: number;
  markets: number;
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

      // Collect all data promises for concurrent execution
      const dataPromises: Promise<string | null>[] = [];
      
      // Handle wallet queries first (highest priority)
      if (this.isWalletQuery(queryLower)) {
        const walletResult = await this.processWalletQuery(query);
        return {
          contextData: walletResult,
          sources: ['Moralis API', 'CoinGecko API']
        };
      }

      // Route to appropriate data sources based on query type
      if (this.isPriceQuery(queryLower)) {
        // CRYPTO PRICES → CoinGecko only
        dataPromises.push(this.fetchDetailedCoinData(query));
        dataPromises.push(this.fetchPriceHistoryData(query));
        sources.push('CoinGecko API');
      } else if (this.isDeFiQuery(queryLower)) {
        // PROTOCOLS/PROJECTS → DeFi Llama only
        console.log('Detected DeFi query:', queryLower);
        if (queryLower.includes('stablecoin') || queryLower.includes('stable coin')) {
          console.log('Detected stablecoin query, fetching stablecoin data');
          dataPromises.push(this.fetchStablecoinData());
        } else {
          console.log('Detected general DeFi query');
          dataPromises.push(this.fetchDeFiProtocolData(query));
          dataPromises.push(this.fetchProtocolDetailsData(query));
        }
        sources.push('DeFiLlama API');
      } else if (this.isChainQuery(queryLower)) {
        // CHAIN DATA → DeFi Llama for TVL, CoinGecko for prices
        dataPromises.push(this.fetchChainTVLData());
        dataPromises.push(this.fetchChainSpecificData(query));
        sources.push('DeFiLlama API');
      } else {
        // GENERAL QUERIES → Basic overview from CoinGecko
        dataPromises.push(this.fetchCoinGeckoMarketData(query));
        sources.push('CoinGecko API');
      }

      // Execute all data fetches concurrently
      const results = await Promise.allSettled(dataPromises);
      
      // Process results and collect successful data
      const dataResults: string[] = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          dataResults.push(result.value);
        }
      });

      // Combine all successful results
      contextData = dataResults.join('\n\n');

      // Add fallback data if no results
      if (!contextData) {
        contextData = 'No specific market data available for this query. Please try a more specific request about cryptocurrencies, DeFi protocols, or blockchain data.';
        sources.push('System Message');
      }

      return {
        contextData,
        sources: Array.from(new Set(sources))
      };
    } catch (error) {
      console.error('Research Service error:', error);
      return {
        contextData: 'An error occurred while fetching market data. Please try again.',
        sources: ['Error']
      };
    }
  }

  // === WALLET QUERY PROCESSING ===

  private static async processWalletQuery(query: string): Promise<string> {
    try {
      const walletAddress = MoralisService.extractWalletAddress(query);
      if (!walletAddress) {
        return 'No valid wallet address found in the query. Please provide a valid Ethereum (0x...) or Solana address.';
      }

      const chain = MoralisService.detectChainFromAddress(walletAddress);
      
      console.log('Using chain:', chain, 'for address:', walletAddress);

      // Fetch wallet data with enhanced pricing
      const [balances, history] = await Promise.allSettled([
        MoralisService.getWalletTokenBalancesWithPricing(walletAddress, chain),
        MoralisService.getWalletHistory(walletAddress, chain, 5)
      ]);

      let result = `WALLET ANALYSIS: ${walletAddress}
Blockchain: ${chain.toUpperCase()}

`;

      // Add token balances (which includes native balance for Solana)
      if (balances.status === 'fulfilled') {
        const balanceData = MoralisService.formatWalletBalanceData(balances.value, chain);
        if (balanceData) {
          result += balanceData + '\n\n';
        }
      } else {
        result += 'Error fetching wallet balances\n\n';
      }

      // Add transaction history for EVM chains
      if (history.status === 'fulfilled' && chain !== 'solana') {
        const historyData = MoralisService.formatWalletHistoryData(history.value);
        if (historyData) {
          result += historyData + '\n\n';
        }
      }

      return result;
    } catch (error) {
      console.error('Wallet query error:', error);
      return 'Error processing wallet query. Please check the wallet address and try again.';
    }
  }

  // === QUERY TYPE DETECTION ===

  private static isPriceQuery(query: string): boolean {
    const priceKeywords = [
      'price', 'cost', 'value', 'worth', 'usd', 'dollar', 'how much',
      'current price', 'market price', 'trading at', 'priced at', 'chart',
      'bitcoin', 'btc', 'ethereum', 'eth', 'ada', 'sol', 'avax', 'matic',
      'token price', 'coin price', 'crypto price', 'market cap'
    ];
    return priceKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private static isDeFiQuery(query: string): boolean {
    const defiKeywords = [
      'defi', 'tvl', 'yield', 'liquidity', 'protocol', 'apy', 'apr',
      'lending', 'borrowing', 'staking', 'farming', 'pool', 'vault',
      'uniswap', 'aave', 'compound', 'makerdao', 'curve', 'sushiswap',
      'pancakeswap', 'balancer', 'yearn', 'synthetix', 'dydx', 'gmx',
      'project', 'dapp', 'platform', 'exchange', 'dao',
      'stablecoin', 'stablecoins', 'usdt', 'usdc', 'dai', 'busd', 'frax',
      'tether', 'circle', 'stable coin', 'stable coins', 'pegged'
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

  private static isWalletQuery(query: string): boolean {
    const walletKeywords = [
      'wallet', 'address', 'balance', 'transaction', 'tx', 'transfer', 'send', 'receive',
      'portfolio', 'holdings', 'assets', '0x', 'eth balance', 'token balance', 'history',
      'solana wallet', 'sol balance', 'spl token'
    ];
    return walletKeywords.some(keyword => query.toLowerCase().includes(keyword)) ||
           MoralisService.extractWalletAddress(query) !== null;
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
        },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Web3ResearchAgent/1.0'
        },
        timeout: 10000
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
      const response = await axios.get(`${this.COINGECKO_API}/global`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Web3ResearchAgent/1.0'
        },
        timeout: 10000
      });
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
        axios.get(`${this.COINGECKO_API}/search/trending`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Web3ResearchAgent/1.0'
          },
          timeout: 10000
        }),
        axios.get(`${this.COINGECKO_API}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            order: 'price_change_percentage_24h_desc',
            per_page: 5,
            page: 1
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Web3ResearchAgent/1.0'
          },
          timeout: 10000
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
      // First try to search for the coin to get its correct ID
      const coinQuery = this.extractCoinFromQuery(query);
      if (!coinQuery) return null;

      // Search for the coin first
      const searchResponse = await axios.get(`${this.COINGECKO_API}/search`, {
        params: { query: coinQuery },
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Web3ResearchAgent/1.0'
        },
        timeout: 10000
      });

      let coinId = null;
      if (searchResponse.data.coins && searchResponse.data.coins.length > 0) {
        coinId = searchResponse.data.coins[0].id;
      } else {
        // Fallback: try using the query directly as coin ID
        coinId = coinQuery.toLowerCase().replace(/\s+/g, '-');
      }

      const response = await axios.get(`${this.COINGECKO_API}/coins/${coinId}`, {
        params: {
          localization: false,
          tickers: false,
          market_data: true,
          community_data: false,
          developer_data: false
        }
      });

      const coin = response.data;
      const marketData = coin.market_data;

      return `${coin.name.toUpperCase()} (${coin.symbol.toUpperCase()}) PRICE DATA:

Current Price: $${marketData.current_price?.usd?.toLocaleString() || 'N/A'}
24h Change: ${marketData.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
Market Cap Rank: ${coin.market_cap_rank || 'N/A'}
Market Capitalization: $${marketData.market_cap?.usd ? (marketData.market_cap.usd / 1e6).toFixed(2) + ' Million' : 'N/A'}
24h Trading Volume: $${marketData.total_volume?.usd ? (marketData.total_volume.usd / 1e6).toFixed(2) + ' Million' : 'N/A'}
7d Change: ${marketData.price_change_percentage_7d?.toFixed(2) || 'N/A'}%
30d Change: ${marketData.price_change_percentage_30d?.toFixed(2) || 'N/A'}%
All Time High: $${marketData.ath?.usd?.toLocaleString() || 'N/A'}
Circulating Supply: ${marketData.circulating_supply ? marketData.circulating_supply.toLocaleString() : 'N/A'} ${coin.symbol.toUpperCase()}`;
    } catch (error) {
      console.error('Detailed coin data error:', error);
      // Fallback: try markets endpoint for broader search
      return await this.fetchCoinFromMarkets(query);
    }
  }

  private static async fetchCoinFromMarkets(query: string): Promise<string | null> {
    try {
      const coinQuery = this.extractCoinFromQuery(query);
      if (!coinQuery) return null;

      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 250,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h,7d,30d'
        }
      });

      const coin = response.data.find((c: any) => 
        c.symbol.toLowerCase() === coinQuery.toLowerCase() ||
        c.name.toLowerCase().includes(coinQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(coinQuery.toLowerCase())
      );

      if (!coin) return null;

      return `${coin.name.toUpperCase()} (${coin.symbol.toUpperCase()}) PRICE DATA:

Current Price: $${coin.current_price?.toLocaleString() || 'N/A'}
24h Change: ${coin.price_change_percentage_24h?.toFixed(2) || 'N/A'}%
Market Cap Rank: ${coin.market_cap_rank || 'N/A'}
Market Capitalization: $${coin.market_cap ? (coin.market_cap / 1e6).toFixed(2) + ' Million' : 'N/A'}
24h Trading Volume: $${coin.total_volume ? (coin.total_volume / 1e6).toFixed(2) + ' Million' : 'N/A'}`;
    } catch (error) {
      console.error('Coin from markets error:', error);
      return null;
    }
  }

  private static extractCoinFromQuery(query: string): string | null {
    // Remove common price-related words and extract the coin name/symbol
    const cleanQuery = query.toLowerCase()
      .replace(/\b(price|for|of|token|coin|crypto|cryptocurrency|what|is|the|how|much)\b/g, '')
      .trim();
    
    // Return the cleaned query if it's not empty and reasonable length
    return cleanQuery && cleanQuery.length >= 2 ? cleanQuery : null;
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
          `| Chain: ${protocol.chain || (protocol.chains?.join(', ') || 'Multi-Chain')}`
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
      const response = await axios.get(`${this.DEFILLAMA_API}/pools`);
      const pools = response.data?.data?.slice(0, 10) || response.data?.slice(0, 10) || [];
      
      if (pools.length === 0) return null;

      return `TOP YIELD OPPORTUNITIES:\n` +
        pools.map((pool: any) => 
          `${pool.project || 'Unknown'} - ${pool.symbol || 'N/A'}: ${(pool.apy || pool.apyBase || 0)?.toFixed(2) || 'N/A'}% APY ` +
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
      console.log('Fetching stablecoin data from DeFi Llama...');
      // Use the correct DeFi Llama API endpoint for stablecoins
      const response = await axios.get(`https://stablecoins.llama.fi/stablecoins`);
      console.log('Stablecoin API response:', response.data);
      
      // The response should have peggedAssets array
      const stablecoins = response.data.peggedAssets || [];
      const topStablecoins = Array.isArray(stablecoins) ? stablecoins.slice(0, 10) : [];
      
      if (topStablecoins.length === 0) {
        console.log('No stablecoin data found');
        // Fallback: fetch top stablecoins from CoinGecko if DeFi Llama fails
        return await this.fetchStablecoinDataFromCoinGecko();
      }

      console.log('Found stablecoins:', topStablecoins.length);
      return `TOP STABLECOINS BY MARKET CAP:\n` +
        topStablecoins.map((stable: any, index: number) => 
          `${index + 1}. ${stable.name || stable.symbol} (${stable.symbol || 'N/A'}): ` +
          `$${stable.circulating ? (stable.circulating / 1e9).toFixed(2) + 'B' : 'N/A'} ` +
          `| Price: $${stable.price?.toFixed(4) || '~1.0000'} ` +
          `| Peg: ${stable.pegType || stable.peggingMechanism || 'USD'}`
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
      const stablecoinIds = ['tether', 'usd-coin', 'binance-usd', 'dai', 'frax', 'trueusd', 'paxos-standard', 'gemini-dollar'];
      const response = await axios.get(`${this.COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          ids: stablecoinIds.join(','),
          order: 'market_cap_desc',
          per_page: 10,
          page: 1
        }
      });

      if (!response.data || response.data.length === 0) return null;

      return `TOP STABLECOINS BY MARKET CAP:\n` +
        response.data.map((coin: any, index: number) => 
          `${index + 1}. ${coin.name} (${coin.symbol.toUpperCase()}): ` +
          `$${(coin.market_cap / 1e9).toFixed(2)}B | ` +
          `Price: $${coin.current_price?.toFixed(4) || '1.0000'} | ` +
          `24h: ${coin.price_change_percentage_24h?.toFixed(2) || '0.00'}%`
        ).join('\n');
    } catch (error) {
      console.error('CoinGecko stablecoin fallback error:', error);
      return null;
    }
  }

  private static async fetchChainSpecificData(query: string): Promise<string | null> {
    try {
      const chain = this.extractChainFromQuery(query);
      if (!chain) return null;

      // Map API chain names to display names
      const chainDisplayMap: { [key: string]: string } = {
        'eth': 'Ethereum',
        'polygon': 'Polygon',
        'bsc': 'BSC',
        'avalanche': 'Avalanche',
        'fantom': 'Fantom',
        'arbitrum': 'Arbitrum',
        'optimism': 'Optimism'
      };

      const chainName = chainDisplayMap[chain] || chain;

      const response = await axios.get(`${this.DEFILLAMA_API}/protocols`);
      const chainProtocols = response.data.filter((p: DeFiLlamaProtocol) => 
        p.chain?.toLowerCase() === chainName.toLowerCase() || 
        p.chains?.some(chainItem => chainItem.toLowerCase() === chainName.toLowerCase())
      ).slice(0, 10);

      if (chainProtocols.length === 0) return null;

      return `TOP ${chainName.toUpperCase()} PROTOCOLS:\n` +
        chainProtocols.map((protocol: DeFiLlamaProtocol, index: number) => 
          `${index + 1}. ${protocol.name}: $${(protocol.tvl / 1e9).toFixed(2)}B TVL ` +
          `| Category: ${protocol.category} ` +
          `| 1d: ${protocol.change_1d?.toFixed(2) || 'N/A'}%`
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
      'chainlink': 'chainlink', 'link': 'chainlink',
      'polkadot': 'polkadot', 'dot': 'polkadot',
      'uniswap': 'uniswap', 'uni': 'uniswap',
      'litecoin': 'litecoin', 'ltc': 'litecoin',
      'manta': 'manta-network', 'manta network': 'manta-network',
      'eigenlayer': 'eigenlayer', 'eigen': 'eigenlayer',
      'jupiter': 'jupiter-exchange-solana', 'jup': 'jupiter-exchange-solana',
      'tether': 'tether', 'usdt': 'tether',
      'usdc': 'usd-coin', 'usd coin': 'usd-coin'
    };

    const queryLower = query.toLowerCase();
    
    // First check direct matches
    for (const [key, coinId] of Object.entries(coinMap)) {
      if (queryLower.includes(key)) {
        return coinId;
      }
    }

    // Extract potential coin name/symbol from query
    const matches = queryLower.match(/\b[a-zA-Z]{2,20}\b/g);
    if (matches) {
      for (const match of matches) {
        if (coinMap[match]) {
          return coinMap[match];
        }
      }
      // Return the first reasonable match if no direct mapping found
      return matches.find(m => m.length >= 3 && !['price', 'for', 'of', 'the', 'what', 'how', 'much'].includes(m)) || null;
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
      'sushiswap': 'sushi',
      'pancakeswap': 'pancakeswap',
      'balancer': 'balancer'
    };

    const queryLower = query.toLowerCase();
    
    for (const [key, protocolId] of Object.entries(protocolMap)) {
      if (queryLower.includes(key)) {
        return protocolId;
      }
    }

    return null;
  }

  private static extractChainFromQuery(query: string): string | null {
    const chainMap: { [key: string]: string } = {
      'ethereum': 'eth',
      'polygon': 'polygon',
      'bsc': 'bsc',
      'binance smart chain': 'bsc',
      'avalanche': 'avalanche',
      'fantom': 'fantom',
      'arbitrum': 'arbitrum',
      'optimism': 'optimism'
    };

    const queryLower = query.toLowerCase();
    
    for (const [key, chainId] of Object.entries(chainMap)) {
      if (queryLower.includes(key)) {
        return chainId;
      }
    }

    return null;
  }
}