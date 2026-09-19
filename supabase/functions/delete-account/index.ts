import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );

    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user)
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: corsHeaders,
      });

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if user is superuser of any workspace with other members
    const { data: ownedWorkspaces } = await serviceClient
      .from('workspaces')
      .select('id, name')
      .eq('superuser_id', user.id);

    if (ownedWorkspaces && ownedWorkspaces.length > 0) {
      for (const ws of ownedWorkspaces) {
        const { count } = await serviceClient
          .from('workspace_members')
          .select('id', { count: 'exact', head: true })
          .eq('workspace_id', ws.id)
          .neq('user_id', user.id);

        if (count && count > 0) {
          return new Response(
            JSON.stringify({
              error: 'WORKSPACE_HAS_MEMBERS',
              error_code: 'WORKSPACE_HAS_MEMBERS',
              blocked_by_workspace: ws.id,
              workspace_name: ws.name,
            }),
            {
              status: 422,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    }

    // Delete user (cascade removes profile and memberships)
    const { error } = await serviceClient.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
