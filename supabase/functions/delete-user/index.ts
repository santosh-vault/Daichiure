import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return corsResponse({}, 204);
  }

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return corsResponse({ error: 'User ID is required' }, 400);
    }

    // Use the admin client to delete the user from the auth schema
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);

    if (error) {
      console.error('Error deleting user:', error);
      return corsResponse({ error: error.message }, 500);
    }

    return corsResponse({ message: 'User deleted successfully' }, 200);

  } catch (error) {
    console.error('Unexpected error:', error);
    return corsResponse({ error: 'Internal Server Error' }, 500);
  }
}); 