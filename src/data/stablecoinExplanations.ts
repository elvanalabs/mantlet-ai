export interface StablecoinExplanation {
  symbol: string;
  name: string;
  explanation: string;
  adoptionData?: {
    circulatingSupply: string;
    marketShare: string;
    chainDistribution: { [chain: string]: string };
    volume24h: string;
    transactions24h: string;
    depegEvents: Array<{
      date: string;
      severity: string;
      duration: string;
      cause: string;
    }>;
  };
  sources: string[];
}

export const STABLECOIN_EXPLANATIONS: { [key: string]: StablecoinExplanation } = {
  'USDT': {
    symbol: 'USDT',
    name: 'Tether',
    explanation: `**Tether (USDT)** is the world's largest stablecoin by market capitalization and trading volume, designed to maintain a 1:1 peg with the US Dollar.

**Key Features:**
• **Backing**: Backed by USD reserves, treasury bills, and short-term commercial paper
• **Market Position**: Most widely used stablecoin with over $100B market cap
• **Multi-chain**: Available on 10+ blockchains including Ethereum, TRON, BSC, Polygon
• **Use Cases**: Trading pairs, remittances, cross-border payments, DeFi protocols

**Regulatory Status:**
Tether has faced regulatory scrutiny but maintains operations globally. The company publishes quarterly attestations of reserves.

**Advantages:**
✓ Highest liquidity and acceptance
✓ Available on most exchanges
✓ Multi-chain compatibility
✓ Established track record since 2014

**Considerations:**
⚠️ Historical transparency concerns
⚠️ Regulatory uncertainties
⚠️ Centralized control

Transparency Report: https://tether.to/en/transparency/`,
    adoptionData: {
      circulatingSupply: '120.2B USDT',
      marketShare: '68.5%',
      chainDistribution: {
        'TRON': '52.1%',
        'Ethereum': '34.2%',
        'BSC': '8.3%',
        'Other': '5.4%'
      },
      volume24h: '$65.4B',
      transactions24h: '2.1M',
      depegEvents: [
        {
          date: '2022-05-12',
          severity: 'Minor',
          duration: '4 hours',
          cause: 'Market volatility during Terra Luna collapse'
        }
      ]
    },
    sources: ['Tether Transparency', 'CoinGecko', 'DeFiLlama', 'Messari']
  },

  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    explanation: `**USD Coin (USDC)** is a fully regulated, US dollar-backed stablecoin issued by Circle, known for its transparency and regulatory compliance.

**Key Features:**
• **Backing**: 100% backed by US dollar cash and short-term US Treasury securities
• **Regulation**: Regulated under US state money transmission laws
• **Transparency**: Monthly attestations by Grant Thornton LLP
• **Multi-chain**: Native on 15+ blockchains including Ethereum, Polygon, Arbitrum

**Regulatory Compliance:**
USDC operates under strict regulatory oversight with full reserve backing and regular audits.

**Advantages:**
✓ Full regulatory compliance
✓ Monthly reserve attestations
✓ Strong institutional adoption
✓ Native cross-chain support
✓ Backed by established financial institutions

**Use Cases:**
• DeFi protocols and yield farming
• Institutional treasury management
• Cross-border payments
• Trading and arbitrage
• Corporate crypto adoption

**Considerations:**
⚠️ Smaller market share than USDT
⚠️ Potential regulatory changes

Transparency Report: https://www.centre.io/usdc-transparency`,
    adoptionData: {
      circulatingSupply: '36.8B USDC',
      marketShare: '21.0%',
      chainDistribution: {
        'Ethereum': '58.3%',
        'Polygon': '15.2%',
        'Arbitrum': '12.1%',
        'Base': '8.7%',
        'Other': '5.7%'
      },
      volume24h: '$8.2B',
      transactions24h: '890K',
      depegEvents: [
        {
          date: '2023-03-11',
          severity: 'Moderate',
          duration: '48 hours',
          cause: 'Silicon Valley Bank exposure concerns'
        }
      ]
    },
    sources: ['Circle Transparency', 'Centre.io', 'CoinGecko', 'DeFiLlama']
  },

  'DAI': {
    symbol: 'DAI',
    name: 'Dai',
    explanation: `**Dai (DAI)** is a decentralized stablecoin created by MakerDAO, backed by over-collateralized cryptocurrency assets rather than traditional fiat reserves.

**Key Features:**
• **Decentralized**: No single entity controls DAI issuance
• **Crypto-backed**: Collateralized by ETH, WBTC, USDC, and other approved assets
• **Algorithmic**: Price stability maintained through automated liquidations and incentives
• **Governance**: Controlled by MKR token holders through on-chain voting

**How It Works:**
Users deposit crypto collateral (150%+ ratio) into Maker Vaults to generate DAI. If collateral value drops, positions are automatically liquidated to maintain stability.

**Advantages:**
✓ Truly decentralized architecture
✓ Censorship resistant
✓ Transparent on-chain operations
✓ No counterparty risk from traditional banking
✓ Established DeFi integration

**Use Cases:**
• DeFi lending and borrowing
• Yield farming strategies
• Hedge against crypto volatility
• Decentralized trading pairs

**Considerations:**
⚠️ Complex liquidation mechanisms
⚠️ Collateral volatility risk
⚠️ Lower liquidity than USDT/USDC

Transparency Report: https://makerburn.com/#/transparency`,
    adoptionData: {
      circulatingSupply: '4.9B DAI',
      marketShare: '2.8%',
      chainDistribution: {
        'Ethereum': '85.4%',
        'Polygon': '8.2%',
        'Arbitrum': '4.1%',
        'Other': '2.3%'
      },
      volume24h: '$95M',
      transactions24h: '45K',
      depegEvents: [
        {
          date: '2020-03-12',
          severity: 'Major',
          duration: '72 hours',
          cause: 'Black Thursday ETH crash and liquidation cascade'
        }
      ]
    },
    sources: ['MakerDAO', 'DaiStats', 'DeFiPulse', 'CoinGecko']
  },

  'USDE': {
    symbol: 'USDE',
    name: 'Ethena USDe',
    explanation: `**Ethena USDe (USDe)** is a synthetic dollar protocol that maintains its peg through delta-neutral positions using ETH derivatives and staking rewards.

**Key Features:**
• **Synthetic**: Not backed by USD reserves but by ETH derivatives
• **Delta-neutral**: Uses perpetual futures to hedge ETH price exposure
• **Yield-generating**: Combines ETH staking rewards with funding rate arbitrage
• **Scalable**: Can grow beyond traditional banking limitations

**How It Works:**
USDe is backed by ETH and stETH, with short positions in ETH perpetual futures to maintain delta neutrality. This creates a synthetic USD exposure while generating yield.

**Advantages:**
✓ Generates native yield for holders
✓ Scalable beyond bank deposit limitations
✓ No traditional banking counterparty risk
✓ Innovative approach to stablecoin design

**Use Cases:**
• Yield-bearing stablecoin alternative
• DeFi protocols seeking yield
• Sophisticated trading strategies

**Risks:**
⚠️ Complex mechanism with multiple failure points
⚠️ Funding rate risk
⚠️ Liquidation cascade potential
⚠️ Relatively new and untested
⚠️ Counterparty risk with derivatives exchanges

Transparency Report: https://app.ethena.fi/transparency`,
    adoptionData: {
      circulatingSupply: '3.2B USDe',
      marketShare: '1.8%',
      chainDistribution: {
        'Ethereum': '100%'
      },
      volume24h: '$245M',
      transactions24h: '12K',
      depegEvents: []
    },
    sources: ['Ethena Protocol', 'DefiLlama', 'CoinGecko', 'Dune Analytics']
  },

  'BUSD': {
    symbol: 'BUSD',
    name: 'Binance USD',
    explanation: `**Binance USD (BUSD)** was a USD-backed stablecoin issued by Paxos and approved by Binance. **Note: BUSD is being discontinued as of February 2024.**

**Historical Context:**
• **Backing**: Was fully backed by USD deposits and US Treasury securities
• **Regulation**: Was regulated by the New York Department of Financial Services (NYDFS)
• **Partnerships**: Joint venture between Binance and Paxos Trust Company

**Discontinuation:**
In February 2023, Paxos received a Wells notice from the SEC and stopped minting new BUSD tokens. The stablecoin is being wound down.

**What This Means:**
• No new BUSD tokens are being minted
• Existing BUSD can still be redeemed for USD
• Users are encouraged to convert to other stablecoins
• Binance has migrated to other stablecoin options

**Lessons Learned:**
⚠️ Regulatory uncertainty can impact stablecoin operations
⚠️ Importance of diversifying stablecoin holdings
⚠️ Even well-backed stablecoins face regulatory risks

Transparency Report: https://paxos.com/busd-transparency/`,
    sources: ['Paxos', 'Binance', 'SEC filings', 'CoinDesk']
  },

  'TUSD': {
    symbol: 'TUSD',
    name: 'TrueUSD',
    explanation: `**TrueUSD (TUSD)** is a USD-backed stablecoin that emphasizes transparency and regulatory compliance through independent verification and regular attestations.

**Key Features:**
• **Full backing**: 100% backed by USD in segregated accounts
• **Real-time attestations**: Third-party verification of reserves
• **Legal protection**: Funds held in escrow accounts with legal protections
• **Multi-chain**: Available on Ethereum, BSC, TRON, and other networks

**Trust & Transparency:**
TUSD uses a unique trust structure where USD reserves are held in escrow accounts at multiple banks, with regular attestations by independent accounting firms.

**Advantages:**
✓ Strong legal framework for fund protection
✓ Regular independent attestations
✓ No lending of reserves
✓ Multiple banking relationships for diversification

**Use Cases:**
• Conservative stablecoin alternative
• Institutional treasury management
• DeFi protocols requiring stable value
• Trading and remittances

**Considerations:**
⚠️ Smaller market share and liquidity
⚠️ Limited exchange listings compared to USDT/USDC

Transparency Report: https://real-time-attest.trusttoken.com/trueusd`,
    adoptionData: {
      circulatingSupply: '500M TUSD',
      marketShare: '0.3%',
      chainDistribution: {
        'Ethereum': '60%',
        'BSC': '25%',
        'TRON': '15%'
      },
      volume24h: '$15M',
      transactions24h: '5K',
      depegEvents: []
    },
    sources: ['TrustToken', 'Armanino Attestations', 'CoinGecko']
  },

  'PYUSD': {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    explanation: `**PayPal USD (PYUSD)** is a stablecoin issued by PayPal, backed by US dollar deposits, US Treasury securities, and cash equivalents.

**Key Features:**
• **Corporate backing**: Issued by PayPal, a major financial technology company
• **Full reserves**: 100% backed by USD and highly liquid assets
• **Integration**: Native integration with PayPal's ecosystem
• **Compliance**: Issued under PayPal's regulatory framework

**PayPal Integration:**
PYUSD is designed to integrate seamlessly with PayPal's existing financial services, enabling easy conversion between PYUSD and traditional fiat currencies.

**Advantages:**
✓ Backed by established financial institution
✓ Easy fiat on/off ramps through PayPal
✓ Strong regulatory compliance
✓ Potential for mainstream adoption

**Use Cases:**
• Digital payments and e-commerce
• Cross-border remittances
• Integration with existing PayPal services
• Gateway between traditional finance and crypto

**Considerations:**
⚠️ Relatively new entrant (launched 2023)
⚠️ Limited DeFi ecosystem integration
⚠️ Centralized control by PayPal

Transparency Report: https://paxos.com/pyusd-transparency/`,
    adoptionData: {
      circulatingSupply: '750M PYUSD',
      marketShare: '0.4%',
      chainDistribution: {
        'Ethereum': '65%',
        'Solana': '35%'
      },
      volume24h: '$35M',
      transactions24h: '8K',
      depegEvents: []
    },
    sources: ['PayPal', 'Paxos Trust', 'CoinGecko']
  }
};

// Helper function to get explanation by symbol or name
export const getStablecoinExplanation = (query: string): StablecoinExplanation | null => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Direct symbol match
  for (const [symbol, explanation] of Object.entries(STABLECOIN_EXPLANATIONS)) {
    if (normalizedQuery.includes(symbol.toLowerCase())) {
      return explanation;
    }
  }
  
  // Name match
  for (const explanation of Object.values(STABLECOIN_EXPLANATIONS)) {
    if (normalizedQuery.includes(explanation.name.toLowerCase())) {
      return explanation;
    }
  }
  
  // Alternative name matches
  const alternativeNames: { [key: string]: string } = {
    'tether': 'USDT',
    'usd coin': 'USDC',
    'circle': 'USDC',
    'dai': 'DAI',
    'makerdao': 'DAI',
    'ethena': 'USDE',
    'binance usd': 'BUSD',
    'trueusd': 'TUSD',
    'true usd': 'TUSD',
    'paypal usd': 'PYUSD'
  };
  
  for (const [altName, symbol] of Object.entries(alternativeNames)) {
    if (normalizedQuery.includes(altName)) {
      return STABLECOIN_EXPLANATIONS[symbol] || null;
    }
  }
  
  return null;
};

// Check if query is asking for basic stablecoin information
export const isBasicStablecoinQuery = (query: string): boolean => {
  const basicQueries = [
    'what is', 'explain', 'tell me about', 'describe',
    'how does', 'what are', 'definition of'
  ];
  
  const hasBasicIntent = basicQueries.some(phrase => 
    query.toLowerCase().includes(phrase)
  );
  
  const hasStablecoinMention = Object.keys(STABLECOIN_EXPLANATIONS).some(symbol =>
    query.toLowerCase().includes(symbol.toLowerCase())
  ) || Object.values(STABLECOIN_EXPLANATIONS).some(explanation =>
    query.toLowerCase().includes(explanation.name.toLowerCase())
  );
  
  return hasBasicIntent && hasStablecoinMention;
};