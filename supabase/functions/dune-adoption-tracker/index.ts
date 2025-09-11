import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const duneApiKey = Deno.env.get('DUNE_API_KEY');

if (!duneApiKey) {
  console.error('DUNE_API_KEY is not configured');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stablecoin } = await req.json();
    console.log('Fetching adoption metrics for:', stablecoin);

    if (!duneApiKey) {
      throw new Error('Dune API key not configured');
    }

    // Mock data for now - you'll need to replace this with actual Dune API queries
    // Each stablecoin would have different Dune query IDs
    const mockAdoptionData = {
      stablecoin: stablecoin.toUpperCase(),
      totalCirculatingSupply: getRandomSupply(stablecoin),
      marketSharePercent: getRandomMarketShare(stablecoin),
      chainDistribution: getChainDistribution(stablecoin),
      transactionVolume24h: getRandomVolume(),
      growthDecline30d: getRandomGrowth()
    };

    // TODO: Replace with actual Dune API calls
    // Example Dune API call structure:
    /*
    const duneResponse = await fetch(`https://api.dune.com/api/v1/query/${queryId}/execute`, {
      method: 'POST',
      headers: {
        'X-Dune-API-Key': duneApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_parameters: {
          stablecoin_symbol: stablecoin.toUpperCase()
        }
      }),
    });
    */

    return new Response(JSON.stringify({ adoptionData: mockAdoptionData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in dune-adoption-tracker function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      adoptionData: null 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Helper functions to generate realistic mock data
function getRandomSupply(stablecoin: string): string {
  const supplies: Record<string, string> = {
    'USDT': '120000000000',
    'USDC': '80000000000', 
    'DAI': '5000000000',
    'BUSD': '15000000000',
    'FRAX': '1200000000',
  };
  
  return supplies[stablecoin.toUpperCase()] || '1000000000';
}

function getRandomMarketShare(stablecoin: string): string {
  const shares: Record<string, string> = {
    'USDT': '68.2',
    'USDC': '21.4',
    'DAI': '3.8',
    'BUSD': '4.2',
    'FRAX': '0.9',
  };
  
  return shares[stablecoin.toUpperCase()] || '0.5';
}

function getChainDistribution(stablecoin: string) {
  const distributions: Record<string, any> = {
    'USDT': [
      { chain: 'Ethereum', percentage: '48.2', amount: '57840000000' },
      { chain: 'Tron', percentage: '41.6', amount: '49920000000' },
      { chain: 'BSC', percentage: '6.8', amount: '8160000000' },
      { chain: 'Polygon', percentage: '2.1', amount: '2520000000' },
      { chain: 'Avalanche', percentage: '1.3', amount: '1560000000' }
    ],
    'USDC': [
      { chain: 'Ethereum', percentage: '72.5', amount: '58000000000' },
      { chain: 'Polygon', percentage: '12.3', amount: '9840000000' },
      { chain: 'Arbitrum', percentage: '8.1', amount: '6480000000' },
      { chain: 'Optimism', percentage: '4.2', amount: '3360000000' },
      { chain: 'Avalanche', percentage: '2.9', amount: '2320000000' }
    ],
    'DAI': [
      { chain: 'Ethereum', percentage: '89.4', amount: '4470000000' },
      { chain: 'Polygon', percentage: '6.8', amount: '340000000' },
      { chain: 'Arbitrum', percentage: '2.1', amount: '105000000' },
      { chain: 'Optimism', percentage: '1.2', amount: '60000000' },
      { chain: 'Gnosis', percentage: '0.5', amount: '25000000' }
    ]
  };
  
  return distributions[stablecoin.toUpperCase()] || [
    { chain: 'Ethereum', percentage: '85.0', amount: '850000000' },
    { chain: 'Polygon', percentage: '10.0', amount: '100000000' },
    { chain: 'Arbitrum', percentage: '5.0', amount: '50000000' }
  ];
}

function getRandomVolume(): string {
  const min = 50000000;
  const max = 15000000000;
  return (Math.random() * (max - min) + min).toString();
}

function getRandomGrowth() {
  const percentage = (Math.random() * 20 + 1).toFixed(1);
  const direction = Math.random() > 0.6 ? 'up' : 'down';
  
  return {
    percentage,
    direction: direction as 'up' | 'down'
  };
}