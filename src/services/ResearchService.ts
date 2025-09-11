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
      'usdtb': 'USDTB',
      'bfusd': 'BFUSD',
      'binance futures usd': 'BFUSD',
      'usdf': 'USDF',
      'falcon usd': 'USDF',
      
      // Gold/commodity backed
      'xaut': 'XAUT',
      'tether gold': 'XAUT',
      'paxg': 'PAXG',
      'pax gold': 'PAXG',
      
      // Major protocols
      'pyusd': 'PYUSD',
      'paypal usd': 'PYUSD',
      'fdusd': 'FDUSD',
      'first digital usd': 'FDUSD',
      'rlusd': 'RLUSD',
      'ripple usd': 'RLUSD',
      'usdx': 'USDX',
      'stables labs usdx': 'USDX',
      'usd0': 'USD0',
      'usual usd': 'USD0',
      'usdg': 'USDG',
      'global dollar': 'USDG',
      'tusd': 'TUSD',
      'trueusd': 'TUSD',
      'usdd': 'USDD',
      'usdb': 'USDB',
      'gho': 'GHO',
      'aave gho': 'GHO',
      'usr': 'USR',
      'resolv usr': 'USR',
      'busd': 'BUSD',
      'binance usd': 'BUSD',
      'frax': 'FRAX',
      'frax dollar': 'FRAX',
      'usdo': 'USDO',
      'openeden opendollar': 'USDO',
      'satusd': 'SATUSD',
      'satoshi stablecoin': 'SATUSD',
      
      // Euro stablecoins
      'eurc': 'EURC',
      'euro coin': 'EURC',
      'eurs': 'EURS',
      'stasis euro': 'EURS',
      'eurt': 'EURT',
      'euro tether': 'EURT',
      'eurq': 'EURQ',
      'quantoz eurq': 'EURQ',
      'veur': 'VEUR',
      'vnx euro': 'VEUR',
      'ceur': 'CEUR',
      'celo euro': 'CEUR',
      
      // Other fiat pegged
      'xsgd': 'XSGD',
      'singapore dollar': 'XSGD',
      'idrt': 'IDRT',
      'rupiah token': 'IDRT',
      'gyen': 'GYEN',
      'japanese yen': 'GYEN',
      'zarp': 'ZARP',
      'south african rand': 'ZARP',
      'vchf': 'VCHF',
      'vnx swiss franc': 'VCHF',
      'pht': 'PHT',
      'philippine token': 'PHT',
      
      // Precious metals
      'kau': 'KAU',
      'kinesis gold': 'KAU',
      'kag': 'KAG',
      'kinesis silver': 'KAG',
      
      // Protocol specific
      'usda': 'USDA',
      'usda protocol': 'USDA',
      'ausd': 'AUSD',
      'agora dollar': 'AUSD',
      'deusd': 'DEUSD',
      'elixir deusd': 'DEUSD',
      'yu': 'YU',
      'yala stablecoin': 'YU',
      'fxusd': 'FXUSD',
      'f(x) protocol fxusd': 'FXUSD',
      'dola': 'DOLA',
      'inverse finance': 'DOLA',
      'crvusd': 'CRVUSD',
      'curve usd': 'CRVUSD',
      'usdz': 'USDZ',
      'anzen usdz': 'USDZ',
      'avusd': 'AVUSD',
      'avant usd': 'AVUSD',
      'srusd': 'SRUSD',
      'reservoir srusd': 'SRUSD',
      
      // Emerging stablecoins
      'rusdc': 'RUSDC',
      'relend network usdc': 'RUSDC',
      'yusd': 'YUSD',
      'yusd stablecoin': 'YUSD',
      'inalpha': 'INALPHA',
      'nest alpha vault': 'INALPHA',
      'money': 'MONEY',
      'defi.money': 'MONEY',
      'iusd': 'IUSD',
      'indigo protocol iusd': 'IUSD',
      'ousd': 'OUSD',
      'origin dollar': 'OUSD',
      'pinto': 'PINTO',
      'btcusd': 'BTCUSD',
      'bitcoin usd': 'BTCUSD',
      'usdh': 'USDH',
      'hermetica usdh': 'USDH',
      'usdr': 'USDR',
      'stablr usd': 'USDR',
      'usdq': 'USDQ',
      'quantoz usdq': 'USDQ',
      'bnusd': 'BNUSD',
      'balanced dollars': 'BNUSD',
      'husd': 'HUSD',
      'fastusd': 'FASTUSD',
      'sei fastusd': 'FASTUSD',
      'susp': 'SUSP',
      'pareto staked usp': 'SUSP',
      'nect': 'NECT',
      'nectar': 'NECT',
      'wusd': 'WUSD',
      'worldwide usd': 'WUSD',
      'musd': 'MUSD',
      'meta usd': 'MUSD',
      'usdl': 'USDL',
      'liquid loans usdl': 'USDL',
      'fusd': 'FUSD',
      'freedom dollar': 'FUSD',
      'djed': 'DJED',
      'cardano djed': 'DJED',
      'usdn': 'USDN',
      'smardex usdn': 'USDN',
      'fei': 'FEI',
      'fei usd': 'FEI',
      'ggusd': 'GGUSD',
      'good game us dollar': 'GGUSD',
      'ylds': 'YLDS',
      'usdglo': 'USDGLO',
      'glo dollar': 'USDGLO',
      'usdxl': 'USDXL',
      'last usd': 'USDXL',
      'rai': 'RAI',
      'rai reflex index': 'RAI',
      'msusd': 'MSUSD',
      'main street usd': 'MSUSD',
      'susda': 'SUSDA',
      'cusd': 'CUSD',
      'cap usd': 'CUSD',
      'reusd': 'REUSD',
      'resupply usd': 'REUSD'
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
    let basePrice = 1.0000; // Default for USD stablecoins
    
    // Set appropriate base prices for different types of stablecoins/tokens
    switch (symbol.toUpperCase()) {
      case 'PAXG':
      case 'XAUT': // Gold-backed tokens
        basePrice = 2650.00; // Approximate gold price
        break;
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
      case 'EURC':
      case 'EURS':
      case 'EURT': // Euro stablecoins
        basePrice = 1.05; // Approximate EUR/USD rate
        break;
      default:
        basePrice = 0.9998; // Default for other USD stablecoins
    }
    
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      
      // Different variation ranges based on token type
      let variation;
      if (symbol.toUpperCase() === 'PAXG' || symbol.toUpperCase() === 'XAUT') {
        // Gold tokens have larger price movements
        variation = (Math.random() - 0.5) * 100; // ±$50 variation
      } else if (symbol.toUpperCase().includes('EUR')) {
        // Euro stablecoins have small variations
        variation = (Math.random() - 0.5) * 0.01; // ±0.005 variation
      } else {
        // USD stablecoins have very small variations
        variation = (Math.random() - 0.5) * 0.003; // ±0.0015 variation
      }
      
      let price = basePrice + variation;
      
      // Set appropriate bounds based on token type
      if (symbol.toUpperCase() === 'PAXG' || symbol.toUpperCase() === 'XAUT') {
        price = Math.max(2500, Math.min(2800, price));
      } else if (symbol.toUpperCase().includes('EUR')) {
        price = Math.max(1.02, Math.min(1.08, price));
      } else {
        price = Math.max(0.995, Math.min(1.005, price));
      }
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Number(price.toFixed(symbol.toUpperCase() === 'PAXG' || symbol.toUpperCase() === 'XAUT' ? 2 : 6)),
        volume: Math.floor(Math.random() * 100000000) + 50000000
      });
    }
    
    return data;
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
      coins: symbols.map(symbol => ({
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
      }))
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