import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const moralisApiKey = Deno.env.get('MORALIS_API_KEY');

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
    if (!moralisApiKey) {
      throw new Error('Moralis API key not configured');
    }

    const { endpoint, params, isSolana } = await req.json();
    
    console.log('Received Moralis API request:', { endpoint, params, isSolana });

    // Use different base URLs for Solana vs EVM
    const baseUrl = isSolana 
      ? 'https://solana-gateway.moralis.io' 
      : 'https://deep-index.moralis.io/api/v2.2';
    
    let url = `${baseUrl}${endpoint}`;
    
    // Add query parameters if provided
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    console.log('Making request to Moralis API:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': moralisApiKey,
        'accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Moralis API error:', response.status, errorText);
      throw new Error(`Moralis API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Moralis API response received successfully');

    return new Response(JSON.stringify({
      success: true,
      data: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in moralis-api function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      details: 'Failed to process Moralis API request'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});