export interface WalletBalance {
  token_address: string;
  name: string;
  symbol: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possible_spam: boolean;
  verified_collection: boolean;
  balance_formatted: string;
  usd_price?: number;
  usd_value?: number;
  usd_value_24hr_percent_change?: number;
  native_token: boolean;
  portfolio_percentage?: number;
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
        // Solana uses different API structure
        endpoint = `/account/mainnet/${address}/tokens`;
        // No exclude_spam parameter for Solana API
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
      return Array.isArray(data) ? data : (data.result || []);
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      throw error;
    }
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

  static formatWalletBalanceData(balances: WalletBalance[]): string {
    if (!balances || !Array.isArray(balances) || balances.length === 0) {
      return '**WALLET TOKEN BALANCES:** No tokens found or wallet is empty';
    }

    console.log('Raw balance data:', balances);

    // Calculate total value more safely
    const totalValue = balances.reduce((sum, token) => {
      const value = parseFloat(token.usd_value?.toString() || '0') || 0;
      return sum + value;
    }, 0);
    
    // More lenient filtering for tokens
    const validTokens = balances
      .filter(token => {
        // Don't filter spam for now to see all tokens
        const hasBalance = parseFloat(token.balance_formatted || token.balance || '0') > 0;
        const hasValue = parseFloat(token.usd_value?.toString() || '0') > 0;
        console.log(`Token ${token.name || token.symbol}: balance=${token.balance_formatted || token.balance}, usd_value=${token.usd_value}, hasBalance=${hasBalance}, hasValue=${hasValue}`);
        return hasBalance || hasValue;
      })
      .sort((a, b) => {
        const aValue = parseFloat(a.usd_value?.toString() || '0') || 0;
        const bValue = parseFloat(b.usd_value?.toString() || '0') || 0;
        return bValue - aValue;
      })
      .slice(0, 15); // Show more tokens

    console.log('Filtered tokens:', validTokens.length);

    if (validTokens.length === 0) {
      return `**WALLET TOKEN BALANCES:** 
**Total Tokens Found:** ${balances.length}
**Filtered Tokens:** 0 (showing raw data for debugging)

**Raw Token Data:**
${balances.slice(0, 5).map(token => 
  `• ${token.name || token.symbol || 'Unknown'}: ${token.balance || token.balance_formatted || 'No balance'} (USD: ${token.usd_value || 'N/A'})`
).join('\n')}`;
    }
    
    return `**WALLET TOKEN BALANCES:**\n` +
      `**Total Portfolio Value:** $${totalValue.toLocaleString()}\n` +
      `**Tokens Found:** ${balances.length} | **Showing:** ${validTokens.length}\n\n` +
      validTokens.map(token => {
        const balance = token.balance_formatted || token.balance || '0';
        const symbol = (token.symbol || 'N/A').toUpperCase();
        const name = token.name || 'Unknown Token';
        const usdValue = token.usd_value ? `($${parseFloat(token.usd_value.toString()).toLocaleString()})` : '';
        const change24h = token.usd_value_24hr_percent_change 
          ? `| 24h: ${token.usd_value_24hr_percent_change > 0 ? '+' : ''}${token.usd_value_24hr_percent_change.toFixed(2)}%` 
          : '';
        
        return `• **${name} (${symbol})**: ${balance} ${usdValue} ${change24h}`;
      }).join('\n');
  }

  static formatWalletHistoryData(transactions: WalletTransaction[]): string {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return '';
    }

    const validTransactions = transactions.filter(tx => !tx.possible_spam);
    
    if (validTransactions.length === 0) {
      return '**RECENT TRANSACTIONS:** No recent transactions found';
    }

    return `**RECENT TRANSACTIONS:**\n` +
      validTransactions.slice(0, 5).map(tx => {
        const date = new Date(tx.block_timestamp).toLocaleDateString();
        const value = parseFloat(tx.value || '0') / Math.pow(10, 18);
        
        return `• **${tx.method_label || 'Transfer'}** | ${date} ` +
          `| Value: ${value.toFixed(6)} ETH ` +
          `| From: ${tx.from_address?.slice(0, 8) || 'N/A'}... ` +
          `| To: ${tx.to_address?.slice(0, 8) || 'N/A'}...`;
      }).join('\n');
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
}