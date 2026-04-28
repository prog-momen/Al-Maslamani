// Supabase Edge Function: loyalty-points.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization')! } }
  })

  const { user } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  const url = new URL(req.url)
  const method = req.method

  if (url.pathname.endsWith('/points') && method === 'GET') {
    // Get current points
    const { data, error } = await supabase.from('loyalty_points').select('points').eq('user_id', user.id).single()
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ points: data?.points ?? 0 }), { headers: { 'Content-Type': 'application/json' } })
  }

  if (url.pathname.endsWith('/history') && method === 'GET') {
    // Get points history
    const { data, error } = await supabase.from('loyalty_points_history').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ history: data }), { headers: { 'Content-Type': 'application/json' } })
  }

  if (url.pathname.endsWith('/redeem') && method === 'POST') {
    // Redeem points
    const body = await req.json()
    const pointsToRedeem = body.points
    if (!pointsToRedeem || pointsToRedeem % 500 !== 0) {
      return new Response(JSON.stringify({ error: 'Points must be a multiple of 500' }), { status: 400 })
    }
    // Call SQL function
    const { data, error } = await supabase.rpc('redeem_loyalty_points', { _user_id: user.id, _points_to_redeem: pointsToRedeem })
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    return new Response(JSON.stringify({ discount: data }), { headers: { 'Content-Type': 'application/json' } })
  }

  return new Response('Not found', { status: 404 })
})
