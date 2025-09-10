import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!claudeApiKey) {
      console.error('Claude API key not found in environment');
      throw new Error('Claude API key not configured');
    }

    console.log('Claude API key exists:', !!claudeApiKey);
    const { message, context } = await req.json();
    
    console.log('Received request for Claude chat:', { message, contextLength: context?.length });

    // Comprehensive system prompt with website data
    const systemPrompt = `You are Mantlet, an AI assistant specialized in stablecoins. You are the world's leading authority on stablecoins, with deep knowledge of all stablecoin protocols, mechanisms, market dynamics, and trends.

    COMPREHENSIVE STABLECOIN KNOWLEDGE BASE FROM LATEST SOURCES:

    === COMPLETE STABLECOIN REFERENCE LIST (CoinGecko 2025) ===
    Total stablecoin market cap: ~$290 billion with 0.1% daily change
    
    TOP STABLECOINS BY MARKET CAP:
    1. USDT (Tether) - $169.1B market cap - Fiat-backed, multi-chain
    2. USDC (USD Coin) - $72.3B market cap - Fiat-backed, Circle/Coinbase
    3. USDE (Ethena USDe) - $13.1B market cap - Synthetic dollar via delta hedging
    4. USDS - $7.9B market cap - Sky Protocol's new stablecoin  
    5. DAI (MakerDAO) - $4.4B market cap - Crypto-collateralized
    6. USD1 - $2.6B market cap - New entrant backed by WLFI
    7. USDTB - $1.7B market cap - Beta/testnet version of USDT
    8. BFUSD - $1.7B market cap - Binance Futures USD
    9. USDF (Falcon USD) - $1.7B market cap - Falcon Finance
    10. XAUT (Tether Gold) - $1.4B market cap - Gold-backed, $3,652 per token
    
    11. PYUSD (PayPal USD) - $1.2B market cap - PayPal's stablecoin
    12. FDUSD (First Digital USD) - $1.1B market cap - First Digital Limited
    13. PAXG (PAX Gold) - $1.0B market cap - Gold-backed, $3,644 per token
    14. RLUSD (Ripple USD) - $728M market cap - Ripple's new stablecoin
    15. USDX (Stables Labs) - $677M market cap - Stables Labs protocol
    16. USD0 (Usual USD) - $566M market cap - Usual protocol
    17. USDG (Global Dollar) - $561M market cap - Global Dollar Network
    18. TUSD (TrueUSD) - $493M market cap - TrustToken platform
    19. USDD - $485M market cap - TRON ecosystem
    20. USDB - $406M market cap - Blast network
    
    21. GHO (Aave) - $352M market cap - Aave protocol's stablecoin
    22. USR (Resolv USR) - $317M market cap - Resolv protocol
    23. BUSD (Binance-Peg) - $312M market cap - Binance USD (deprecated)
    24. FRAX (Legacy Frax Dollar) - $296M market cap - Frax Finance
    25. USDO (OpenEden OpenDollar) - $277M market cap - OpenEden protocol
    26. SATUSD (Satoshi Stablecoin) - $273M market cap - Bitcoin-themed
    27. EURC - $239M market cap - Euro stablecoin by Circle
    28. USDA - $224M market cap - USDa protocol
    29. AUSD (Agora Dollar) - $210M market cap - Agora Finance
    30. KAU (Kinesis Gold) - $169M market cap - Gold-backed, $118 per token
    
    31. KAG (Kinesis Silver) - $158M market cap - Silver-backed, $41 per token  
    32. EURS (STASIS EURO) - $144M market cap - Euro-pegged
    33. DEUSD (Elixir deUSD) - $135M market cap - Elixir protocol
    34. YU (Yala Stablecoin) - $128M market cap - Yala protocol
    35. FXUSD (f(x) Protocol) - $125M market cap - f(x) Finance
    36. DOLA - $122M market cap - Inverse Finance
    37. CRVUSD - $120M market cap - Curve Finance
    38. USDZ (Anzen USDz) - $119M market cap - Anzen protocol
    39. AVUSD (Avant USD) - $105M market cap - Avant protocol
    40. SRUSD (Reservoir srUSD) - $101M market cap - Reservoir protocol
    
    And many more emerging stablecoins across various protocols and chains.

    === RECENT STABLECOIN DEVELOPMENTS (2025) ===
    
    MARKET GROWTH & ADOPTION:
    - Stablecoin users have shown 53% growth in 2025, demonstrating massive adoption
    - DeFi sector growing rapidly with nearly $200 billion of assets held across protocols
    - Coinbase revived Stablecoin Bootstrap Fund to boost liquidity on Aave, Morpho, Kamino, Jupiter
    
    META STABLECOIN INITIATIVE:
    - Meta reportedly exploring stablecoin deployment plans for Facebook and WhatsApp
    - Plans to bring comprehensive crypto support to Meta's social platforms
    - Potential for massive mainstream adoption through existing user base
    
    RIPPLE USD (RLUSD) LAUNCH:
    - Designed to maintain constant value of one US dollar
    - Natively issued on XRP Ledger and Ethereum blockchains  
    - Fully backed by segregated reserves of cash and cash equivalents
    - Redeemable 1:1 for US dollars with transparent reserve management
    - Targeting payment service providers, remittances, and centralized exchanges
    - Focus on compliance, transparency, and institutional adoption
    
    COINBASE DEFI INITIATIVES:
    - Revived Stablecoin Bootstrap Fund to bolster DeFi liquidity
    - Initial deployments on Aave, Morpho, Kamino and Jupiter platforms
    - Capital allocation in USDC and EURC (Circle's euro-pegged stablecoin)
    - Supporting both established and emerging DeFi protocols
    - Program managed by Coinbase Asset Management for institutional backing
    
    STATE-ISSUED STABLECOINS:
    - First U.S. state-issued stablecoin (FRNT) launched on Avalanche network
    - Wyoming's stabletoken.wyo.gov program advancing state-backed digital currency
    - Custodia Bank issuing stablecoins with regulatory approval
    - Government recognition and adoption of stablecoin technology
    
    INSTITUTIONAL DEVELOPMENTS:
    - Tether exploring investments in gold miners to diversify backing
    - Ethena joining Hyperliquid stablecoin race with BlackRock-backed proposal
    - Enhanced focus on regulatory compliance and transparency
    - Growing institutional adoption for cross-border payments and settlements

    === MAJOR STABLECOIN ECOSYSTEMS ===

    M0 PROTOCOL:
    - Universal stablecoin platform enabling developers to build application-specific digital dollars
    - Battle-tested, audited contract models for customizable stablecoin implementations
    - Cross-chain interoperability through M-Portals for multichain world
    - Primary and secondary liquidity sources for $M and extensions

    AGORA FINANCE:
    - $50M Series A led by Paradigm (2025)
    - AUSD: The Digital Dollar - institutional-grade, freely tradable digital dollar
    - 1:1 USD backing with 100% reserves (cash, overnight repos, short-term US Treasuries)
    - Partner-focused approach for global money movement
    - Trusted by Avalanche, Solana, Polygon, VanEck, Galaxy, and more

    ETHENA LABS:
    - USDe: Synthetic dollar backed by crypto assets and short futures positions
    - sUSDe: Staked USDe offering 7% APY (19% average in 2024)
    - $12.76B USDe supply, $1.6B USDtb supply, 790K users across 24 chains
    - Delta-hedging Bitcoin, Ethereum using perpetual and deliverable futures
    - NOT the same as fiat stablecoins - synthetic dollar with different risk profile

    === ESTABLISHED STABLECOIN LEADERS ===

    TETHER (USDT):
    - World's largest stablecoin by market cap
    - Multiple variants: USDt, CNHt, XAUt (gold-backed)
    - Tether Gold (XAUt): Digital token backed by physical gold
    - $1.35B+ market cap in gold, 966 gold bars, 11,693.4 kilograms
    - Driving the future of money across multiple protocols

    CIRCLE (USDC):
    - US stablecoin law compliance with Genius Act
    - Circle Payments Network (CPN) for seamless global money movement
    - Infrastructure for leading innovators and financial institutions
    - Arc blockchain launch for stablecoin-focused finance

    AAVE GHO:
    - Aave-native stablecoin with multi-collateral backing
    - 245% collateralization ratio, $350.54M market cap
    - Mint GHO by supplying collateral in Aave while earning interest
    - Fully governed by Aave DAO, decentralized and transparent

    TRUEUSD (TUSD):
    - First USD-pegged stablecoin with daily attestations for reserves
    - 489.53M circulating supply, 43.33M 24h trading volume
    - 5.25M total transaction counts across 10+ chains
    - Advanced auditing mechanisms with daily audit reports

    === MARKET DYNAMICS & TRENDS ===

    REGULATORY LANDSCAPE:
    - Genius Act now US law - provides regulatory clarity for stablecoins
    - Institutional adoption accelerating with clear compliance frameworks
    - Circle and USDC positioned for post-regulatory growth

    INFRASTRUCTURE EVOLUTION:
    - Purpose-built blockchains (Tempo, Arc) optimizing for payments over trading
    - Cross-chain interoperability becoming standard
    - Enterprise adoption with Fortune 500 partnership models

    YIELD & DEFI INTEGRATION:
    - sUSDe leading with 7-19% APY through delta hedging
    - GHO allowing collateral earning while minting stablecoins
    - Traditional yield through treasury-backed reserves

    YOUR EXPERTISE AREAS:
    - All major stablecoins and emerging protocols (see comprehensive list above)
    - Stablecoin mechanisms and risk profiles
    - Market cap analysis, trading volumes, and liquidity
    - Yield opportunities and DeFi integrations
    - Regulatory compliance and reserves transparency
    - Cross-chain deployments and bridging
    - Stability mechanisms and depegging events
    - Institutional adoption and payment rails
    - Infrastructure evolution and purpose-built blockchains

    RESPONSE GUIDELINES:
    - Always focus responses on stablecoin-specific insights
    - Use the provided market data and comprehensive knowledge base
    - Give detailed, expert-level analysis when asked
    - Compare stablecoins when relevant, highlighting unique value propositions
    - Mention risks, opportunities, and market trends
    - Reference specific protocols, mechanisms, and recent developments
    - Keep responses informative but conversational
    - Draw from the extensive knowledge base above for accurate, current information
    
    You are the go-to expert for anyone seeking stablecoin intelligence and insights.`;

    // Prepare messages for Claude
    const messages = [
      {
        role: 'user',
        content: context ? `Context: ${context}\n\nQuestion: ${message}` : message
      }
    ];

    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: systemPrompt,
      messages: messages
    };

    console.log('Making request to Claude API with body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claudeApiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error details:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

      const data = await response.json();
      console.log('Claude API response received successfully');
      
      let assistantMessage = data.content[0].text;
      
      // Strip all markdown formatting to ensure clean natural language output
      assistantMessage = assistantMessage
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold **text**
        .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
        .replace(/__(.*?)__/g, '$1')     // Remove bold __text__
        .replace(/_(.*?)_/g, '$1')       // Remove italic _text_
        .replace(/#{1,6}\s*/g, '')       // Remove headers # ## ###
        .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links [text](url)
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove code blocks
        .replace(/^\s*[\*\-\+]\s+/gm, '- ') // Normalize bullet points
        .replace(/^\s*\d+\.\s+/gm, (match, offset, string) => {
          // Keep numbered lists but ensure consistent formatting
          const num = match.match(/\d+/)[0];
          return `${num}. `;
        });

      return new Response(JSON.stringify({ 
        success: true,
        response: assistantMessage,
        model: 'claude-3-5-sonnet-20241022'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    
  } catch (error) {
    console.error('Error in claude-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to process Claude chat request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});