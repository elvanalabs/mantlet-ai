// Stablecoin reference data extracted from CoinGecko fiat-backed stablecoins
// Last updated: January 2025

export interface StablecoinData {
  symbol: string;
  name: string;
  rank: number;
  price: number;
  marketCap: number;
  volume24h: number;
  category: string;
  backing: string;
  description: string;
  chains: string[];
  issuer?: string;
  useCase: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const STABLECOIN_REFERENCE_DATA: StablecoinData[] = [
  {
    symbol: 'USDT',
    name: 'Tether',
    rank: 4,
    price: 1.00,
    marketCap: 169143561731,
    volume24h: 97844164126,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves, commercial paper, treasury bills',
    description: 'The most widely used stablecoin, backed by USD reserves and short-term commercial paper',
    chains: ['Ethereum', 'TRON', 'BSC', 'Avalanche', 'Polygon', 'Solana', 'Arbitrum', 'Optimism'],
    issuer: 'Tether Limited',
    useCase: 'Trading, remittances, store of value, DeFi',
    riskLevel: 'Medium'
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    rank: 7,
    price: 0.9998,
    marketCap: 72237585391,
    volume24h: 8833410537,
    category: 'Fiat-backed',
    backing: 'US Dollar cash and short-term US Treasury securities',
    description: 'Fully regulated USD-backed stablecoin with monthly attestations',
    chains: ['Ethereum', 'Polygon', 'Avalanche', 'Arbitrum', 'Optimism', 'Base', 'Solana'],
    issuer: 'Circle',
    useCase: 'DeFi, payments, trading, institutional treasury management',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDE',
    name: 'Ethena USDe',
    rank: 17,
    price: 1.00,
    marketCap: 13138098991,
    volume24h: 231355900,
    category: 'Synthetic',
    backing: 'Ethereum derivatives and delta hedging',
    description: 'Synthetic dollar backed by ETH derivatives and delta-neutral positions',
    chains: ['Ethereum'],
    issuer: 'Ethena Labs',
    useCase: 'DeFi yield generation, trading',
    riskLevel: 'High'
  },
  {
    symbol: 'USDS',
    name: 'USDS',
    rank: 30,
    price: 0.9996,
    marketCap: 7938163947,
    volume24h: 12664939,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Sky Protocol stablecoin (formerly MakerDAO)',
    chains: ['Ethereum'],
    issuer: 'Sky Protocol',
    useCase: 'DeFi, lending, borrowing',
    riskLevel: 'Low'
  },
  {
    symbol: 'DAI',
    name: 'Dai',
    rank: 45,
    price: 1.00,
    marketCap: 4444770363,
    volume24h: 91359304,
    category: 'Crypto-backed',
    backing: 'Over-collateralized with crypto assets',
    description: 'Decentralized stablecoin backed by cryptocurrency collateral',
    chains: ['Ethereum', 'Polygon', 'BSC', 'Arbitrum', 'Optimism', 'Base'],
    issuer: 'MakerDAO/Sky Protocol',
    useCase: 'DeFi, lending, decentralized finance',
    riskLevel: 'Medium'
  },
  {
    symbol: 'USDTB',
    name: 'USDtb',
    rank: 84,
    price: 0.9996,
    marketCap: 1753933767,
    volume24h: 445423,
    category: 'Fiat-backed',
    backing: 'US Treasury bills',
    description: 'Treasury bill-backed stablecoin for enhanced security',
    chains: ['Ethereum'],
    issuer: 'Usual Labs',
    useCase: 'Institutional treasury management, DeFi',
    riskLevel: 'Low'
  },
  {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    rank: 108,
    price: 0.9998,
    marketCap: 1239037717,
    volume24h: 69951597,
    category: 'Fiat-backed',
    backing: 'US Dollar deposits and short-term US Treasury securities',
    description: 'PayPal-issued stablecoin for payments and transfers',
    chains: ['Ethereum', 'Solana'],
    issuer: 'PayPal',
    useCase: 'Payments, remittances, e-commerce',
    riskLevel: 'Low'
  },
  {
    symbol: 'FDUSD',
    name: 'First Digital USD',
    rank: 115,
    price: 0.9979,
    marketCap: 1113133652,
    volume24h: 5209761290,
    category: 'Fiat-backed',
    backing: 'US Dollar cash and cash equivalents',
    description: 'Regulated stablecoin focused on Asian markets',
    chains: ['Ethereum', 'BSC'],
    issuer: 'First Digital Trust',
    useCase: 'Trading, payments, Asian market access',
    riskLevel: 'Low'
  },
  {
    symbol: 'RLUSD',
    name: 'Ripple USD',
    rank: 148,
    price: 1.00,
    marketCap: 728756943,
    volume24h: 89580555,
    category: 'Fiat-backed',
    backing: 'US Dollar deposits and short-term US Treasury securities',
    description: 'Ripple-issued stablecoin for cross-border payments',
    chains: ['XRP Ledger', 'Ethereum'],
    issuer: 'Ripple',
    useCase: 'Cross-border payments, remittances, institutional transfers',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDY',
    name: 'Ondo US Dollar Yield',
    rank: 153,
    price: 1.09,
    marketCap: 682163373,
    volume24h: 4489454,
    category: 'Yield-bearing',
    backing: 'US Treasury securities',
    description: 'Yield-bearing stablecoin backed by US Treasury securities',
    chains: ['Ethereum'],
    issuer: 'Ondo Finance',
    useCase: 'Yield generation, institutional treasury management',
    riskLevel: 'Low'
  },
  // Euro-backed stablecoins
  {
    symbol: 'EURS',
    name: 'STASIS EURO',
    rank: 414,
    price: 1.16,
    marketCap: 144095354,
    volume24h: 15454,
    category: 'Fiat-backed',
    backing: 'Euro deposits in European banks',
    description: 'Euro-backed stablecoin with regular audits',
    chains: ['Ethereum'],
    issuer: 'STASIS',
    useCase: 'European payments, EUR exposure in DeFi',
    riskLevel: 'Low'
  },
  {
    symbol: 'EURC',
    name: 'Euro Coin',
    rank: 825,
    price: 1.17,
    marketCap: 49097322,
    volume24h: 34190402,
    category: 'Fiat-backed',
    backing: 'Euro cash and cash equivalents',
    description: 'Circle-issued Euro stablecoin',
    chains: ['Ethereum'],
    issuer: 'Circle',
    useCase: 'European DeFi, EUR payments',
    riskLevel: 'Low'
  },
  // Gold-backed stablecoins
  {
    symbol: 'PAXG',
    name: 'PAX Gold',
    rank: 150,
    price: 2650.00,
    marketCap: 500000000,
    volume24h: 25000000,
    category: 'Commodity-backed',
    backing: 'Physical gold stored in London vaults',
    description: 'Gold-backed token representing one troy ounce of gold',
    chains: ['Ethereum'],
    issuer: 'Paxos',
    useCase: 'Gold investment, hedge against inflation, store of value',
    riskLevel: 'Medium'
  },
  {
    symbol: 'XAUT',
    name: 'Tether Gold',
    rank: 250,
    price: 2650.00,
    marketCap: 300000000,
    volume24h: 15000000,
    category: 'Commodity-backed',
    backing: 'Physical gold stored in Swiss vaults',
    description: 'Tether-issued gold-backed stablecoin',
    chains: ['Ethereum', 'TRON'],
    issuer: 'Tether',
    useCase: 'Gold exposure, store of value, inflation hedge',
    riskLevel: 'Medium'
  },
  // Silver-backed
  {
    symbol: 'KAG',
    name: 'Kinesis Silver',
    rank: 800,
    price: 30.00,
    marketCap: 10000000,
    volume24h: 500000,
    category: 'Commodity-backed',
    backing: 'Physical silver stored in vaults',
    description: 'Silver-backed token representing one troy ounce of silver',
    chains: ['Ethereum'],
    issuer: 'Kinesis',
    useCase: 'Silver investment, precious metals exposure',
    riskLevel: 'Medium'
  },
  {
    symbol: 'KAU',
    name: 'Kinesis Gold',
    rank: 750,
    price: 85.00,
    marketCap: 15000000,
    volume24h: 750000,
    category: 'Commodity-backed',
    backing: 'Physical gold (per gram)',
    description: 'Gold-backed token representing one gram of gold',
    chains: ['Ethereum'],
    issuer: 'Kinesis',
    useCase: 'Gold investment, fractional gold ownership',
    riskLevel: 'Medium'
  },
  // More USD stablecoins from CoinGecko USD stablecoin category
  {
    symbol: 'USD1',
    name: 'USD1',
    rank: 63,
    price: 0.9996,
    marketCap: 2636494254,
    volume24h: 315884449,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves and short-term US Treasury securities',
    description: 'Regulated USD-backed stablecoin for institutional use',
    chains: ['Ethereum'],
    issuer: 'World Liberty Financial',
    useCase: 'Institutional treasury, DeFi, payments',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDF',
    name: 'Falcon USD',
    rank: 90,
    price: 1.00,
    marketCap: 1683923034,
    volume24h: 41702159,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'USD-backed stablecoin focused on institutional compliance',
    chains: ['Ethereum'],
    issuer: 'Falcon Finance',
    useCase: 'Institutional payments, DeFi',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDO',
    name: 'OpenEden OpenDollar',
    rank: 271,
    price: 0.9971,
    marketCap: 276451435,
    volume24h: 4667,
    category: 'Fiat-backed',
    backing: 'US Treasury bills',
    description: 'Treasury-backed stablecoin for institutional users',
    chains: ['Ethereum'],
    issuer: 'OpenEden',
    useCase: 'Institutional treasury management, yield',
    riskLevel: 'Low'
  },
  {
    symbol: 'SATUSD',
    name: 'Satoshi Stablecoin',
    rank: 274,
    price: 0.9974,
    marketCap: 272531388,
    volume24h: 84350,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Bitcoin-native USD stablecoin',
    chains: ['Bitcoin', 'Ethereum'],
    issuer: 'Satoshi Protocol',
    useCase: 'Bitcoin ecosystem, DeFi bridging',
    riskLevel: 'Medium'
  },
  {
    symbol: 'DEUSD',
    name: 'Elixir deUSD',
    rank: 433,
    price: 0.9993,
    marketCap: 133338968,
    volume24h: 7710391,
    category: 'Synthetic',
    backing: 'Multi-asset collateral with delta-neutral strategies',
    description: 'Synthetic USD with decentralized backing mechanism',
    chains: ['Ethereum'],
    issuer: 'Elixir Protocol',
    useCase: 'DeFi yield generation, synthetic assets',
    riskLevel: 'High'
  },
  {
    symbol: 'YU',
    name: 'Yala Stablecoin',
    rank: 452,
    price: 0.9993,
    marketCap: 127411371,
    volume24h: 1082748,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Gaming-focused USD stablecoin',
    chains: ['Ethereum', 'Polygon'],
    issuer: 'Yala Games',
    useCase: 'Gaming payments, in-game transactions',
    riskLevel: 'Medium'
  },
  {
    symbol: 'SRUSD',
    name: 'Reservoir srUSD',
    rank: 525,
    price: 1.09,
    marketCap: 100939597,
    volume24h: 41,
    category: 'Yield-bearing',
    backing: 'US Treasury securities',
    description: 'Yield-bearing stablecoin backed by US Treasuries',
    chains: ['Ethereum'],
    issuer: 'Reservoir Protocol',
    useCase: 'Yield generation, treasury management',
    riskLevel: 'Low'
  },
  {
    symbol: 'USTC',
    name: 'TerraClassicUSD',
    rank: 635,
    price: 0.01363,
    marketCap: 76237299,
    volume24h: 4112157,
    category: 'Algorithmic',
    backing: 'Algorithmic mechanism (collapsed)',
    description: 'Former Terra USD stablecoin (depegged after collapse)',
    chains: ['Terra Classic'],
    issuer: 'Terra Classic',
    useCase: 'Legacy token, speculative trading',
    riskLevel: 'High'
  },
  {
    symbol: 'RUSD',
    name: 'Reservoir rUSD',
    rank: 654,
    price: 1.00,
    marketCap: 72829859,
    volume24h: 549,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Regulated USD stablecoin for DeFi',
    chains: ['Ethereum'],
    issuer: 'Reservoir Protocol',
    useCase: 'DeFi lending, borrowing',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDP',
    name: 'Pax Dollar',
    rank: 686,
    price: 0.9999,
    marketCap: 67944750,
    volume24h: 4512444,
    category: 'Fiat-backed',
    backing: 'US Dollar deposits in FDIC-insured banks',
    description: 'Regulated USD stablecoin with monthly attestations',
    chains: ['Ethereum'],
    issuer: 'Paxos',
    useCase: 'Institutional payments, compliance-focused use cases',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDA',
    name: 'USDA',
    rank: 730,
    price: 0.995,
    marketCap: 60966287,
    volume24h: 14018904,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'USD-backed stablecoin for DeFi applications',
    chains: ['Ethereum'],
    issuer: 'USDA Protocol',
    useCase: 'DeFi, yield farming',
    riskLevel: 'Medium'
  },
  {
    symbol: 'FRXUSD',
    name: 'Frax USD',
    rank: 731,
    price: 0.9995,
    marketCap: 60829463,
    volume24h: 7133601,
    category: 'Hybrid',
    backing: 'Hybrid algorithmic and collateral-backed',
    description: 'Next-generation Frax stablecoin with improved mechanisms',
    chains: ['Ethereum', 'Arbitrum', 'Polygon'],
    issuer: 'Frax Finance',
    useCase: 'DeFi, yield generation, cross-chain applications',
    riskLevel: 'Medium'
  },
  {
    symbol: 'MIM',
    name: 'Magic Internet Money',
    rank: 772,
    price: 1.00,
    marketCap: 55417808,
    volume24h: 1199,
    category: 'Crypto-backed',
    backing: 'Over-collateralized with various crypto assets',
    description: 'Multi-chain stablecoin backed by interest-bearing tokens',
    chains: ['Ethereum', 'Arbitrum', 'Avalanche', 'Fantom'],
    issuer: 'Abracadabra Money',
    useCase: 'DeFi leverage, cross-chain liquidity',
    riskLevel: 'High'
  },
  {
    symbol: 'USDN',
    name: 'Noble Dollar',
    rank: 802,
    price: 0.9998,
    marketCap: 52495259,
    volume24h: 174638,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Cosmos-native USD stablecoin',
    chains: ['Cosmos', 'Noble'],
    issuer: 'Noble Network',
    useCase: 'Cosmos ecosystem, IBC transfers',
    riskLevel: 'Low'
  },
  {
    symbol: 'USDL',
    name: 'Lift Dollar',
    rank: 810,
    price: 0.9985,
    marketCap: 50953851,
    volume24h: 51690,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Regulated USD stablecoin for institutional use',
    chains: ['Ethereum'],
    issuer: 'Lift Protocol',
    useCase: 'Institutional payments, compliance',
    riskLevel: 'Low'
  },
  {
    symbol: 'BYUSD',
    name: 'BYUSD',
    rank: 828,
    price: 1.00,
    marketCap: 48574552,
    volume24h: 368333,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Bybit exchange stablecoin',
    chains: ['Ethereum', 'BSC'],
    issuer: 'Bybit',
    useCase: 'Exchange trading, payments',
    riskLevel: 'Medium'
  },
  {
    symbol: 'LUSD',
    name: 'Liquity USD',
    rank: 961,
    price: 1.00,
    marketCap: 38220375,
    volume24h: 287444,
    category: 'Crypto-backed',
    backing: 'Over-collateralized with Ethereum',
    description: 'Decentralized USD stablecoin backed solely by ETH',
    chains: ['Ethereum'],
    issuer: 'Liquity Protocol',
    useCase: 'Decentralized borrowing, ETH leverage',
    riskLevel: 'Medium'
  },
  {
    symbol: 'YUSD',
    name: 'Aegis YUSD',
    rank: 1089,
    price: 1.00,
    marketCap: 30348201,
    volume24h: 924457,
    category: 'Fiat-backed',
    backing: 'US Dollar reserves',
    description: 'Yield-optimized USD stablecoin',
    chains: ['Ethereum'],
    issuer: 'Aegis Protocol',
    useCase: 'Yield generation, DeFi',
    riskLevel: 'Medium'
  },
  {
    symbol: 'MIMATIC',
    name: 'MAI',
    rank: 1150,
    price: 0.9927,
    marketCap: 27363470,
    volume24h: 6690,
    category: 'Crypto-backed',
    backing: 'Over-collateralized with various crypto assets',
    description: 'Multi-chain stablecoin with diverse collateral options',
    chains: ['Polygon', 'Arbitrum', 'Fantom', 'Avalanche'],
    issuer: 'QiDAO',
    useCase: 'Multi-chain DeFi, collateralized borrowing',
    riskLevel: 'Medium'
  },
  // Other fiat-backed stablecoins
  {
    symbol: 'XSGD',
    name: 'XSGD',
    rank: 900,
    price: 0.74,
    marketCap: 20000000,
    volume24h: 1000000,
    category: 'Fiat-backed',
    backing: 'Singapore Dollar deposits',
    description: 'Singapore Dollar-backed stablecoin',
    chains: ['Ethereum', 'Zilliqa'],
    issuer: 'Xfers',
    useCase: 'Southeast Asian payments, SGD exposure',
    riskLevel: 'Low'
  },
  {
    symbol: 'GYEN',
    name: 'GYEN',
    rank: 950,
    price: 0.0067,
    marketCap: 15000000,
    volume24h: 500000,
    category: 'Fiat-backed',
    backing: 'Japanese Yen deposits',
    description: 'Japanese Yen-backed stablecoin',
    chains: ['Ethereum'],
    issuer: 'GMO Trust',
    useCase: 'Japanese market access, JPY exposure',
    riskLevel: 'Low'
  },
  {
    symbol: 'IDRT',
    name: 'Rupiah Token',
    rank: 1200,
    price: 0.000063,
    marketCap: 5000000,
    volume24h: 100000,
    category: 'Fiat-backed',
    backing: 'Indonesian Rupiah deposits',
    description: 'Indonesian Rupiah-backed stablecoin',
    chains: ['Ethereum', 'BSC'],
    issuer: 'Rupiah Token',
    useCase: 'Indonesian payments, IDR exposure',
    riskLevel: 'Medium'
  },
  {
    symbol: 'ZARP',
    name: 'ZAR Token',
    rank: 1300,
    price: 0.055,
    marketCap: 3000000,
    volume24h: 50000,
    category: 'Fiat-backed',
    backing: 'South African Rand deposits',
    description: 'South African Rand-backed stablecoin',
    chains: ['Ethereum'],
    issuer: 'ZARP',
    useCase: 'South African payments, ZAR exposure',
    riskLevel: 'Medium'
  },
  {
    symbol: 'VCHF',
    name: 'VNX Swiss Franc',
    rank: 1400,
    price: 1.10,
    marketCap: 2000000,
    volume24h: 25000,
    category: 'Fiat-backed',
    backing: 'Swiss Franc deposits',
    description: 'Swiss Franc-backed stablecoin',
    chains: ['Ethereum'],
    issuer: 'VNX',
    useCase: 'Swiss market access, CHF exposure',
    riskLevel: 'Low'
  }
];

// Helper functions
export const getStablecoinBySymbol = (symbol: string): StablecoinData | undefined => {
  return STABLECOIN_REFERENCE_DATA.find(coin => 
    coin.symbol.toLowerCase() === symbol.toLowerCase()
  );
};

export const getStablecoinsByCategory = (category: string): StablecoinData[] => {
  return STABLECOIN_REFERENCE_DATA.filter(coin => 
    coin.category.toLowerCase().includes(category.toLowerCase())
  );
};

export const getStablecoinsByRiskLevel = (riskLevel: 'Low' | 'Medium' | 'High'): StablecoinData[] => {
  return STABLECOIN_REFERENCE_DATA.filter(coin => coin.riskLevel === riskLevel);
};

export const getTopStablecoinsByMarketCap = (limit: number = 10): StablecoinData[] => {
  return STABLECOIN_REFERENCE_DATA
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, limit);
};
