import { STABLECOIN_REFERENCE_DATA } from '@/data/stablecoinReference';

/**
 * Validates if the input is a valid stablecoin symbol or name
 * @param input - The stablecoin symbol, name, or query to validate
 * @returns Object with isValid boolean and matchedSymbol if found
 */
export const validateStablecoin = (input: string): { 
  isValid: boolean; 
  matchedSymbol?: string; 
  matchedName?: string;
  errorMessage?: string;
} => {
  if (!input || typeof input !== 'string') {
    return { 
      isValid: false, 
      errorMessage: 'Please enter a stablecoin symbol or name'
    };
  }

  const cleanInput = input.trim().toLowerCase();

  // Check if input is empty after trimming
  if (cleanInput.length === 0) {
    return { 
      isValid: false, 
      errorMessage: 'Please enter a stablecoin symbol or name'
    };
  }

  // Find exact symbol match (case-insensitive)
  const symbolMatch = STABLECOIN_REFERENCE_DATA.find(
    coin => coin.symbol.toLowerCase() === cleanInput
  );

  if (symbolMatch) {
    return {
      isValid: true,
      matchedSymbol: symbolMatch.symbol,
      matchedName: symbolMatch.name
    };
  }

  // Find exact name match (case-insensitive)
  const nameMatch = STABLECOIN_REFERENCE_DATA.find(
    coin => coin.name.toLowerCase() === cleanInput
  );

  if (nameMatch) {
    return {
      isValid: true,
      matchedSymbol: nameMatch.symbol,
      matchedName: nameMatch.name
    };
  }

  // Find partial name match (for common names like "tether" for USDT)
  const partialNameMatch = STABLECOIN_REFERENCE_DATA.find(
    coin => coin.name.toLowerCase().includes(cleanInput) || 
           cleanInput.includes(coin.name.toLowerCase())
  );

  if (partialNameMatch) {
    return {
      isValid: true,
      matchedSymbol: partialNameMatch.symbol,
      matchedName: partialNameMatch.name
    };
  }

  // Check for common aliases and alternative names
  const aliases: Record<string, string> = {
    'tether': 'USDT',
    'usd coin': 'USDC',
    'circle': 'USDC',
    'maker': 'DAI',
    'makerdao': 'DAI',
    'paypal usd': 'PYUSD',
    'paypal': 'PYUSD',
    'pax gold': 'PAXG',
    'paxos gold': 'PAXG',
    'tether gold': 'XAUT',
    'ripple usd': 'RLUSD',
    'ethena': 'USDE',
    'frax': 'FRXUSD',
    'magic internet money': 'MIM',
    'terraclassic': 'USTC',
    'terra classic': 'USTC',
    'first digital': 'FDUSD',
    'binance usd': 'BUSD',
    'binance': 'BUSD'
  };

  const aliasMatch = aliases[cleanInput];
  if (aliasMatch) {
    const matchedCoin = STABLECOIN_REFERENCE_DATA.find(coin => coin.symbol === aliasMatch);
    if (matchedCoin) {
      return {
        isValid: true,
        matchedSymbol: matchedCoin.symbol,
        matchedName: matchedCoin.name
      };
    }
  }

  // If no match found, return error
  return {
    isValid: false,
    errorMessage: `"${input}" is not a recognized stablecoin. Please enter a valid stablecoin symbol (e.g., USDT, USDC, DAI) or name (e.g., Tether, USD Coin, Dai).`
  };
};

/**
 * Validates multiple stablecoin inputs for comparison
 * @param input1 - First stablecoin to validate
 * @param input2 - Second stablecoin to validate
 * @returns Validation results for both inputs
 */
export const validateStablecoinComparison = (input1: string, input2: string) => {
  const validation1 = validateStablecoin(input1);
  const validation2 = validateStablecoin(input2);

  return {
    isValid: validation1.isValid && validation2.isValid,
    stablecoin1: validation1,
    stablecoin2: validation2,
    errorMessage: !validation1.isValid ? validation1.errorMessage : 
                 !validation2.isValid ? validation2.errorMessage : undefined
  };
};

/**
 * Get list of all available stablecoin symbols for suggestions
 */
export const getAvailableStablecoins = () => {
  return STABLECOIN_REFERENCE_DATA.map(coin => ({
    symbol: coin.symbol,
    name: coin.name,
    category: coin.category
  })).sort((a, b) => a.symbol.localeCompare(b.symbol));
};

/**
 * Get popular stablecoin suggestions
 */
export const getPopularStablecoins = () => {
  const popularSymbols = ['USDT', 'USDC', 'DAI', 'USDE', 'PYUSD', 'FDUSD', 'PAXG', 'EURS'];
  return STABLECOIN_REFERENCE_DATA
    .filter(coin => popularSymbols.includes(coin.symbol))
    .sort((a, b) => popularSymbols.indexOf(a.symbol) - popularSymbols.indexOf(b.symbol))
    .map(coin => ({
      symbol: coin.symbol,
      name: coin.name,
      category: coin.category
    }));
};