import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, urls } = await req.json();

    if (action === 'populate') {
      const results = [];
      
      for (const url of urls) {
        try {
          console.log(`Fetching content from: ${url}`);
          
          // Fetch the webpage content
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
          });
          
          if (!response.ok) {
            console.error(`Failed to fetch ${url}: ${response.status}`);
            continue;
          }
          
          const html = await response.text();
          
          // Extract text content from HTML (basic extraction)
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          // Extract title from HTML
          const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1].trim() : new URL(url).hostname;
          
          // Generate summary (first 500 characters)
          const summary = textContent.length > 500 
            ? textContent.substring(0, 500) + '...' 
            : textContent;
          
          // Determine tags based on content
          const tags = [];
          const lowerContent = textContent.toLowerCase();
          if (lowerContent.includes('stablecoin')) tags.push('stablecoin');
          if (lowerContent.includes('usdc') || lowerContent.includes('usdt')) tags.push('major-stablecoins');
          if (lowerContent.includes('defi')) tags.push('defi');
          if (lowerContent.includes('regulation')) tags.push('regulation');
          if (lowerContent.includes('blockchain')) tags.push('blockchain');
          if (lowerContent.includes('meta') || lowerContent.includes('facebook')) tags.push('meta');
          if (lowerContent.includes('ripple')) tags.push('ripple');
          if (lowerContent.includes('coinbase')) tags.push('coinbase');
          
          // Insert or update in knowledge base
          const { data, error } = await supabase
            .from('knowledge_base')
            .upsert({
              url,
              title,
              content: textContent,
              summary,
              tags,
              source_type: 'website',
              last_updated: new Date().toISOString()
            }, {
              onConflict: 'url'
            });
          
          if (error) {
            console.error(`Error saving ${url}:`, error);
            results.push({ url, success: false, error: error.message });
          } else {
            console.log(`Successfully saved content from ${url}`);
            results.push({ url, success: true });
          }
          
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
          results.push({ url, success: false, error: error.message });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: `Processed ${results.length} URLs`,
        results 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (action === 'search') {
      const { query } = await req.json();
      
      // Search knowledge base using full-text search
      const { data, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('content', query)
        .eq('is_active', true)
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        data 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Invalid action' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in knowledge-base-manager function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});