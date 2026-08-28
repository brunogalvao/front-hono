import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const CACHE_HOURS = 6;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS')
    return new Response('ok', { headers: corsHeaders });

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          Allow: 'POST',
        },
      });
    }

    const { workspace_id, period_month, period_year, scope } = await req.json();

    if (
      typeof workspace_id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        workspace_id
      ) ||
      !Number.isInteger(period_month) ||
      period_month < 1 ||
      period_month > 12 ||
      !Number.isInteger(period_year) ||
      period_year < 2020 ||
      period_year > 2100 ||
      !['individual', 'workspace'].includes(scope)
    ) {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Cache is always caller-scoped. Workspace insights may contain shared data,
    // but must never be readable or writable through a service-role bypass.
    const user_id = user.id;

    // Check cache (< CACHE_HOURS old)
    const cacheFrom = new Date(
      Date.now() - CACHE_HOURS * 60 * 60 * 1000
    ).toISOString();
    const { data: cached, error: cacheError } = await userClient
      .from('insights')
      .select('content, generated_at')
      .eq('workspace_id', workspace_id)
      .eq('user_id', user_id)
      .eq('scope', scope)
      .eq('period_month', period_month)
      .eq('period_year', period_year)
      .gte('generated_at', cacheFrom)
      .maybeSingle();

    if (cacheError) {
      console.warn('[generate-insights] cache read skipped:', cacheError.code);
    } else if (cached) {
      return new Response(
        JSON.stringify({ content: cached.content, cached: true }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch transactions
    const start = `${period_year}-${String(period_month).padStart(2, '0')}-01`;
    const lastDay = new Date(period_year, period_month, 0).getDate();
    const end = `${period_year}-${String(period_month).padStart(2, '0')}-${lastDay}`;

    let txQuery = userClient
      .from('transactions')
      .select('type, amount, description, date, categories(name)')
      .eq('workspace_id', workspace_id)
      .gte('date', start)
      .lte('date', end);

    if (scope === 'individual') txQuery = txQuery.eq('created_by', user.id);

    const { data: transactions, error: transactionsError } = await txQuery;

    if (transactionsError) {
      console.warn(
        '[generate-insights] transaction access denied:',
        transactionsError.code
      );
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!transactions || transactions.length === 0) {
      const empty = [] as object[];
      return new Response(JSON.stringify({ content: empty, cached: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build prompt
    const summary = transactions.reduce(
      (acc, t) => {
        const cat =
          (t.categories as { name?: string } | null)?.name ?? 'Outros';
        if (!acc[cat]) acc[cat] = { receita: 0, despesa: 0 };
        acc[cat][t.type as 'receita' | 'despesa'] += t.amount;
        return acc;
      },
      {} as Record<string, { receita: number; despesa: number }>
    );

    const summaryText = Object.entries(summary)
      .map(
        ([cat, vals]) =>
          `${cat}: receitas R$${vals.receita.toFixed(2)}, despesas R$${vals.despesa.toFixed(2)}`
      )
      .join('\n');

    const scopeLabel =
      scope === 'workspace' ? 'do workspace' : 'individual do usuário';
    const prompt = `Analise os gastos ${scopeLabel} do mês ${period_month}/${period_year}:

${summaryText}

Gere exatamente 3 insights financeiros em JSON. Cada insight deve ter: category (categoria), observation (observação em 1 frase), suggestion (sugestão prática em 1 frase).

Responda APENAS com JSON válido no formato:
[{"category":"...","observation":"...","suggestion":"..."}]`;

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
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
      console.error(
        '[generate-insights] Gemini error:',
        geminiResponse.status,
        errText
      );
      return new Response(
        JSON.stringify({
          error: 'GEMINI_ERROR',
          status: geminiResponse.status,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '[]';
    let content: object[];
    try {
      const match = rawText.match(/\[[\s\S]*\]/);
      content = match ? JSON.parse(match[0]) : [];
    } catch {
      content = [];
    }

    // Upsert cache
    const { error: cacheWriteError } = await userClient.from('insights').upsert(
      {
        workspace_id,
        user_id,
        scope,
        period_month,
        period_year,
        content,
        generated_at: new Date().toISOString(),
      },
      { onConflict: 'workspace_id,user_id,scope,period_month,period_year' }
    );

    if (cacheWriteError) {
      console.warn(
        '[generate-insights] cache write skipped:',
        cacheWriteError.code
      );
    }

    return new Response(JSON.stringify({ content, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[generate-insights] unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
