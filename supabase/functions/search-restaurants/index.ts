// Edge Function: Search Restaurants
// Advanced restaurant search with multiple filters

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse query parameters from URL or body
    const url = new URL(req.url)
    const query = url.searchParams.get('q') || ''
    const cuisine = url.searchParams.get('cuisine')?.split(',') || null
    const priceRange = url.searchParams.get('price_range')?.split(',') || null
    const city = url.searchParams.get('city') || null
    const neighborhood = url.searchParams.get('neighborhood') || null
    const category = url.searchParams.get('category') || null
    const minRating = parseFloat(url.searchParams.get('min_rating') || '0')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Call PostgreSQL search function
    const { data, error } = await supabaseClient.rpc('search_restaurants', {
      search_query: query,
      filter_cuisine: cuisine,
      filter_price: priceRange,
      filter_city: city,
      filter_neighborhood: neighborhood,
      filter_category: category,
      min_rating: minRating,
      result_limit: limit,
      result_offset: offset,
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({
        results: data,
        count: data?.length || 0,
        query: {
          q: query,
          cuisine,
          priceRange,
          city,
          neighborhood,
          category,
          minRating,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
