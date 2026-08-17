import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_HOURS = 6;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { workspace_id, period_month, period_year, scope } = await req.json();

    if (!workspace_id || !period_month || !period_year || !scope) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization');
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } },
    );

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const user_id = scope === 'individual' ? user.id : null;

    // Check cache (< CACHE_HOURS old)
    const cacheFrom = new Date(Date.now() - CACHE_HOURS * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('insights')
      .select('content, generated_at')
      .eq('workspace_id', workspace_id)
      .eq('scope', scope)
      .eq('period_month', period_month)
      .eq('period_year', period_year)
      .gte('generated_at', cacheFrom)
      .maybeSingle();

    if (scope === 'individual') {
      const { data: cachedIndividual } = await supabase
        .from('insights')
        .select('content, generated_at')
        .eq('workspace_id', workspace_id)
        .eq('user_id', user.id)
        .eq('scope', 'individual')
        .eq('period_month', period_month)
        .eq('period_year', period_year)
        .gte('generated_at', cacheFrom)
        .maybeSingle();

      if (cachedIndividual) {
        return new Response(JSON.stringify({ content: cachedIndividual.content, cached: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (cached) {
      return new Response(JSON.stringify({ content: cached.content, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch transactions
    const start = `${period_year}-${String(period_month).padStart(2, '0')}-01`;
    const lastDay = new Date(period_year, period_month, 0).getDate();
    const end = `${period_year}-${String(period_month).padStart(2, '0')}-${lastDay}`;

    let txQuery = supabase
      .from('transactions')
      .select('type, amount, description, date, categories(name)')
      .eq('workspace_id', workspace_id)
      .gte('date', start)
      .lte('date', end);

    if (scope === 'individual') txQuery = txQuery.eq('created_by', user.id);

    const { data: transactions } = await txQuery;

    if (!transactions || transactions.length === 0) {
      const empty = [] as object[];
      return new Response(JSON.stringify({ content: empty, cached: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build prompt
    const summary = transactions.reduce((acc, t) => {
      const cat = (t.categories as { name?: string } | null)?.name ?? 'Outros';
      if (!acc[cat]) acc[cat] = { receita: 0, despesa: 0 };
      acc[cat][t.type as 'receita' | 'despesa'] += t.amount;
      return acc;
    }, {} as Record<string, { receita: number; despesa: number }>);

    const summaryText = Object.entries(summary)
      .map(([cat, vals]) => `${cat}: receitas R$${vals.receita.toFixed(2)}, despesas R$${vals.despesa.toFixed(2)}`)
      .join('\n');

    const scopeLabel = scope === 'workspace' ? 'do workspace' : 'individual do usuário';
    const prompt = `Analise os gastos ${scopeLabel} do mês ${period_month}/${period_year}:

${summaryText}

Gere exatamente 3 insights financeiros em JSON. Cada insight deve ter: category (categoria), observation (observação em 1 frase), suggestion (sugestão prática em 1 frase).

Responda APENAS com JSON válido no formato:
[{"category":"...","observation":"...","suggestion":"..."}]`;

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': geminiApiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('[generate-insights] Gemini error:', geminiResponse.status, errText);
      return new Response(JSON.stringify({ error: 'GEMINI_ERROR', status: geminiResponse.status }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiResponse.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    let content: object[];
    try {
      const match = rawText.match(/\[[\s\S]*\]/);
      content = match ? JSON.parse(match[0]) : [];
    } catch {
      content = [];
    }

    // Upsert cache
    await supabase.from('insights').upsert({
      workspace_id,
      user_id: scope === 'individual' ? user.id : null,
      scope,
      period_month,
      period_year,
      content,
      generated_at: new Date().toISOString(),
    }, { onConflict: 'workspace_id,user_id,scope,period_month,period_year' });

    return new Response(JSON.stringify({ content, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
