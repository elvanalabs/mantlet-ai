export interface StablecoinExplanation {
  symbol: string;
  name: string;
  explanation: string;
  associatedInstitutions?: {
    issuer: string;
    custodian?: string;
    auditor?: string;
    partners?: string[];
    exchanges?: string[];
    institutionalUsers?: string[];
  };
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
    explanation: `**Overview:**
Tether (USDT) is the world's largest stablecoin by market capitalization and trading volume, designed to maintain a 1:1 peg with the US Dollar. Launched in 2014, USDT has become the most widely used stablecoin across major exchanges and DeFi protocols globally.

**Backing Mechanism:**
• **100% Reserve Backing**: All USDT tokens backed by Tether's reserves including USD, treasury bills, and commercial paper
• **Daily Circulation Updates**: Real-time information on tokens in circulation published daily for full visibility
• **Asset-Liability Management**: Tether Issuer's total assets exceed liabilities at all times
• **Multi-Currency Support**: Backing extends to EUR₮, CNH₮, MXN₮, and XAU₮ with respective fiat/commodity reserves
• **Reserve Composition**: Mix of cash deposits, short-term US Treasury securities, and commercial paper holdings
• **Independent Attestations**: Regular third-party verification of reserve holdings and circulation metrics

**Use Cases:**
• Trading pairs on major exchanges worldwide
• Cross-border payments and remittances
• DeFi lending and borrowing protocols
• Corporate treasury management
• Arbitrage and trading strategies
• Store of value during crypto market volatility

**Associated Institutions:**
Issuer: Tether Limited | Auditor: Big Four accounting firm (in transition 2024-2025) | Partners: Bitfinex, Cantor Fitzgerald | Major Exchanges: Binance, Coinbase, Kraken, Huobi, OKX`,
    associatedInstitutions: {
      issuer: 'Tether Limited',
      auditor: 'Big Four accounting firm (in transition 2024-2025)',
      partners: ['Bitfinex', 'Cantor Fitzgerald'],
      exchanges: ['Binance', 'Coinbase', 'Kraken', 'Huobi', 'OKX', 'Bitfinex'],
      institutionalUsers: ['Major crypto exchanges', 'Trading firms', 'DeFi protocols', 'Payment processors']
    },
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
    sources: ['Tether', 'CoinGecko', 'DeFiLlama', 'Messari']
  },

  'USDC': {
    symbol: 'USDC',
    name: 'USD Coin',
    explanation: `**Overview:**
USD Coin (USDC) is a fully regulated, US dollar-backed stablecoin issued by Circle, known for its regulatory compliance and institutional adoption. USDC operates under strict regulatory oversight with monthly reserve attestations and established financial institution backing.

**Backing Mechanism:**
• **Circle Reserve Fund**: 100% backed through SEC-registered government money market fund managed by BlackRock
• **Treasury Securities**: Holdings include short-dated US Treasuries and overnight repurchase agreements with US Treasury
• **Cash Reserves**: US dollar cash deposits held at regulated reserve banks for immediate liquidity
• **1:1 Redeemability**: Always redeemable 1:1 for US dollars with full reserve backing guarantee
• **Monthly Attestations**: Independent verification by Grant Thornton LLP of all reserve holdings and circulation
• **Real-Time Transparency**: Daily updates on reserves composition, issuance, and redemption data publicly available

**Use Cases:**
• DeFi protocols and yield farming
• Institutional treasury management
• Cross-border payments and remittances
• Trading and arbitrage strategies
• Corporate crypto adoption
• Payment rails for fintech companies

**Associated Institutions:**
Issuer: Circle Internet Financial | Custodian: BlackRock (Circle Reserve Fund) | Auditor: Grant Thornton LLP | Partners: Coinbase, BlackRock, Goldman Sachs | Major Exchanges: Coinbase, Binance, Kraken, FTX, Gemini`,
    associatedInstitutions: {
      issuer: 'Circle Internet Financial',
      custodian: 'BlackRock (Circle Reserve Fund)',
      auditor: 'Grant Thornton LLP',
      partners: ['Coinbase', 'BlackRock', 'Goldman Sachs', 'Bank of New York Mellon'],
      exchanges: ['Coinbase', 'Binance', 'Kraken', 'FTX', 'Gemini', 'Bitstamp'],
      institutionalUsers: ['Tesla', 'MicroStrategy', 'Square', 'Major banks', 'Institutional investors', 'Corporate treasuries']
    },
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
    sources: ['Circle', 'Centre.io', 'CoinGecko', 'DeFiLlama']
  },

  'DAI': {
    symbol: 'DAI',
    name: 'Dai',
    explanation: `**Overview:**
Dai (DAI) is a decentralized stablecoin created by MakerDAO, backed by over-collateralized cryptocurrency assets rather than traditional fiat reserves. DAI operates through a truly decentralized architecture with no single entity controlling issuance, making it censorship-resistant and transparent.

**Backing Mechanism:**
• **Over-Collateralization**: Backed by 150%+ crypto collateral including ETH, WBTC, USDC deposited in Maker Vaults
• **Automatic Liquidation**: Smart contract liquidations trigger when collateral ratios fall below minimum thresholds
• **Stability Pool**: Community-funded pool that absorbs liquidated collateral to maintain DAI stability and backing
• **Multiple Collateral Types**: Diversified backing through various approved crypto assets reducing single-point risk
• **Debt Ceiling Management**: Protocol-controlled limits on DAI generation from each collateral type for risk management
• **Emergency Shutdown**: Global settlement mechanism ensures all DAI holders can redeem proportional collateral value

**Use Cases:**
• DeFi lending and borrowing protocols
• Yield farming and liquidity mining
• Hedge against crypto market volatility
• Decentralized trading pairs and AMMs
• Collateral for other DeFi protocols
• Store of value in decentralized ecosystem

**Associated Institutions:**
Issuer: MakerDAO (Decentralized) | Partners: Compound, Aave, Uniswap, Curve, Yearn Finance | Major Exchanges: Coinbase, Binance, Kraken, Uniswap, SushiSwap | Governance: MKR Token Holders`,
    associatedInstitutions: {
      issuer: 'MakerDAO (Decentralized)',
      partners: ['Compound', 'Aave', 'Uniswap', 'Curve', 'Yearn Finance'],
      exchanges: ['Coinbase', 'Binance', 'Kraken', 'Uniswap', 'SushiSwap'],
      institutionalUsers: ['DeFi protocols', 'Institutional DeFi users', 'Crypto hedge funds', 'Arbitrage traders']
    },
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
    explanation: `**Overview:**
Ethena USDe (USDe) is a synthetic dollar protocol that maintains its peg through delta-neutral positions using ETH derivatives and staking rewards. Unlike traditional stablecoins, USDe generates native yield while maintaining stability through innovative derivatives strategies.

**Backing Mechanism:**
• **Synthetic USD Exposure**: Not backed by USD reserves but by ETH derivatives creating synthetic dollar exposure
• **Delta-Neutral Strategy**: Uses perpetual futures to hedge ETH price exposure while maintaining stability
• **ETH Staking Rewards**: Combines ETH staking rewards with funding rate arbitrage for yield generation
• **Collateral Composition**: Backed by ETH and stETH with corresponding short positions in ETH perpetual futures
• **Scalable Design**: Can grow beyond traditional banking limitations without reserve constraints
• **Risk Management**: Multiple exchange partnerships for custody and risk distribution

**Use Cases:**
• Yield-bearing stablecoin alternative for DeFi
• Sophisticated trading and arbitrage strategies
• Liquidity provision in yield-generating protocols
• Treasury management for yield-seeking institutions
• Collateral for DeFi lending platforms
• Cross-chain yield farming strategies

**Associated Institutions:**
Issuer: Ethena Labs | Custodians: Binance, OKX, Bybit, Deribit | Auditor: Chaos Labs | Partners: BlackRock (USDtb), Multiple CEX Partners | Major Exchanges: Binance, OKX, Gate.io, KuCoin`,
    associatedInstitutions: {
      issuer: 'Ethena Labs',
      custodian: 'Multiple exchange partners (Binance, OKX, Bybit, Deribit)',
      auditor: 'Chaos Labs (Edge Proof of Reserves)',
      partners: ['BlackRock (USDtb)', 'Binance', 'OKX', 'Bybit', 'Deribit', 'Chaos Labs'],
      exchanges: ['Binance', 'OKX', 'Gate.io', 'KuCoin', 'Bybit'],
      institutionalUsers: ['DeFi protocols', 'Yield farming platforms', 'Trading firms', 'Institutional DeFi users']
    },
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
• Binance has migrated to other stablecoin options`,
    sources: ['Paxos', 'Binance', 'SEC filings', 'CoinDesk']
  },

  'TUSD': {
    symbol: 'TUSD',
    name: 'TrueUSD',
    explanation: `**TrueUSD (TUSD)** is a USD-backed stablecoin that has undergone significant changes in ownership and management. **Important: TUSD experienced major reserve issues in 2023-2024.**

**Current Status (2024):**
• **New Management**: Now managed by Techteryx with significant involvement from Tron's Justin Sun
• **Reserve Crisis**: Faced $456M reserve shortfall in 2023-2024 when funds were stuck with Aria entities
• **Emergency Funding**: Justin Sun provided emergency funding to maintain operations and redemptions
• **Proof of Reserves**: Now uses Chainlink's proof-of-reserves system for verification
• **Archblock Partnership**: Working with Archblock for enhanced transparency and custody

**Backing Mechanism:**
• **USD Reserves**: Backed by US dollar deposits, though reserve management has been unstable
• **Third-Party Verification**: Uses Chainlink's proof-of-reserves for real-time verification
• **Multi-Chain Support**: Available on Ethereum, BSC, TRON networks
• **Custody Changes**: Moved away from original TrustToken structure

**Risk Considerations:**
⚠️ Major reserve management issues in 2023-2024
⚠️ Dependence on Justin Sun's financial support
⚠️ Regulatory uncertainties around current structure
⚠️ Historical liquidity crises

**Use Cases:**
• TRON ecosystem integration
• Cross-chain transfers
• Trading pairs (with caution)`,
    associatedInstitutions: {
      issuer: 'Techteryx (with Justin Sun involvement)',
      custodian: 'Archblock',
      auditor: 'Chainlink Proof of Reserves',
      partners: ['Tron Network', 'Justin Sun', 'Archblock', 'Chainlink'],
      exchanges: ['Binance', 'HTX (Huobi)', 'Gate.io', 'MEXC'],
      institutionalUsers: ['TRON ecosystem users', 'Cross-chain protocols', 'Asian trading firms']
    },
    adoptionData: {
      circulatingSupply: '500M TUSD',
      marketShare: '0.3%',
      chainDistribution: {
        'TRON': '70%',
        'Ethereum': '20%',
        'BSC': '10%'
      },
      volume24h: '$15M',
      transactions24h: '5K',
      depegEvents: [
        {
          date: '2023-12-15',
          severity: 'Major',
          duration: '30 days',
          cause: 'Reserve shortfall when $456M stuck with Aria entities'
        }
      ]
    },
    sources: ['CoinDesk', 'Techteryx', 'Chainlink', 'Court Filings']
  },

  'PYUSD': {
    symbol: 'PYUSD',
    name: 'PayPal USD',
    explanation: `**Overview:**
PayPal USD (PYUSD) is a stablecoin issued by PayPal, backed by US dollar deposits, US Treasury securities, and cash equivalents. PYUSD represents PayPal's entry into the stablecoin market, leveraging their established financial infrastructure and mainstream user base.

**Backing Mechanism:**
• **Paxos-Issued Stablecoin**: Fully backed USD stablecoin issued by Paxos Trust Company for PayPal ecosystem
• **US Dollar Deposits**: 100% backed by US dollar deposits and highly liquid cash equivalents held in trust
• **Regulatory Compliance**: Issued under PayPal's regulated framework with full compliance oversight
• **1:1 Redeemability**: Direct redemption through PayPal platform ensuring stable 1:1 USD conversion
• **Institutional Custody**: Reserves managed through established financial institution custody services
• **Monthly Attestations**: Regular third-party verification of reserve holdings and token circulation

**Use Cases:**
• Digital payments and e-commerce transactions
• Cross-border remittances and transfers
• Integration with existing PayPal services and Venmo
• Gateway between traditional finance and crypto
• Merchant payments and online commerce
• Peer-to-peer transfers within PayPal ecosystem

**Associated Institutions:**
Issuer: PayPal Holdings Inc. | Custodian: Paxos Trust Company | Auditor: Withum Smith + Brown PC | Partners: Paxos, Venmo, Xoom, Stellar Network | Major Exchanges: Crypto.com, Coinbase, Kraken, Bitstamp`,
    associatedInstitutions: {
      issuer: 'PayPal Holdings Inc.',
      custodian: 'Paxos Trust Company',
      auditor: 'Withum Smith + Brown PC',
      partners: ['Paxos', 'Venmo', 'Xoom', 'Stellar Network (2025)'],
      exchanges: ['Crypto.com', 'Coinbase', 'Kraken', 'Bitstamp'],
      institutionalUsers: ['PayPal merchants', 'E-commerce platforms', 'Payment processors', 'Fintech companies']
    },
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
  },

  'USDP': {
    symbol: 'USDP',
    name: 'Pax Dollar',
    explanation: `**Pax Dollar (USDP)** is a regulated USD-backed stablecoin issued by Paxos Trust Company, emphasizing regulatory compliance and institutional-grade custody.

**Backing Mechanism:**
• **NYDFS Regulated**: Issued under New York Department of Financial Services regulation with strict compliance requirements
• **Segregated USD Deposits**: 100% backed by US dollar deposits held in FDIC-insured bank accounts
• **Monthly Attestations**: Independent third-party examinations conducted by KPMG LLP following AICPA standards
• **Institutional Custody**: Professional-grade custodial services ensuring secure reserve management
• **Real-Time Redemption**: Direct 1:1 redemption available through Paxos platform for authorized users
• **Bankruptcy Remote**: Reserve structure designed to protect token holders in adverse scenarios

**Advantages:**
✓ Strong regulatory framework under NYDFS oversight
✓ Institutional-grade security and compliance
✓ Monthly independent attestations
✓ Professional custody and reserve management

**Use Cases:**
• Institutional treasury management
• Regulated cryptocurrency trading
• Cross-border payments for enterprises
• Compliance-focused DeFi applications`,
    sources: ['Paxos Trust', 'NYDFS', 'KPMG Attestations', 'CoinGecko']
  },

  'GUSD': {
    symbol: 'GUSD',
    name: 'Gemini Dollar',
    explanation: `**Gemini Dollar (GUSD)** is a regulated, Ethereum-based stablecoin issued by Gemini Trust Company. **Note: Gemini faced NYDFS enforcement action in February 2024.**

**Regulatory Status (Updated 2024):**
• **NYDFS Enforcement**: Received consent order from New York Department of Financial Services in February 2024
• **Compliance Issues**: Addressed various regulatory compliance matters under NYDFS oversight
• **Ongoing Operations**: Continues to operate under enhanced regulatory scrutiny

**Backing Mechanism:**
• **NYDFS Regulated**: Issued under New York Department of Financial Services banking regulations
• **FDIC Pass-Through Insurance**: USD deposits eligible for FDIC insurance protection up to applicable limits
• **State Street Custody**: Reserves held at State Street Bank and Trust Company, a qualified custodian
• **Monthly Examinations**: Independent attestations conducted by BPM LLP following attestation standards
• **Smart Contract Transparency**: Ethereum ERC-20 token with publicly auditable smart contract code
• **1:1 USD Backing**: Every GUSD token fully backed by equivalent US dollar deposit

**Advantages:**
✓ Banking-grade regulatory compliance (with enhanced oversight)
✓ FDIC insurance eligibility on reserves
✓ Transparent smart contract architecture
✓ Established institutional custody

**Use Cases:**
• Digital payments and e-commerce
• Institutional cryptocurrency holdings
• DeFi protocol integration
• Cross-border value transfer`,
    associatedInstitutions: {
      issuer: 'Gemini Trust Company',
      custodian: 'State Street Bank and Trust Company',
      auditor: 'BPM LLP',
      partners: ['State Street', 'Samsung Blockchain', 'Flexa Network'],
      exchanges: ['Gemini', 'Coinbase', 'Binance', 'Kraken'],
      institutionalUsers: ['Institutional investors', 'Corporate users', 'DeFi protocols']
    },
    sources: ['Gemini Trust', 'NYDFS', 'BPM Attestations', 'Ethereum']
  },

  'LUSD': {
    symbol: 'LUSD',
    name: 'Liquity USD',
    explanation: `**Liquity USD (LUSD)** is a decentralized, ETH-backed stablecoin created by the Liquity Protocol, offering censorship-resistant borrowing with minimal governance.

**Backing Mechanism:**
• **ETH Over-Collateralization**: Minimum 110% collateral ratio with ETH deposited in individual Troves
• **Algorithmic Stability Pool**: Community-funded liquidation buffer that maintains system solvency
• **Direct Redemption**: LUSD holders can redeem tokens for ETH at face value, creating price floor
• **Automated Liquidations**: Smart contract liquidations when collateral ratios fall below minimum thresholds
• **Recovery Mode**: System-wide protection mechanism during market stress to maintain backing ratios
• **Immutable Protocol**: No upgradeable contracts or governance tokens affecting core stability mechanisms

**Advantages:**
✓ Truly decentralized with no central authority
✓ Censorship resistant operations
✓ Capital efficient (110% minimum ratio)
✓ Predictable liquidation mechanisms

**Use Cases:**
• Decentralized borrowing against ETH
• Leverage trading strategies
• DeFi yield farming and lending
• ETH holders seeking USD exposure`,
    sources: ['Liquity Protocol', 'Ethereum', 'DeFiPulse', 'CoinGecko']
  },

  'FRAX': {
    symbol: 'FRAX',
    name: 'Frax',
    explanation: `**Frax (FRAX)** represents the world's first fractional-algorithmic stablecoin, combining collateral backing with algorithmic mechanisms for stability.

**Backing Mechanism:**
• **Tokenized Treasury Funds**: Backed by institutional-grade tokenized US Treasury funds from BlackRock, Superstate, WisdomTree
• **Bankruptcy-Remote Structure**: Custody through established financial institutions providing institutional protection
• **USTB Holdings**: Significant reserves in Superstate Short Duration US Government Securities Fund
• **BUIDL Integration**: BlackRock USD Institutional Digital Liquidity Fund providing Treasury bill backing
• **Algorithmic Mechanisms**: Dynamic collateral ratio adjustments based on market demand and stability
• **1:1 USD Redeemability**: Full backing enables direct redemption for US dollars through reserve assets

**Advantages:**
✓ Institutional-grade custody and backing
✓ Innovative fractional-algorithmic design
✓ Strong DeFi ecosystem integration
✓ Transparent reserve composition

**Use Cases:**
• DeFi lending and borrowing protocols
• Yield farming and liquidity provision
• Algorithmic trading strategies
• Cross-protocol value transfer`,
    sources: ['Frax Finance', 'BlackRock', 'Superstate', 'DeFiLlama']
  },

  'PAXG': {
    symbol: 'PAXG',
    name: 'Pax Gold',
    explanation: `**Pax Gold (PAXG)** is a gold-backed digital asset where each token represents ownership of one fine troy ounce of allocated London Bullion Market Association (LBMA) certified gold.

**Backing Mechanism:**
• **Physical Gold Reserves**: Each PAXG token backed by one fine troy ounce of allocated gold stored in Brink's vaults
• **LBMA Certified**: Gold meets London Bullion Market Association quality standards for institutional trading
• **Monthly Attestations**: Independent verification by KPMG LLP of physical gold holdings and token supply
• **Allocated Storage**: Specific gold bars allocated to PAXG holders, not pooled or fractional ownership
• **Redeemability Options**: Token holders can redeem for physical gold delivery or cash equivalent
• **Regulated Issuance**: Issued by Paxos Trust under NYDFS oversight with strict custody standards

**Advantages:**
✓ Direct ownership of allocated physical gold
✓ Professional vault storage and security
✓ Regulated and compliant structure
✓ Global accessibility without physical handling

**Use Cases:**
• Digital gold investment and storage
• Portfolio diversification with precious metals
• Hedge against currency devaluation
• Cross-border gold trading`,
    sources: ['Paxos Trust', 'LBMA', 'KPMG Attestations', 'Brink\'s Vaults']
  },

  'EURT': {
    symbol: 'EURT',
    name: 'Tether EUR',
    explanation: `**Tether EUR (EURT)** is a Euro-backed stablecoin issued by Tether Limited, maintaining a 1:1 peg with the Euro currency through full reserve backing.

**Backing Mechanism:**
• **Euro Reserve Backing**: 100% backed by Euro deposits and Euro-denominated cash equivalents held in European banks
• **Daily Circulation Updates**: Real-time EUR₮ circulation data published daily for complete visibility
• **Multi-Jurisdiction Compliance**: Operates under European regulatory frameworks with appropriate licensing
• **Asset-Liability Management**: Total Euro assets exceed EURT token liabilities at all times
• **European Banking**: Reserve funds held in regulated European banking institutions for Euro backing
• **Independent Verification**: Regular third-party attestations of Euro reserves and token circulation

**Use Cases:**
• European cryptocurrency trading pairs
• Euro-denominated cross-border payments
• European DeFi protocol integration
• Digital Euro exposure for global users`,
    sources: ['Tether Limited', 'European Banks', 'CoinGecko']
  },

  'CNHT': {
    symbol: 'CNHT',
    name: 'Tether CNH',
    explanation: `**Tether CNH (CNHT)** is an offshore Chinese Yuan-backed stablecoin issued by Tether Limited, pegged 1:1 to the Chinese Yuan (CNH) traded offshore.

**Backing Mechanism:**
• **CNH Reserve Backing**: 100% backed by offshore Chinese Yuan (CNH) deposits and cash equivalents
• **Daily Circulation Reporting**: CNH₮ circulation metrics updated daily for full reserve visibility
• **Offshore Yuan Focus**: Specifically backed by CNH (offshore Yuan) rather than onshore CNY
• **Asian Banking Infrastructure**: Reserves held through established Asian banking relationships
• **Currency Hedging**: Reserve management accounts for CNH/USD exchange rate fluctuations
• **Regulatory Compliance**: Structured to comply with offshore Chinese Yuan trading regulations

**Use Cases:**
• Chinese Yuan exposure in cryptocurrency markets
• Asia-Pacific trading and remittances
• Cross-border payments involving Chinese Yuan
• Yuan-denominated DeFi applications`,
    sources: ['Tether Limited', 'Asian Banking', 'CNH Markets']
  },

  'MXNT': {
    symbol: 'MXNT',
    name: 'Tether MXN',
    explanation: `**Tether MXN (MXNT)** is a Mexican Peso-backed stablecoin issued by Tether Limited, maintaining a 1:1 peg with the Mexican Peso through full reserve backing.

**Backing Mechanism:**
• **Mexican Peso Reserves**: 100% backed by Mexican Peso (MXN) deposits and peso-denominated cash equivalents
• **Daily Circulation Updates**: MXN₮ token circulation data published daily for complete visibility
• **Mexican Banking**: Reserve funds held in regulated Mexican banking institutions
• **Peso-Denominated Assets**: All backing assets maintained in Mexican Peso currency
• **Regional Compliance**: Structured to comply with Mexican financial regulations and requirements
• **Independent Attestations**: Regular third-party verification of peso reserves and circulation metrics

**Use Cases:**
• Mexican Peso cryptocurrency trading
• Latin American remittances and payments
• Mexico-focused DeFi applications
• Digital peso exposure for international users`,
    sources: ['Tether Limited', 'Mexican Banks', 'Latin American Markets']
  },

  'USDG': {
    symbol: 'USDG',
    name: 'Global Dollar',
    explanation: `**Global Dollar (USDG)** is a USD-backed stablecoin issued by Paxos Digital Singapore, designed to power global stablecoin adoption with regulatory compliance.

**Backing Mechanism:**
• **Singapore Regulated**: Issued by Paxos Digital Singapore under Monetary Authority of Singapore (MAS) oversight
• **USD Reserve Backing**: 100% backed by US dollar deposits and highly liquid USD-denominated assets
• **Monthly Attestations**: Independent examinations by Enrome LLP following Singapore chartered accountant standards
• **Global Infrastructure**: Built for worldwide adoption with multi-jurisdiction compliance framework
• **Institutional Custody**: Professional-grade reserve management and custodial services
• **Real-Time Reserves**: Transparent reporting of reserve composition and token circulation

**Advantages:**
✓ Singapore regulatory framework
✓ Global accessibility and compliance
✓ Monthly independent attestations
✓ Institutional-grade infrastructure

**Use Cases:**
• Global institutional payments
• Cross-border remittances
• International DeFi applications
• Multi-jurisdiction compliance requirements`,
    sources: ['Paxos Digital Singapore', 'MAS', 'Enrome Attestations']
  },

  'USDL': {
    symbol: 'USDL',
    name: 'Lift Dollar',
    explanation: `**Lift Dollar (USDL)** is a yield-bearing USD stablecoin issued by Paxos Issuance MENA, designed to provide US dollar access with built-in yield generation.

**Backing Mechanism:**
• **ADGM Regulated**: Issued by Paxos Issuance MENA under Abu Dhabi Global Market Financial Services Regulatory Authority
• **Yield-Generating Reserves**: Backed by US dollars invested in yield-generating money market funds and Treasury securities
• **Professional Client Focus**: Available to qualified Professional Clients under FSRA regulatory framework
• **Institutional Custody**: Reserve management through established financial institution partnerships
• **Middle East Infrastructure**: Built for Middle East and global markets seeking USD exposure with yield
• **Independent Oversight**: Regular compliance monitoring under ADGM regulatory requirements

**Advantages:**
✓ Built-in yield generation for holders
✓ Middle East regulatory compliance
✓ Professional-grade infrastructure
✓ USD exposure with income potential

**Use Cases:**
• Institutional treasury management with yield
• Middle East cryptocurrency markets
• Professional investor USD exposure
• Yield-seeking stablecoin strategies`,
    sources: ['Paxos Issuance MENA', 'ADGM FSRA', 'Middle East Markets']
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
    'paypal usd': 'PYUSD',
    'pax dollar': 'USDP',
    'paxos dollar': 'USDP',
    'gemini dollar': 'GUSD',
    'liquity usd': 'LUSD',
    'liquity': 'LUSD',
    'frax': 'FRAX',
    'pax gold': 'PAXG',
    'paxos gold': 'PAXG',
    'tether eur': 'EURT',
    'tether cnh': 'CNHT',
    'tether mxn': 'MXNT',
    'global dollar': 'USDG',
    'lift dollar': 'USDL'
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