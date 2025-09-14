interface WalletBalance {
  token_address?: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;  
  decimals: number;
  balance?: string;
  possible_spam?: boolean;
  verified_collection?: boolean;
  balance_formatted?: string;
  usd_price?: number;
  usd_value?: number;
  usd_value_24hr_percent_change?: number;
  native_token?: boolean;
  portfolio_percentage?: number;
  // Solana-specific fields
  amount?: string;
  amountRaw?: string;
  possibleSpam?: boolean;
  mint?: string;
  associatedTokenAddress?: string;
  tokenStandard?: number;
  isVerifiedContract?: boolean;
  // Solana portfolio-specific fields (from /portfolio endpoint)
  usdValue?: number;
  usdPrice?: number;
  usdValue24hrPercentChange?: number;
  portfolioPercentage?: number;
}

export interface WalletTransaction {
  hash: string;
  nonce: string;
  transaction_index: string;
  from_address: string;
  to_address: string;
  value: string;
  gas: string;
  gas_price: string;
  gas_used: string;
  cumulative_gas_used: string;
  input: string;
  receipt_contract_address?: string;
  receipt_root?: string;
  receipt_status: string;
  block_timestamp: string;
  block_number: string;
  block_hash: string;
  transfer_index?: number[];
  logs?: any[];
  method_label?: string;
  summary?: string;
  possible_spam: boolean;
  verified_collection: boolean;
  category: string;
}

export interface TokenHolder {
  owner_address: string;
  owner_address_label?: string;
  balance: string;
  balance_formatted: string;
  is_contract: boolean;
  owner_type: 'contract' | 'wallet';
  usd_value?: number;
  percentage_relative_to_total_supply?: number;
}

export interface MoralisResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export class MoralisService {
  private static readonly SUPABASE_FUNCTION_URL = 'https://djozrzgevluayzcvenby.supabase.co/functions/v1/moralis-api';

  static async getWalletTokenBalances(
    address: string, 
    chain: string = 'eth',
    excludeSpam: boolean = true
  ): Promise<WalletBalance[]> {
    try {
      let endpoint: string;
      let params: any = {};

      if (chain === 'solana') {
        // Use portfolio endpoint for Solana to get complete portfolio data
        endpoint = `/account/mainnet/${address}/portfolio`;
      } else {
        // EVM chains use the standard wallet API
        endpoint = `/wallets/${address}/tokens`;
        params = {
          chain,
          exclude_spam: excludeSpam.toString()
        };
      }

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          params,
          isSolana: chain === 'solana'
        }),
      });

      const result: MoralisResponse<WalletBalance[]> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch wallet balances');
      }

      // Handle the actual Moralis API response structure
      const data = result.data as any;
      
      if (chain === 'solana') {
        // For Solana portfolio response, extract tokens array
        const tokens = Array.isArray(data) ? data : (data.tokens || []);
        
        // Return without hardcoded pricing - will be enhanced with CoinGecko
        return tokens.map((token: any) => ({
          ...token,
          balance_formatted: token.amount,
          possible_spam: token.possibleSpam
        }));
      } else {
        // For EVM response
        return Array.isArray(data) ? data : (data.result || []);
      }
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
  }

  static async getWalletTokenBalancesWithPricing(
    address: string, 
    chain: string = 'eth',
    excludeSpam: boolean = true
  ): Promise<WalletBalance[]> {
    // Get raw wallet balances from Moralis
    const balances = await this.getWalletTokenBalances(address, chain, excludeSpam);
    
    // Enhance with real pricing data from CoinGecko
    return await this.enhanceWithCoinGeckoPricing(balances, chain);
  }

  private static async enhanceWithCoinGeckoPricing(balances: WalletBalance[], chain: string): Promise<WalletBalance[]> {
    try {
      // Create a mapping of common token symbols to CoinGecko IDs
      const symbolToCoinGeckoId = this.getSymbolToCoinGeckoIdMap();
      
      // Extract unique symbols and map to CoinGecko IDs
      const coinIds = balances
        .map(token => {
          const symbol = token.symbol?.toLowerCase();
          return symbolToCoinGeckoId[symbol] || symbol;
        })
        .filter(id => id)
        .join(',');
      
      if (!coinIds) return balances;

      // Fetch prices from CoinGecko using coin IDs
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
        { 
          headers: { 
            'Accept': 'application/json',
            'User-Agent': 'CryptoAnalyzer/1.0'
          } 
        }
      );
      
      if (!response.ok) {
        console.warn('CoinGecko pricing failed:', response.status);
        return balances;
      }

      const priceData = await response.json();
      
      // Enhance balances with pricing data
      return balances.map(token => {
        const symbol = token.symbol?.toLowerCase();
        const coinId = symbolToCoinGeckoId[symbol] || symbol;
        const priceInfo = priceData[coinId];
        const price = priceInfo?.usd;
        const change24h = priceInfo?.usd_24h_change;
        const amount = parseFloat(token.amount || token.balance_formatted || token.balance || '0');
        
        return {
          ...token,
          usd_price: price,
          usd_value: price ? amount * price : undefined,
          usd_value_24hr_percent_change: change24h
        };
      });
    } catch (error) {
      console.error('Error fetching CoinGecko pricing:', error);
      return balances;
    }
  }

  private static getSymbolToCoinGeckoIdMap(): { [symbol: string]: string } {
    return {
      'btc': 'bitcoin',
      'eth': 'ethereum',
      'usdc': 'usd-coin',
      'usdt': 'tether',
      'sol': 'solana',
      'bnb': 'binancecoin',
      'ada': 'cardano',
      'dot': 'polkadot',
      'matic': 'matic-network',
      'avax': 'avalanche-2',
      'link': 'chainlink',
      'atom': 'cosmos',
      'uni': 'uniswap',
      'jup': 'jupiter-exchange-solana',
      'ray': 'raydium',
      'bonk': 'bonk',
      'wif': 'dogwifcoin',
      'pyth': 'pyth-network'
    };
  }

  static async getWalletHistory(
    address: string,
    chain: string = 'eth',
    limit: number = 10
  ): Promise<WalletTransaction[]> {
    try {
      let endpoint: string;
      let params: any = {};

      if (chain === 'solana') {
        // Solana uses different API structure - get portfolio instead
        endpoint = `/account/mainnet/${address}/portfolio`;
        // Solana doesn't have the same history endpoint
      } else {
        // EVM chains use the standard wallet API
        endpoint = `/wallets/${address}/history`;
        params = {
          chain,
          limit: limit.toString()
        };
      }

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          params,
          isSolana: chain === 'solana'
        }),
      });

      const result: MoralisResponse<{ result: WalletTransaction[] }> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch wallet history');
      }

      // Handle the actual Moralis API response structure
      const data = result.data as any;
      return Array.isArray(data) ? data : (data.result || []);
    } catch (error) {
      console.error('Error fetching wallet history:', error);
      throw error;
    }
  }

  static formatWalletBalanceData(balances: WalletBalance[], chain?: string): string {
    if (!balances || !Array.isArray(balances) || balances.length === 0) {
      return 'WALLET TOKEN BALANCES: No tokens found or wallet is empty';
    }

    console.log('Processing', balances.length, 'tokens for display');

    // Calculate total portfolio value
    const totalValue = balances.reduce((sum, token) => {
      const value = parseFloat(token.usd_value?.toString() || token.usdValue?.toString() || '0') || 0;
      return sum + value;
    }, 0);
    
    // Show all tokens with balances, regardless of USD value
    const validTokens = balances
      .filter(token => {
        const amount = token.amount || token.balance_formatted || token.balance || '0';
        const hasBalance = parseFloat(amount) > 0;
        const notSpam = !(token.possible_spam || token.possibleSpam);
        console.log(`Token ${token.name || token.symbol}: amount=${amount}, hasBalance=${hasBalance}, notSpam=${notSpam}`);
        return hasBalance && notSpam;
      })
      .sort((a, b) => {
        // Sort by USD value first, then by amount
        const aValue = parseFloat(a.usd_value?.toString() || a.usdValue?.toString() || '0') || 0;
        const bValue = parseFloat(b.usd_value?.toString() || b.usdValue?.toString() || '0') || 0;
        if (aValue !== bValue) return bValue - aValue;
        
        const aAmount = parseFloat(a.amount || a.balance_formatted || a.balance || '0');
        const bAmount = parseFloat(b.amount || b.balance_formatted || b.balance || '0');
        return bAmount - aAmount;
      })
      .slice(0, 15);

    console.log(`Showing ${validTokens.length} tokens out of ${balances.length} total`);

    if (validTokens.length === 0) {
      return `WALLET TOKEN BALANCES: No valid tokens found
Total tokens received: ${balances.length}
This might be due to filtering or all tokens being marked as spam`;
    }
    
    let result = `WALLET PORTFOLIO ANALYSIS:

TOTAL PORTFOLIO VALUE: ${totalValue > 0 ? '$' + totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : 'USD values not available'}
TOKENS FOUND: ${balances.length}
SHOWING: ${validTokens.length} tokens

TOKEN HOLDINGS:
`;

    validTokens.forEach(token => {
      const amount = token.amount || token.balance_formatted || token.balance || '0';
      const symbol = (token.symbol || 'N/A').toUpperCase();
      const name = token.name || 'Unknown Token';
      
      // Format token amount nicely
      const formattedAmount = parseFloat(amount).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 6
      });
      
      // Calculate and format USD value
      let usdInfo = '';
      const usdValue = token.usd_value || token.usdValue;
      const usdChange = token.usd_value_24hr_percent_change || token.usdValue24hrPercentChange;
      
      if (usdValue && usdValue > 0) {
        const formattedUsdValue = parseFloat(usdValue.toString());
        usdInfo = ` | USD VALUE: $${formattedUsdValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        
        // Add 24h change if available
        if (usdChange !== undefined) {
          const changeSign = usdChange >= 0 ? '+' : '';
          usdInfo += ` | 24H CHANGE: ${changeSign}${usdChange.toFixed(2)}%`;
        }
      } else {
        usdInfo = ' | USD VALUE: Not available';
      }

      result += `- ${name} (${symbol}): ${formattedAmount} tokens${usdInfo}\n`;
    });

    // Add summary statistics
    const tokensWithValue = validTokens.filter(t => (t.usd_value && t.usd_value > 0) || (t.usdValue && t.usdValue > 0));
    result += `\nPORTFOLIO SUMMARY:
- Tokens with USD values: ${tokensWithValue.length}/${validTokens.length}
- Tokens without USD values: ${validTokens.length - tokensWithValue.length}/${validTokens.length}`;

    return result;
  }

  static formatWalletHistoryData(transactions: WalletTransaction[]): string {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return '';
    }

    const validTransactions = transactions.filter(tx => !tx.possible_spam);
    
    if (validTransactions.length === 0) {
      return 'RECENT TRANSACTIONS: No recent transactions found';
    }

    return `RECENT TRANSACTIONS:
${validTransactions.slice(0, 5).map(tx => {
        const date = new Date(tx.block_timestamp).toLocaleDateString();
        const value = parseFloat(tx.value || '0') / Math.pow(10, 18);
        
        return `- ${tx.method_label || 'Transfer'} on ${date} | Value: ${value.toFixed(6)} ETH | From: ${tx.from_address?.slice(0, 8) || 'N/A'}... | To: ${tx.to_address?.slice(0, 8) || 'N/A'}...`;
      }).join('\n')}`;
  }

  static isValidEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  static isValidSolanaAddress(address: string): boolean {
    // Solana addresses are base58 encoded, 32-44 characters long
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) && address.length >= 32 && address.length <= 44;
  }

  static isValidAddress(address: string): boolean {
    return this.isValidEthereumAddress(address) || this.isValidSolanaAddress(address);
  }

  static extractWalletAddress(query: string): string | null {
    // Look for Ethereum address pattern
    const ethAddressMatch = query.match(/0x[a-fA-F0-9]{40}/);
    if (ethAddressMatch) return ethAddressMatch[0];
    
    // Look for Solana address pattern (base58, 32-44 chars)
    const solanaAddressMatch = query.match(/[1-9A-HJ-NP-Za-km-z]{32,44}/);
    if (solanaAddressMatch && this.isValidSolanaAddress(solanaAddressMatch[0])) {
      return solanaAddressMatch[0];
    }
    
    return null;
  }

  static detectChainFromAddress(address: string): string {
    if (this.isValidEthereumAddress(address)) return 'eth';
    if (this.isValidSolanaAddress(address)) return 'solana';
    return 'eth'; // default
  }

  static async getTokenHolders(
    tokenAddress: string,
    chain: string = 'eth',
    limit: number = 100
  ): Promise<TokenHolder[]> {
    try {
      const endpoint = `/erc20/${tokenAddress}/owners`;
      const params = {
        chain,
        limit: limit.toString(),
        order: 'DESC'
      };

      console.log(`Fetching holders for token: ${tokenAddress} on chain: ${chain}`);

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint,
          params,
          isSolana: false // Token holders API is only available for EVM chains
        }),
      });

      const result: MoralisResponse<{ result: TokenHolder[] }> = await response.json();
      
      if (!result.success || !result.data) {
        console.error('Moralis API error:', result.error);
        throw new Error(result.error || 'Failed to fetch token holders');
      }

      // Handle the actual Moralis API response structure - it should have a 'result' array
      const data = result.data as any;
      const holders = Array.isArray(data) ? data : (data.result || []);
      
      console.log(`Received ${holders.length} holders from Moralis API`);
      
      // Log sample data structure for debugging
      if (holders.length > 0) {
        console.log('Sample holder data:', JSON.stringify(holders[0], null, 2));
      }
      
      return holders;
    } catch (error) {
      console.error('Error fetching token holders:', error);
      throw error;
    }
  }

  static calculateConcentrationRisk(holders: TokenHolder[]): {
    top10Percentage: number;
    largestHolderPercentage: number;
    riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
    riskColor: 'green' | 'yellow' | 'red';
  } {
    if (!holders || holders.length === 0) {
      console.log('No holders data provided for concentration calculation');
      return {
        top10Percentage: 0,
        largestHolderPercentage: 0,
        riskLevel: 'Low Risk',
        riskColor: 'green'
      };
    }

    console.log(`Calculating concentration risk for ${holders.length} holders`);

    // Check if we have percentage data from Moralis API
    const hasPercentageData = holders.some(h => {
      const percentage = h.percentage_relative_to_total_supply;
      if (percentage === undefined || percentage === null) return false;
      
      // Handle both string and number types
      const numValue = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
      return !isNaN(numValue) && numValue > 0;
    });

    console.log('Has percentage data from Moralis:', hasPercentageData);

    let sortedHolders: TokenHolder[];
    let largestHolderPercentage: number;
    let top10Percentage: number;

    if (hasPercentageData) {
      // Use Moralis-provided percentages (preferred method)
      sortedHolders = [...holders].sort((a, b) => 
        (parseFloat(b.percentage_relative_to_total_supply?.toString() || '0')) - 
        (parseFloat(a.percentage_relative_to_total_supply?.toString() || '0'))
      );

      // Get raw percentage values and normalize them
      let rawLargestPercentage = parseFloat(sortedHolders[0]?.percentage_relative_to_total_supply?.toString() || '0');
      
      // Log first few holders to debug data format
      console.log('Sample holder percentages:', sortedHolders.slice(0, 3).map(h => ({
        address: h.owner_address?.slice(0, 8) + '...',
        percentage: h.percentage_relative_to_total_supply,
        balance: h.balance_formatted
      })));

      // Check if percentages are in decimal format (0.1 = 10%) or percentage format (10 = 10%)
      // If largest holder has >100%, the data is likely in basis points or needs division
      if (rawLargestPercentage > 100) {
        console.warn(`Raw percentage ${rawLargestPercentage}% > 100%, attempting to normalize`);
        
        // Try dividing by 100 first (common case: 1000 = 10%)
        if (rawLargestPercentage > 1000) {
          // Likely basis points: divide by 10000
          largestHolderPercentage = rawLargestPercentage / 10000 * 100;
          console.log(`Treating as basis points, normalized to: ${largestHolderPercentage}%`);
        } else {
          // Likely percentage * 100: divide by 100
          largestHolderPercentage = rawLargestPercentage / 100;
          console.log(`Treating as percentage*100, normalized to: ${largestHolderPercentage}%`);
        }
      } else if (rawLargestPercentage < 1) {
        // Likely decimal format (0.1 = 10%)
        largestHolderPercentage = rawLargestPercentage * 100;
        console.log(`Treating as decimal, normalized to: ${largestHolderPercentage}%`);
      } else {
        // Appears to be correct percentage format
        largestHolderPercentage = rawLargestPercentage;
      }

      // Apply same normalization to top 10 calculation
      const top10Holders = sortedHolders.slice(0, 10);
      let rawTop10Sum = top10Holders.reduce((sum, holder) => 
        sum + parseFloat(holder.percentage_relative_to_total_supply?.toString() || '0'), 0
      );

      // Apply same normalization logic
      if (rawLargestPercentage > 100) {
        if (rawLargestPercentage > 1000) {
          top10Percentage = rawTop10Sum / 10000 * 100;
        } else {
          top10Percentage = rawTop10Sum / 100;
        }
      } else if (rawLargestPercentage < 1) {
        top10Percentage = rawTop10Sum * 100;
      } else {
        top10Percentage = rawTop10Sum;
      }

    } else {
      // Fall back to balance-based calculation if percentage data isn't available
      console.warn('Using fallback calculation - results may be less accurate');
      
      sortedHolders = [...holders].sort((a, b) => 
        parseFloat(b.balance_formatted || '0') - parseFloat(a.balance_formatted || '0')
      );

      // Calculate total supply from all holders (this is an approximation)
      const totalSupplyFromHolders = holders.reduce((sum, holder) => 
        sum + parseFloat(holder.balance_formatted || '0'), 0
      );

      if (totalSupplyFromHolders === 0) {
        console.warn('Total supply calculation resulted in 0');
        return {
          top10Percentage: 0,
          largestHolderPercentage: 0,
          riskLevel: 'Low Risk',
          riskColor: 'green'
        };
      }

      largestHolderPercentage = (parseFloat(sortedHolders[0]?.balance_formatted || '0') / totalSupplyFromHolders) * 100;
      
      const top10Holders = sortedHolders.slice(0, 10);
      const top10Supply = top10Holders.reduce((sum, holder) => 
        sum + parseFloat(holder.balance_formatted || '0'), 0
      );
      top10Percentage = (top10Supply / totalSupplyFromHolders) * 100;
    }

    // Final validation - cap at 100% if somehow still over
    largestHolderPercentage = Math.min(largestHolderPercentage, 100);
    top10Percentage = Math.min(top10Percentage, 100);

    // Determine risk level based on top 10 percentage
    let riskLevel: 'Low Risk' | 'Moderate Risk' | 'High Risk';
    let riskColor: 'green' | 'yellow' | 'red';

    if (top10Percentage < 25) {
      riskLevel = 'Low Risk';
      riskColor = 'green';
    } else if (top10Percentage <= 50) {
      riskLevel = 'Moderate Risk';
      riskColor = 'yellow';
    } else {
      riskLevel = 'High Risk';
      riskColor = 'red';
    }

    console.log(`Concentration Risk Results:
      - Top 10: ${top10Percentage.toFixed(2)}%
      - Largest: ${largestHolderPercentage.toFixed(2)}%
      - Risk Level: ${riskLevel}`);

    return {
      top10Percentage: Math.round(top10Percentage * 100) / 100,
      largestHolderPercentage: Math.round(largestHolderPercentage * 100) / 100,
      riskLevel,
      riskColor
    };
  }
}