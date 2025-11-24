// Edge Function: Nearby Restaurants
// Find restaurants near a location using PostGIS

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
    // Parse request body
    const { lat, lng, radius = 2.0, minRating = 0.0, limit = 20 } = await req.json()

    // Validate parameters
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: lat and lng' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

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

    // Call PostgreSQL function
    const { data, error } = await supabaseClient.rpc('nearby_restaurants', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_miles: parseFloat(radius),
      min_rating: parseFloat(minRating),
      result_limit: parseInt(limit),
    })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ restaurants: data }),
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
