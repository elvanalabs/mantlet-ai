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
      throw new Error('Claude API key not configured');
    }

    const { message, context } = await req.json();
    
    console.log('Received request for Claude chat:', { message, contextLength: context?.length });

    // Prepare the system prompt for Web3 research
    const systemPrompt = `You are a specialized Web3 research assistant. You help users understand blockchain projects, DeFi protocols, token economics, market trends, and cryptocurrency analysis. 

    Your expertise includes:
    - Token analysis and price movements
    - DeFi protocol mechanics and risks
    - Blockchain technology explanations
    - Market trends and technical analysis
    - Smart contract security considerations
    - Yield farming and staking strategies

    Always provide accurate, well-researched responses. If you don't have current data, clearly state this and provide general guidance. Be helpful but also highlight risks in the volatile crypto space.`;

    // Prepare messages for Claude
    const messages = [
      {
        role: 'user',
        content: context ? `Context from previous research: ${context}\n\nUser question: ${message}` : message
      }
    ];

    console.log('Making request to Claude API...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${claudeApiKey}`,
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250514',
        max_tokens: 2000,
        temperature: 0.7,
        system: systemPrompt,
        messages: messages
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Claude API response received successfully');
    
    const assistantMessage = data.content[0].text;

    return new Response(JSON.stringify({ 
      response: assistantMessage,
      model: 'claude-opus-4-20250514'
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