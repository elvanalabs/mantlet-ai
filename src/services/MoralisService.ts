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
      const params = {
        chain,
        exclude_spam: excludeSpam.toString()
      };

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/wallets/${address}/tokens`,
          params
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
      const params = {
        chain,
        limit: limit.toString()
      };

      const response = await fetch(this.SUPABASE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: `/wallets/${address}/history`,
          params
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

    const totalValue = balances.reduce((sum, token) => sum + (token.usd_value || 0), 0);
    
    const validTokens = balances
      .filter(token => !token.possible_spam && parseFloat(token.balance_formatted || '0') > 0)
      .sort((a, b) => (b.usd_value || 0) - (a.usd_value || 0))
      .slice(0, 10);

    if (validTokens.length === 0) {
      return '**WALLET TOKEN BALANCES:** No significant token balances found';
    }
    
    return `**WALLET TOKEN BALANCES:**\n` +
      `**Total Portfolio Value:** $${totalValue.toLocaleString()}\n\n` +
      validTokens.map(token => 
        `• **${token.name || 'Unknown'} (${(token.symbol || 'N/A').toUpperCase()})**: ${token.balance_formatted || '0'} ` +
        `${token.usd_value ? `($${token.usd_value.toLocaleString()})` : ''} ` +
        `${token.usd_value_24hr_percent_change ? `| 24h: ${token.usd_value_24hr_percent_change > 0 ? '+' : ''}${token.usd_value_24hr_percent_change.toFixed(2)}%` : ''}`
      ).join('\n');
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

  static extractWalletAddress(query: string): string | null {
    // Look for Ethereum address pattern in query
    const addressMatch = query.match(/0x[a-fA-F0-9]{40}/);
    return addressMatch ? addressMatch[0] : null;
  }
}