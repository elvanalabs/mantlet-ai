import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const serpApiKey = Deno.env.get('SERP_API_KEY');

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
    if (!serpApiKey) {
      console.error('SERP API key not found');
      throw new Error('SERP API key not configured');
    }

    const { query, location = 'United States', num = 10, timeFilter = 'mixed' } = await req.json();
    
    console.log('SERP search request:', { query, location, num, timeFilter });

    // Vary time filters to get different results
    const timeFilters = {
      'recent': 'qdr:d',    // Past day
      'week': 'qdr:w',      // Past week  
      'month': 'qdr:m',     // Past month
      'mixed': Math.random() > 0.5 ? 'qdr:w' : 'qdr:m' // Random between week/month
    };

    // Add cache-busting timestamp
    const cacheBuster = Math.floor(Date.now() / 1000000); // Changes every ~16 minutes
    const enhancedQuery = `${query} ${cacheBuster}`.replace(/\d+$/, ''); // Remove the number to avoid weird searches

    // Construct SERP API URL
    const serpUrl = new URL('https://serpapi.com/search');
    serpUrl.searchParams.set('engine', 'google');
    serpUrl.searchParams.set('q', query); // Use original query, not enhanced
    serpUrl.searchParams.set('location', location);
    serpUrl.searchParams.set('num', Math.max(num, 15).toString()); // Get more results to have variety
    serpUrl.searchParams.set('api_key', serpApiKey);
    serpUrl.searchParams.set('tbm', 'nws'); // News search
    serpUrl.searchParams.set('tbs', timeFilters[timeFilter] || timeFilters.mixed);
    serpUrl.searchParams.set('start', Math.floor(Math.random() * 10).toString()); // Random start position

    console.log('Making SERP API request to:', serpUrl.toString());

    const response = await fetch(serpUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Lovable/1.0)'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SERP API error:', response.status, errorText);
      throw new Error(`SERP API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('SERP API response received');

    // Process and clean the news results
    const newsResults = data.news_results || [];
    const processedResults = newsResults.slice(0, 6).map((item: any) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      date: item.date || '',
      source: item.source || '',
      thumbnail: item.thumbnail || null,
      position: item.position || 0
    }));

    return new Response(JSON.stringify({ 
      success: true,
      results: processedResults,
      total: newsResults.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in serp-search function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});