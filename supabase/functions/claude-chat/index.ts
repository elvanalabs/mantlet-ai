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
    const systemPrompt = `You are a helpful assistant. Answer the user's question directly and concisely.

    CRITICAL RULES:
    - Give SHORT, DIRECT answers only
    - NEVER add extra information not requested
    - If asked about crypto/Web3, use the provided context data
    - If no context is provided, say "I need more specific information to help you"
    - Maximum 2-3 sentences unless specifically asked for more detail
    - NO markdown formatting - plain text only
    
    Answer EXACTLY what was asked, nothing more.`;

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