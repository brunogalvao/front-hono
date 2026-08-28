import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } },
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Não autorizado' }), { status: 401, headers: corsHeaders });

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const [profile, memberships, transactions, recurring, installments] = await Promise.all([
      serviceClient.from('profiles').select('*').eq('id', user.id).single().then((r) => r.data),
      serviceClient.from('workspace_members').select('*, workspaces(id, name)').eq('user_id', user.id).then((r) => r.data ?? []),
      serviceClient.from('transactions').select('*').eq('created_by', user.id).order('date', { ascending: false }).then((r) => r.data ?? []),
      serviceClient.from('recurring_expenses').select('*').eq('created_by', user.id).then((r) => r.data ?? []),
      serviceClient.from('installments').select('*').eq('created_by', user.id).then((r) => r.data ?? []),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile,
      memberships,
      transactions,
      recurring_expenses: recurring,
      installments,
    };

    const json = JSON.stringify(exportData, null, 2);
    const filename = `finance-export-${user.id}-${new Date().toISOString().split('T')[0]}.json`;

    return new Response(json, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
