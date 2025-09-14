import { supabase } from '@/integrations/supabase/client';
import { STABLECOIN_REFERENCE_DATA, getStablecoinBySymbol } from '@/data/stablecoinReference';

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
  comparisonData?: {
    coins: Array<{
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
    }>;
  };
  adoptionData?: {
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
  };
}

export class ResearchService {
  static async processQuery(query: string): Promise<ResearchResponse> {
    try {
      // Check if this is a pure news query - skip Claude if so
      const isPureNews = this.isPureNewsQuery(query);
      
      if (isPureNews) {
        console.log('Pure news query detected, skipping Claude API');
        const newsResults = await this.getNewsData(query);
        
        return {
          contextData: '', // Empty since we're not using Claude
          sources: [],
          newsResults
        };
      }
      
      // Check if this is an adoption tracker query
      const isAdoptionTracker = this.isAdoptionTrackerQuery(query);
      
      if (isAdoptionTracker) {
        console.log('Adoption tracker query detected');
        const stablecoinSymbols = this.extractStablecoinSymbols(query);
        
        if (stablecoinSymbols.length > 0) {
          const adoptionData = await this.getAdoptionData(stablecoinSymbols[0]);
          
          return {
            contextData: `Adoption metrics for ${stablecoinSymbols[0]}`,
            sources: [],
            adoptionData
          };
        }
      }
      
      // Check if this is an explain stablecoin query
      const isExplainQuery = query.toLowerCase().includes('explain') && 
                           (query.toLowerCase().includes('stablecoin') || 
                            this.extractStablecoinSymbols(query).length > 0);
      const stablecoinSymbols = this.extractStablecoinSymbols(query);
      
      if (isExplainQuery && stablecoinSymbols.length > 0) {
        console.log('Explain stablecoin query detected for:', stablecoinSymbols[0]);
        const contextData = await this.generateResponse(query, '');
        const chartData = await this.getChartData(stablecoinSymbols[0]);
        
        return {
          contextData,
          sources: [],
          chartData
        };
      }
      
      // Check if this is a comparison query
      const isComparison = this.isComparisonQuery(query);
      
      if (isComparison && stablecoinSymbols.length >= 2) {
        console.log('Comparison query detected for:', stablecoinSymbols);
        const comparisonData = this.generateComparisonData(stablecoinSymbols.slice(0, 2));
        
        return {
          contextData: `Comparison between ${stablecoinSymbols[0]} and ${stablecoinSymbols[1]}`,
          sources: [],
          comparisonData
        };
      }
      
      // For other queries, proceed with normal flow
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


  private static isComparisonQuery(query: string): boolean {
    const comparisonKeywords = ['compare', 'vs', 'versus', 'difference between', 'comparison'];
    return comparisonKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private static isAdoptionTrackerQuery(query: string): boolean {
    const adoptionKeywords = ['adoption tracker', 'adoption metrics', 'adoption data'];
    return adoptionKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  private static isPureNewsQuery(query: string): boolean {
    const pureNewsPatterns = [
      /^latest news/i,
      /^recent news/i,
      /^news about/i,
      /^stablecoin news/i,
      /^breaking news/i,
      /^headlines/i,
      /^updates/i
    ];
    
    return pureNewsPatterns.some(pattern => pattern.test(query.trim()));
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
      // Create varied search queries to get different results
      const searchVariations = [
        query,
        query.toLowerCase().includes('stablecoin') ? query : `${query} stablecoins`,
        query.toLowerCase().includes('stablecoin') ? query : `${query} USDT USDC`,
        `latest ${query}`,
        `breaking ${query}`,
        `${query} news today`
      ];
      
      // Pick a random variation to get different results each time
      const searchQuery = searchVariations[Math.floor(Math.random() * searchVariations.length)];
      
      // Vary time filters to get fresh content
      const timeFilters = ['recent', 'week', 'month', 'mixed'];
      const randomTimeFilter = timeFilters[Math.floor(Math.random() * timeFilters.length)];

      const { data, error } = await supabase.functions.invoke('serp-search', {
        body: {
          query: searchQuery,
          location: 'United States',
          num: 8, // Get more results for variety
          timeFilter: randomTimeFilter
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
      // Major stablecoins
      'usdt': 'USDT',
      'tether': 'USDT',
      'usdc': 'USDC', 
      'usd coin': 'USDC',
      'dai': 'DAI',
      'makerdao': 'DAI',
      'usde': 'USDE',
      'ethena': 'USDE',
      'ethena usde': 'USDE',
      'usds': 'USDS',
      'sky protocol': 'USDS',
      'usd1': 'USD1',
      'world liberty financial': 'USD1',
      'usdtb': 'USDTB',
      'pyusd': 'PYUSD',
      'paypal usd': 'PYUSD',
      'fdusd': 'FDUSD',
      'first digital usd': 'FDUSD',
      'rlusd': 'RLUSD',
      'ripple usd': 'RLUSD',
      'usdy': 'USDY',
      'ondo us dollar yield': 'USDY',
      'usdf': 'USDF',
      'falcon usd': 'USDF',
      'usdo': 'USDO',
      'openeden opendollar': 'USDO',
      'satusd': 'SATUSD',
      'satoshi stablecoin': 'SATUSD',
      'deusd': 'DEUSD',
      'elixir deusd': 'DEUSD',
      'yu': 'YU',
      'yala stablecoin': 'YU',
      'srusd': 'SRUSD',
      'reservoir srusd': 'SRUSD',
      'rusd': 'RUSD',
      'reservoir rusd': 'RUSD',
      'usdp': 'USDP',
      'pax dollar': 'USDP',
      'usda': 'USDA',
      'frxusd': 'FRXUSD',
      'frax usd': 'FRXUSD',
      'mim': 'MIM',
      'magic internet money': 'MIM',
      'usdn': 'USDN',
      'noble dollar': 'USDN',
      'usdl': 'USDL',
      'lift dollar': 'USDL',
      'byusd': 'BYUSD',
      'lusd': 'LUSD',
      'liquity usd': 'LUSD',
      'yusd': 'YUSD',
      'aegis yusd': 'YUSD',
      'mimatic': 'MIMATIC',
      'mai': 'MIMATIC',
      
      // Euro stablecoins
      'eurs': 'EURS',
      'stasis euro': 'EURS',
      'eurc': 'EURC',
      'euro coin': 'EURC',
      'ceur': 'CEUR',
      'celo euro': 'CEUR',
      
      // Algorithmic stablecoins
      'susd': 'SUSD',
      'synthetix usd': 'SUSD',
      'synth usd': 'SUSD',
      'usdd': 'USDD',
      'tron usdd': 'USDD',
      'ampl': 'AMPL',
      'ampleforth': 'AMPL',
      'cusd': 'CUSD',
      'celo dollar': 'CUSD',
      'fei': 'FEI',
      'fei usd': 'FEI',
      'ustc': 'USTC',
      'terraclassicusd': 'USTC',
      'terra classic usd': 'USTC',
      'blc': 'BLC',
      'balance coin': 'BLC',
      'par': 'PAR',
      'parallel': 'PAR',
      'usnbt': 'USNBT',
      'nubits': 'USNBT',
      'dusd': 'DUSD',
      'defidollar': 'DUSD',
      'usn': 'USN',
      'near usn': 'USN',
      
      // Other fiat-backed
      'xsgd': 'XSGD',
      'singapore dollar': 'XSGD',
      'gyen': 'GYEN',
      'japanese yen': 'GYEN',
      'idrt': 'IDRT',
      'rupiah token': 'IDRT',
      'zarp': 'ZARP',
      'zar token': 'ZARP',
      'vchf': 'VCHF',
      'vnx swiss franc': 'VCHF',
      
      // Gold/commodity backed
      'xaut': 'XAUT',
      'tether gold': 'XAUT',
      'paxg': 'PAXG',
      'pax gold': 'PAXG',
      'kau': 'KAU',
      'kinesis gold': 'KAU',
      'kag': 'KAG',
      'kinesis silver': 'KAG',
      
      // Legacy/Other protocols  
      'tusd': 'TUSD',
      'trueusd': 'TUSD',
      'busd': 'BUSD',
      'binance usd': 'BUSD',
      'frax': 'FRAX',
      'frax dollar': 'FRAX',
      'gho': 'GHO',
      'aave gho': 'GHO',
      'crvusd': 'CRVUSD',
      'curve usd': 'CRVUSD',
      'ousd': 'OUSD',
      'origin dollar': 'OUSD',
      'usdx': 'USDX',
      'usd0': 'USD0',
      'usual usd': 'USD0',
      'usdg': 'USDG',
      'global dollar': 'USDG',
      'usdb': 'USDB',
      'usr': 'USR',
      'resolv usr': 'USR',
      'rai': 'RAI',
      'rai reflex index': 'RAI',
      'dola': 'DOLA',
      'inverse finance': 'DOLA'
    };

    const symbols: string[] = [];
    const lowerQuery = query.toLowerCase();
    
    // Sort keys by length (descending) to match longer phrases first
    const sortedKeys = Object.keys(stablecoinMap).sort((a, b) => b.length - a.length);
    
    sortedKeys.forEach(key => {
      if (lowerQuery.includes(key) && !symbols.includes(stablecoinMap[key])) {
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
      // Check if this is an "explain stablecoin" query
      const isExplainQuery = query.toLowerCase().includes('explain') && 
                           (query.toLowerCase().includes('stablecoin') || 
                            this.extractStablecoinSymbols(query).length > 0);

      let formattedQuery = query;
      let prompt = '';

      if (isExplainQuery) {
        // Extract the stablecoin name from the query
        const stablecoinSymbols = this.extractStablecoinSymbols(query);
        const stablecoinName = stablecoinSymbols.length > 0 ? stablecoinSymbols[0] : query.replace(/explain|stablecoin/gi, '').trim();
        
        // Get reference data for the stablecoin
        const referenceData = getStablecoinBySymbol(stablecoinName);
        let referenceInfo = '';
        
        if (referenceData) {
          referenceInfo = `
Reference Data for ${referenceData.name} (${referenceData.symbol}):
- Category: ${referenceData.category}
- Backing: ${referenceData.backing}
- Market Cap: $${(referenceData.marketCap / 1e9).toFixed(2)}B
- Issuer: ${referenceData.issuer || 'N/A'}
- Chains: ${referenceData.chains.join(', ')}
- Use Cases: ${referenceData.useCase}
- Risk Level: ${referenceData.riskLevel}
- Description: ${referenceData.description}`;
        }
        
        // Skip transparency report URLs as requested

        // Create a specific prompt for explain queries that only returns the 4 sections
        prompt = `Please provide information about the ${stablecoinName} stablecoin in exactly these 4 sections only:

**Overview**
**Backing Mechanism**
**Usecases** 
**Risks/Criticism**

IMPORTANT FORMATTING RULES:
1. Each section title must be in bold using **title** format
2. Add two blank lines between each section
3. If any section contains multiple points, format them as bullet points using "- " (dash and space)
4. Each bullet point should be on a separate line
5. Content under each section should be in regular text (not bold)
6. Do not include any other information outside these 4 sections

Example format:
**Overview**
Content here...

**Backing Mechanism**
- Point 1
- Point 2
- Point 3

${referenceInfo}

${marketData ? `Current Market Data:\n${marketData}` : ''}`;
      } else {
        // Improve the query format for single words
        if (query.trim().split(' ').length === 1) {
          // If it's a single word (like "USDT"), make it a proper question
          formattedQuery = `What is ${query}? Please provide comprehensive information.`;
        }

        // Prepare the prompt for Claude
        prompt = `Query: ${formattedQuery}

${marketData ? `Current Market Data:\n${marketData}` : ''}`;
      }

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
      // First try to fetch real historical data from CoinGecko
      const realData = await this.fetchRealChartData(symbol);
      if (realData && realData.length > 0) {
        return {
          symbol,
          data: realData
        };
      }
      
      // Fallback to mock data if API fails
      console.log(`Falling back to mock data for ${symbol}`);
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

  private static async fetchRealChartData(symbol: string): Promise<Array<{
    date: string;
    price: number;
    volume?: number;
  }> | null> {
    try {
      // Map stablecoin symbols to CoinGecko IDs
      const coinGeckoIds: { [key: string]: string } = {
        'USDT': 'tether',
        'USDC': 'usd-coin',
        'BUSD': 'binance-usd',
        'DAI': 'dai',
        'FRAX': 'frax',
        'TUSD': 'true-usd',
        'USDP': 'paxos-standard',
        'GUSD': 'gemini-dollar',
        'LUSD': 'liquity-usd',
        'SUSD': 'nusd',
        'USDD': 'usdd',
        'FDUSD': 'first-digital-usd',
        'PYUSD': 'paypal-usd',
        'USDE': 'ethena-usde',
        'USDS': 'sky-dollar-usds',
        'EURS': 'stasis-eurs',
        'EURC': 'euro-coin',
        'MIM': 'magic-internet-money',
        'USTC': 'terrausd',
        'PAXG': 'pax-gold',
        'XAUT': 'tether-gold'
      };

      const coinGeckoId = coinGeckoIds[symbol.toUpperCase()];
      if (!coinGeckoId) {
        console.log(`No CoinGecko ID found for ${symbol}, using mock data`);
        return null;
      }

      // Fetch 30 days of daily price data
      const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
      const now = Math.floor(Date.now() / 1000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinGeckoId}/market_chart/range?vs_currency=usd&from=${thirtyDaysAgo}&to=${now}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'StablecoinTracker/1.0'
          }
        }
      );

      if (!response.ok) {
        console.log(`CoinGecko API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      const prices = data.prices || [];
      const volumes = data.total_volumes || [];

      if (!prices.length) {
        console.log(`No price data available for ${symbol}`);
        return null;
      }

      // Convert CoinGecko data to our format, sampling every few hours to avoid too many data points
      const chartData = [];
      const sampleEvery = Math.max(1, Math.floor(prices.length / 30)); // Sample to get around 30 data points
      
      for (let i = 0; i < prices.length; i += sampleEvery) {
        const [timestamp, price] = prices[i];
        const volume = volumes[i] ? volumes[i][1] : undefined;
        
        chartData.push({
          date: new Date(timestamp).toISOString().split('T')[0],
          price: Number(Number(price).toFixed(6)),
          volume: volume ? Math.floor(volume) : undefined
        });
      }

      console.log(`Fetched ${chartData.length} real data points for ${symbol}`);
      return chartData;

    } catch (error) {
      console.error(`Error fetching real chart data for ${symbol}:`, error);
      return null;
    }
  }

  private static generateMockChartData(symbol: string): Array<{
    date: string;
    price: number;
    volume?: number;
  }> {
    const data = [];
    let basePrice = 1.0000; // Default for USD stablecoins
    
    // Set appropriate base prices for different types of stablecoins/tokens
    switch (symbol.toUpperCase()) {
      // Gold-backed tokens
      case 'PAXG':
      case 'XAUT': 
        basePrice = 2650.00; // Approximate gold price per ounce
        break;
      case 'KAU': // Kinesis Gold (per gram)
        basePrice = 85.00; // Approximate gold price per gram
        break;
      case 'KAG': // Kinesis Silver (per ounce)
        basePrice = 30.00; // Approximate silver price per ounce
        break;
        
      // Algorithmic stablecoins with different risk profiles
      case 'AMPL': // Ampleforth (elastic supply)
        basePrice = 1.25; // Can fluctuate significantly
        break;
      case 'SUSD': // Synthetix sUSD (can depeg)
        basePrice = 0.975; // Often slightly below $1
        break;
      case 'USDD': // TRON USDD
        basePrice = 0.9999; // Usually close to $1
        break;
      case 'FEI': // Fei USD (can depeg)
        basePrice = 0.993; // Often slightly below $1
        break;
      case 'USTC': // TerraClassic USD (heavily depegged)
        basePrice = 0.014; // Very low after collapse
        break;
      case 'USN': // NEAR USN (depegged)
        basePrice = 0.80; // Significantly depegged
        break;
      case 'USNBT': // NuBits (depegged)
        basePrice = 0.10; // Heavily depegged
        break;
      case 'DUSD': // DefiDollar (can depeg)
        basePrice = 0.95; // Often below $1
        break;
      case 'CUSD': // Celo Dollar
        basePrice = 0.9998; // Usually stable
        break;
      case 'BLC': // Balance Coin
        basePrice = 0.9926; // Slightly below $1
        break;
      case 'PAR': // Parallel
        basePrice = 1.00; // Target $1
        break;
        
      // Major USD stablecoins with slight variations
      case 'USDT':
        basePrice = 1.0005;
        break;
      case 'USDC':
        basePrice = 1.0002;
        break;
      case 'DAI':
        basePrice = 1.0001;
        break;
      case 'USDE':
        basePrice = 1.0003;
        break;
      case 'USDS':
        basePrice = 0.9996;
        break;
      case 'USD1':
        basePrice = 0.9996;
        break;
      case 'USDTB':
        basePrice = 0.9996;
        break;
      case 'PYUSD':
        basePrice = 0.9998;
        break;
      case 'FDUSD':
        basePrice = 0.9979;
        break;
      case 'RLUSD':
        basePrice = 1.00;
        break;
      case 'USDY':
        basePrice = 1.09; // Yield-bearing
        break;
      case 'USDF':
        basePrice = 1.00;
        break;
      case 'USDO':
        basePrice = 0.9971;
        break;
      case 'SATUSD':
        basePrice = 0.9974;
        break;
      case 'DEUSD':
        basePrice = 0.9993;
        break;
      case 'YU':
        basePrice = 0.9993;
        break;
      case 'SRUSD':
        basePrice = 1.09; // Yield-bearing
        break;
      case 'RUSD':
        basePrice = 1.00;
        break;
      case 'USDP':
        basePrice = 0.9999;
        break;
      case 'USDA':
        basePrice = 0.995;
        break;
      case 'FRXUSD':
        basePrice = 0.9995;
        break;
      case 'MIM':
        basePrice = 1.00;
        break;
      case 'USDN':
        basePrice = 0.9998;
        break;
      case 'USDL':
        basePrice = 0.9985;
        break;
      case 'BYUSD':
        basePrice = 1.00;
        break;
      case 'LUSD':
        basePrice = 1.00;
        break;
      case 'YUSD':
        basePrice = 1.00;
        break;
      case 'MIMATIC':
        basePrice = 0.9927;
        break;
        
      // Euro stablecoins
      case 'EURC':
      case 'EURS':
      case 'EURT':
      case 'CEUR':
        basePrice = 1.05; // Approximate EUR/USD rate
        break;
        
      // Other fiat currencies
      case 'XSGD': // Singapore Dollar
        basePrice = 0.74; // Approximate SGD/USD rate
        break;
      case 'GYEN': // Japanese Yen
        basePrice = 0.0067; // Approximate JPY/USD rate
        break;
      case 'IDRT': // Indonesian Rupiah
        basePrice = 0.000063; // Approximate IDR/USD rate
        break;
      case 'ZARP': // South African Rand
        basePrice = 0.055; // Approximate ZAR/USD rate
        break;
      case 'VCHF': // Swiss Franc
        basePrice = 1.10; // Approximate CHF/USD rate
        break;
        
      default:
        basePrice = 0.9998; // Default for other USD stablecoins
    }
    
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Different variation ranges based on token type
      let variation;
      if (['PAXG', 'XAUT'].includes(symbol.toUpperCase())) {
        // Gold tokens have larger price movements
        variation = (Math.random() - 0.5) * 100; // ±$50 variation
      } else if (symbol.toUpperCase() === 'KAU') {
        // Kinesis Gold (per gram) - smaller movements
        variation = (Math.random() - 0.5) * 3; // ±$1.5 variation
      } else if (symbol.toUpperCase() === 'KAG') {
        // Kinesis Silver - moderate movements
        variation = (Math.random() - 0.5) * 2; // ±$1 variation
      } else if (symbol.toUpperCase() === 'AMPL') {
        // Ampleforth - very volatile due to elastic supply
        variation = (Math.random() - 0.5) * 0.5; // ±$0.25 variation
      } else if (['USTC', 'USN', 'USNBT', 'DUSD'].includes(symbol.toUpperCase())) {
        // Depegged algorithmic stablecoins - high volatility
        variation = (Math.random() - 0.5) * 0.2; // ±$0.1 variation
      } else if (['SUSD', 'FEI', 'BLC', 'PAR'].includes(symbol.toUpperCase())) {
        // Algorithmic stablecoins - moderate volatility
        variation = (Math.random() - 0.5) * 0.05; // ±$0.025 variation
      } else if (['USDD', 'CUSD'].includes(symbol.toUpperCase())) {
        // More stable algorithmic stablecoins
        variation = (Math.random() - 0.5) * 0.01; // ±$0.005 variation
      } else if (['USDY', 'SRUSD'].includes(symbol.toUpperCase())) {
        // Yield-bearing stablecoins - small variations around higher base
        variation = (Math.random() - 0.5) * 0.02; // ±$0.01 variation
      } else if (symbol.toUpperCase().includes('EUR') || ['EURC', 'EURS', 'EURT', 'CEUR'].includes(symbol.toUpperCase())) {
        // Euro stablecoins have small variations
        variation = (Math.random() - 0.5) * 0.01; // ±0.005 variation
      } else if (['XSGD', 'GYEN', 'IDRT', 'ZARP', 'VCHF'].includes(symbol.toUpperCase())) {
        // Other fiat currencies have small variations
        variation = (Math.random() - 0.5) * 0.005; // Small fiat variations
      } else {
        // USD stablecoins have very small variations
        variation = (Math.random() - 0.5) * 0.003; // ±0.0015 variation
      }
      
      let price = basePrice + variation;
      
      // Set appropriate bounds based on token type
      if (['PAXG', 'XAUT'].includes(symbol.toUpperCase())) {
        price = Math.max(2500, Math.min(2800, price));
      } else if (symbol.toUpperCase() === 'KAU') {
        price = Math.max(80, Math.min(90, price));
      } else if (symbol.toUpperCase() === 'KAG') {
        price = Math.max(25, Math.min(35, price));
      } else if (symbol.toUpperCase() === 'AMPL') {
        price = Math.max(0.80, Math.min(1.80, price)); // Elastic supply range
      } else if (symbol.toUpperCase() === 'USTC') {
        price = Math.max(0.010, Math.min(0.020, price)); // Heavily depegged
      } else if (symbol.toUpperCase() === 'USN') {
        price = Math.max(0.70, Math.min(0.90, price)); // Depegged
      } else if (symbol.toUpperCase() === 'USNBT') {
        price = Math.max(0.05, Math.min(0.15, price)); // Very depegged
      } else if (symbol.toUpperCase() === 'DUSD') {
        price = Math.max(0.90, Math.min(1.00, price)); // Usually below $1
      } else if (['SUSD', 'FEI', 'BLC'].includes(symbol.toUpperCase())) {
        price = Math.max(0.96, Math.min(1.02, price)); // Mild depegging risk
      } else if (['USDD', 'CUSD', 'PAR'].includes(symbol.toUpperCase())) {
        price = Math.max(0.995, Math.min(1.005, price)); // Usually stable
      } else if (['USDY', 'SRUSD'].includes(symbol.toUpperCase())) {
        price = Math.max(1.06, Math.min(1.12, price)); // Yield-bearing range
      } else if (['EURC', 'EURS', 'EURT', 'CEUR'].includes(symbol.toUpperCase())) {
        price = Math.max(1.02, Math.min(1.08, price));
      } else if (symbol.toUpperCase() === 'XSGD') {
        price = Math.max(0.72, Math.min(0.76, price));
      } else if (symbol.toUpperCase() === 'GYEN') {
        price = Math.max(0.0065, Math.min(0.0069, price));
      } else if (symbol.toUpperCase() === 'IDRT') {
        price = Math.max(0.000060, Math.min(0.000066, price));
      } else if (symbol.toUpperCase() === 'ZARP') {
        price = Math.max(0.050, Math.min(0.060, price));
      } else if (symbol.toUpperCase() === 'VCHF') {
        price = Math.max(1.08, Math.min(1.12, price));
      } else {
        price = Math.max(0.995, Math.min(1.005, price));
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(this.getDecimalPrecision(symbol))),
        volume: Math.floor(Math.random() * 100000000) + 50000000
      });
    }
    
    return data;
  }

  private static getDecimalPrecision(symbol: string): number {
    switch (symbol.toUpperCase()) {
      case 'PAXG':
      case 'XAUT':
      case 'KAU':
      case 'KAG':
        return 2; // Precious metals - 2 decimal places
      case 'GYEN':
        return 4; // Japanese Yen - 4 decimal places
      case 'IDRT':
        return 6; // Indonesian Rupiah - 6 decimal places
      default:
        return 6; // Default for stablecoins - 6 decimal places
    }
  }

  private static generateComparisonData(symbols: string[]): {
    coins: Array<{
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
    }>;
  } {
    return {
      coins: symbols.map(symbol => {
        // Get reference data if available
        const referenceData = getStablecoinBySymbol(symbol);
        
        if (referenceData) {
          return {
            symbol: referenceData.symbol,
            name: referenceData.name,
            backing: referenceData.backing,
            marketCap: `$${(referenceData.marketCap / 1e9).toFixed(2)}B`,
            chain: referenceData.chains.length > 1 ? 'Multi-chain' : referenceData.chains[0],
            yield: referenceData.category === 'Yield-bearing' ? '3-5% APY' : 'None',
            issuer: referenceData.issuer || 'Decentralized',
            regulation: referenceData.riskLevel === 'Low' ? 'High Compliance' : 
                       referenceData.riskLevel === 'Medium' ? 'Moderate' : 'Limited',
            use_case: referenceData.useCase,
            risk_level: referenceData.riskLevel
          };
        }
        
        // Fallback to existing mock data if not in reference
        return this.getFallbackStablecoinData(symbol);
      })
    };
  }

  private static getFallbackStablecoinData(symbol: string) {
    const stablecoinData: { [key: string]: any } = {
      'USDT': {
        name: 'Tether',
        backing: 'USD Reserves',
        marketCap: '$120B+',
        chain: 'Multi-chain',
        yield: 'None',
        issuer: 'Tether Ltd',
        regulation: 'Limited',
        use_case: 'Trading, Payments',
        risk_level: 'Medium'
      },
      'USDC': {
        name: 'USD Coin',
        backing: 'USD + Treasuries',
        marketCap: '$40B+',
        chain: 'Multi-chain',
        yield: 'None',
        issuer: 'Circle',
        regulation: 'High Compliance',
        use_case: 'DeFi, Payments',
        risk_level: 'Low'
      },
      'DAI': {
        name: 'MakerDAO',
        backing: 'Crypto Collateral',
        marketCap: '$5B+',
        chain: 'Ethereum',
        yield: 'DSR 5%+',
        issuer: 'MakerDAO',
        regulation: 'Decentralized',
        use_case: 'DeFi',
        risk_level: 'Medium'
      },
      'BUSD': {
        name: 'Binance USD',
        backing: 'USD Reserves',
        marketCap: '$2B+',
        chain: 'Multi-chain',
        yield: 'None',
        issuer: 'Paxos/Binance',
        regulation: 'NY Regulated',
        use_case: 'Trading',
        risk_level: 'Medium'
      },
      'FRAX': {
        name: 'Frax Protocol',
        backing: 'Algorithmic + Collateral',
        marketCap: '$1B+',
        chain: 'Multi-chain',
        yield: 'Variable',
        issuer: 'Frax Finance',
        regulation: 'Decentralized',
        use_case: 'DeFi Innovation',
        risk_level: 'High'
      },
      'TUSD': {
        name: 'TrueUSD',
        backing: 'USD Reserves',
        marketCap: '$500M+',
        chain: 'Multi-chain',
        yield: 'None',
        issuer: 'Techteryx',
        regulation: 'Attested',
        use_case: 'Trading, Storage',
        risk_level: 'Medium'
      }
    };

    return {
      symbol,
      ...(stablecoinData[symbol] || {
        name: symbol,
        backing: 'Unknown',
        marketCap: 'N/A',
        chain: 'N/A',
        yield: 'N/A',
        issuer: 'N/A',
        regulation: 'N/A',
        use_case: 'N/A',
        risk_level: 'N/A'
      })
    };
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

  private static async getAdoptionData(stablecoin: string): Promise<{
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
  } | undefined> {
    try {
      const { data, error } = await supabase.functions.invoke('dune-adoption-tracker', {
        body: {
          stablecoin
        }
      });

      if (error || !data?.adoptionData) {
        console.error('Adoption data error:', error);
        return undefined;
      }

      return data.adoptionData;
    } catch (error) {
      console.error('Error getting adoption data:', error);
      return undefined;
    }
  }
}