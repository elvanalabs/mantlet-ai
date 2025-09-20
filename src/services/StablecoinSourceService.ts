import { getStablecoinExplanation } from '../data/stablecoinExplanations';
import { supabase } from '../integrations/supabase/client';

interface SourceData {
  circulatingSupply?: string;
  marketShare?: string;
  backing?: string;
  issuer?: string;
  regulatory?: string;
  lastUpdate?: string;
}

export class StablecoinSourceService {
  
  /**
   * Fetch data from official sources for a specific stablecoin
   */
  static async fetchFromOfficialSources(stablecoin: string): Promise<SourceData | null> {
    const explanation = getStablecoinExplanation(stablecoin);
    
    if (!explanation || !explanation.sources || explanation.sources.length === 0) {
      console.log(`No sources found for stablecoin: ${stablecoin}`);
      return null;
    }

    try {
      // Use the first official source (usually the issuer's website)
      const officialSource = explanation.sources[0];
      
      if (this.isOfficialIssuerSource(officialSource, stablecoin)) {
        return await this.fetchFromIssuerWebsite(officialSource, stablecoin);
      }
      
      // If no official issuer source, try other sources
      return await this.fetchFromAlternativeSources(explanation.sources, stablecoin);
      
    } catch (error) {
      console.error(`Error fetching from official sources for ${stablecoin}:`, error);
      // Return empty data instead of null to provide fallback
      return {
        circulatingSupply: 'N/A',
        marketShare: 'N/A',
        backing: 'Information temporarily unavailable',
        issuer: 'Unknown',
        regulatory: 'Unknown',
        lastUpdate: new Date().toISOString()
      };
    }
  }

  /**
   * Check if a source is the official issuer website
   */
  private static isOfficialIssuerSource(source: string, stablecoin: string): boolean {
    const officialSources: { [key: string]: string[] } = {
      'USDT': ['Tether', 'tether.to'],
      'USDC': ['Circle', 'circle.com'],
      'DAI': ['MakerDAO', 'makerdao.com'],
      'BUSD': ['Binance', 'binance.com'],
      'FRAX': ['Frax', 'frax.finance'],
      'LUSD': ['Liquity', 'liquity.org'],
      'TUSD': ['TrueUSD', 'trueusd.com'],
      'GUSD': ['Gemini', 'gemini.com'],
      'PAXUSD': ['Paxos', 'paxos.com'],
      'USDP': ['Paxos', 'paxos.com']
    };

    const officialNames = officialSources[stablecoin.toUpperCase()] || [];
    return officialNames.some(name => 
      source.toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * Fetch data from the issuer's official website
   */
  private static async fetchFromIssuerWebsite(source: string, stablecoin: string): Promise<SourceData | null> {
    try {
      const searchQuery = `${stablecoin} ${source} circulating supply market cap reserves`;
      
      const { data, error } = await supabase.functions.invoke('serp-search', {
        body: { 
          query: searchQuery,
          domain: this.getOfficialDomain(source, stablecoin)
        }
      });

      if (error || !data?.results) {
        console.log('No official website data found, falling back to alternative sources');
        return null;
      }

      return this.parseOfficialData(data.results, stablecoin);
      
    } catch (error) {
      console.error(`Error fetching from ${source}:`, error);
      return null;
    }
  }

  /**
   * Get the official domain for a stablecoin issuer
   */
  private static getOfficialDomain(source: string, stablecoin: string): string | undefined {
    const domains: { [key: string]: string } = {
      'USDT': 'tether.to',
      'USDC': 'centre.io',
      'DAI': 'makerdao.com',
      'BUSD': 'paxos.com',
      'FRAX': 'frax.finance',
      'LUSD': 'liquity.org',
      'TUSD': 'trueusd.com', 
      'GUSD': 'gemini.com',
      'PAXUSD': 'paxos.com',
      'USDP': 'paxos.com'
    };

    return domains[stablecoin.toUpperCase()];
  }

  /**
   * Fetch data from alternative sources (CoinGecko, DeFiLlama, etc.)
   */
  private static async fetchFromAlternativeSources(sources: string[], stablecoin: string): Promise<SourceData | null> {
    for (const source of sources) {
      if (source.toLowerCase().includes('coingecko')) {
        const coinGeckoData = await this.fetchFromCoinGecko(stablecoin);
        if (coinGeckoData) return coinGeckoData;
      }
      
      if (source.toLowerCase().includes('defillama')) {
        const defiLlamaData = await this.fetchFromDefiLlama(stablecoin);
        if (defiLlamaData) return defiLlamaData;
      }
      
      if (source.toLowerCase().includes('messari')) {
        const messariData = await this.fetchFromMessari(stablecoin);
        if (messariData) return messariData;
      }
    }
    
    return null;
  }

  /**
   * Parse official website data for relevant metrics
   */
  private static parseOfficialData(results: any[], stablecoin: string): SourceData {
    const data: SourceData = {
      lastUpdate: new Date().toISOString()
    };

    // Look for supply, market cap, and backing information in the results
    const text = results.map(r => r.snippet || r.title || '').join(' ').toLowerCase();
    
    // Extract circulating supply
    const supplyMatch = text.match(/(?:circulating|total)\s+supply[:\s]*([0-9,.$]+[bmk]?)/i);
    if (supplyMatch) {
      data.circulatingSupply = supplyMatch[1];
    }

    // Extract market share or market cap
    const marketMatch = text.match(/market\s+(?:cap|share)[:\s]*([0-9,.$%]+[bmk]?)/i);
    if (marketMatch) {
      data.marketShare = marketMatch[1];
    }

    // Extract backing information
    if (text.includes('reserve') || text.includes('backing') || text.includes('collateral')) {
      data.backing = 'Verified reserves';
    }

    return data;
  }

  /**
   * Fetch from CoinGecko API
   */
  private static async fetchFromCoinGecko(stablecoin: string): Promise<SourceData | null> {
    const coinGeckoIds: { [key: string]: string } = {
      'USDT': 'tether',
      'USDC': 'usd-coin',
      'DAI': 'dai',
      'BUSD': 'binance-usd',
      'FRAX': 'frax',
      'LUSD': 'liquity-usd'
    };

    const coinId = coinGeckoIds[stablecoin.toUpperCase()];
    if (!coinId) return null;

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
      if (!response.ok) return null;

      const data = await response.json();
      
      return {
        circulatingSupply: `${(data.market_data?.circulating_supply / 1e9).toFixed(2)}B`,
        marketShare: `$${(data.market_data?.market_cap?.usd / 1e9).toFixed(2)}B`,
        backing: data.description?.en?.includes('reserve') ? 'Reserve-backed' : 'Unknown',
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('CoinGecko fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch from DeFiLlama API
   */
  private static async fetchFromDefiLlama(stablecoin: string): Promise<SourceData | null> {
    try {
      const response = await fetch('https://stablecoins.llama.fi/stablecoins?includePrices=true');
      if (!response.ok) return null;

      const data = await response.json();
      const coin = data.peggedAssets?.find((asset: any) => 
        asset.symbol?.toUpperCase() === stablecoin.toUpperCase()
      );

      if (!coin) return null;

      return {
        circulatingSupply: `${(coin.circulating / 1e9).toFixed(2)}B`,
        marketShare: `${((coin.circulating / data.totalCirculating) * 100).toFixed(1)}%`,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('DeFiLlama fetch error:', error);
      return null;
    }
  }

  /**
   * Fetch from Messari API
   */
  private static async fetchFromMessari(stablecoin: string): Promise<SourceData | null> {
    try {
      const response = await fetch(`https://data.messari.io/api/v1/assets/${stablecoin.toLowerCase()}/metrics`);
      if (!response.ok) return null;

      const data = await response.json();
      const metrics = data.data;

      return {
        circulatingSupply: `${(metrics.supply?.circulating / 1e9).toFixed(2)}B`,
        marketShare: `$${(metrics.marketcap?.current_marketcap_usd / 1e9).toFixed(2)}B`,
        lastUpdate: new Date().toISOString()
      };
    } catch (error) {
      console.error('Messari fetch error:', error);
      return null;
    }
  }

  /**
   * Get enhanced stablecoin data combining official sources with static explanations
   */
  static async getEnhancedStablecoinData(stablecoin: string) {
    const explanation = getStablecoinExplanation(stablecoin);
    const liveData = await this.fetchFromOfficialSources(stablecoin);

    if (!explanation) return null;

    return {
      ...explanation,
      liveData: liveData || {
        circulatingSupply: explanation.adoptionData?.circulatingSupply,
        marketShare: explanation.adoptionData?.marketShare,
        lastUpdate: 'Static data'
      }
    };
  }
}