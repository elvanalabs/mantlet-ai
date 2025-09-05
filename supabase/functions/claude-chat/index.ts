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

    CRITICAL RESPONSE GUIDELINES:
    - ONLY provide information that directly answers the user's specific question
    - DO NOT add extra content, background information, or unsolicited details
    - Stay strictly focused on what was asked
    - If the user asks for price, give price data only
    - If they ask for TVL, give TVL data only
    - Do not provide warnings, disclaimers, or additional context unless specifically requested

    FORMATTING REQUIREMENTS - NO MARKDOWN EVER:
    - NEVER use **bold text** or any asterisk formatting
    - NEVER use markdown syntax like **, __, [], (), or #
    - Use CAPITAL LETTERS for important numbers, names, and key information instead of bold
    - Use simple bullet points with - (dash) for lists
    - Use plain text formatting only
    - Structure data with clear line breaks and spacing
    - Use headers like "PRICE DATA:" or "TVL ANALYSIS:" in CAPITAL LETTERS
    - Use natural language emphasis like "IMPORTANT:" or "KEY POINT:"
    - Format numbers clearly: $1,234.56 not **$1,234.56**
    - Use simple dashes - for bullet points, not • or *

    RESPONSE STYLE:
    - Be direct and concise
    - Present data in an organized, easy-to-scan format using plain text only
    - Use natural language but keep it focused
    - No fluff or unnecessary explanations
    - Answer only what was asked, nothing more
    - Structure with clear sections using CAPITAL LETTER headers

    Always provide accurate, well-researched responses based on the provided data context. Remember: ABSOLUTELY NO MARKDOWN FORMATTING EVER.`;

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