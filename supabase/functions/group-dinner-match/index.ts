// Edge Function: Group Dinner Match
// Placeholder for complex group dining match algorithm
// TODO: Implement 6-factor matching algorithm from mobile app

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
    // Parse request
    const { participantIds, preferences } = await req.json()

    if (!participantIds || participantIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No participants provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // TODO: Implement matching algorithm
    // 1. Get all participants' want-to-try lists
    // 2. Find restaurants on multiple lists (overlaps)
    // 3. Calculate match score based on:
    //    - Number of participants who have it on list
    //    - Average rating
    //    - Dietary restrictions compatibility
    //    - Location (nearby for all participants)
    //    - Price range preferences
    //    - Availability (reservations)
    // 4. Return top matches sorted by score

    // For now, return placeholder response
    const { data: restaurants } = await supabaseClient
      .from('restaurants')
      .select('*')
      .limit(10)
      .order('rating', { ascending: false })

    return new Response(
      JSON.stringify({
        matches: restaurants?.map((r, idx) => ({
          restaurant: r,
          matchScore: 90 - (idx * 5), // Placeholder scores
          onListsCount: participantIds.length,
          participants: participantIds,
          matchReasons: [
            'High rating',
            'On multiple lists',
            'Nearby location',
          ],
        })) || [],
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
