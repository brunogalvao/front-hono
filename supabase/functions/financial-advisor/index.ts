import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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

    const { period } = (await req.json()) as {
      period: { month: number; year: number };
    };

    if (
      !Number.isInteger(period?.month) ||
      period.month < 1 ||
      period.month > 12 ||
      !Number.isInteger(period?.year) ||
      period.year < 2020 ||
      period.year > 2100
    ) {
      return new Response(JSON.stringify({ error: 'Período inválido.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: 'GEMINI_API_KEY não configurada.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Buscar despesas (tasks) do período
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('title, price, done, type')
      .eq('user_id', user.id)
      .eq('mes', period.month)
      .eq('ano', period.year);

    if (tasksError)
      throw new Error(`Erro ao buscar despesas: ${tasksError.message}`);

    // Buscar rendimentos do período
    const { data: incomes, error: incomesError } = await supabase
      .from('incomes')
      .select('descricao, valor')
      .eq('user_id', user.id)
      .eq('mes', period.month)
      .eq('ano', period.year);

    if (incomesError)
      throw new Error(`Erro ao buscar rendimentos: ${incomesError.message}`);

    const despesasPagas = tasks?.filter((t) => t.done === 'Pago') ?? [];
    const despesasPendentes = tasks?.filter((t) => t.done === 'Pendente') ?? [];
    const despesasFixas = tasks?.filter((t) => t.done === 'Fixo') ?? [];

    const totalDespesasPagas = despesasPagas.reduce(
      (s, t) => s + (t.price ?? 0),
      0
    );
    const totalDespesasPendentes = despesasPendentes.reduce(
      (s, t) => s + (t.price ?? 0),
      0
    );
    const totalDespesasFixas = despesasFixas.reduce(
      (s, t) => s + (t.price ?? 0),
      0
    );
    const totalDespesas =
      totalDespesasPagas + totalDespesasPendentes + totalDespesasFixas;
    const totalRendimentos =
      incomes?.reduce((s, i) => s + (i.valor ?? 0), 0) ?? 0;
    const saldoLiquido = totalRendimentos - totalDespesas;

    // Agrupar por categoria/tipo
    const categorias: Record<string, number> = {};
    for (const t of tasks ?? []) {
      const cat = t.type?.trim() || 'Sem categoria';
      categorias[cat] = (categorias[cat] ?? 0) + (t.price ?? 0);
    }
    const categoriaOrdenada = Object.entries(categorias).sort(
      (a, b) => b[1] - a[1]
    );
    const maiorCategoria = categoriaOrdenada[0];

    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const nomeMes = meses[period.month - 1] ?? String(period.month);

    const formatBRL = (v: number) =>
      v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const prompt = `Você é um consultor financeiro pessoal especializado no mercado brasileiro. Analise os dados financeiros abaixo e forneça uma análise completa em português.

## Dados Financeiros — ${nomeMes}/${period.year}

### Rendimentos
${
  incomes && incomes.length > 0
    ? incomes
        .map((i) => `- ${i.descricao || 'Rendimento'}: ${formatBRL(i.valor)}`)
        .join('\n')
    : '- Nenhum rendimento registrado'
}
**Total de rendimentos: ${formatBRL(totalRendimentos)}**

### Despesas
**Pagas:** ${formatBRL(totalDespesasPagas)}
${despesasPagas.map((t) => `- ${t.title} (${t.type || 'Sem categoria'}): ${formatBRL(t.price ?? 0)}`).join('\n') || '- Nenhuma'}

**Pendentes:** ${formatBRL(totalDespesasPendentes)}
${despesasPendentes.map((t) => `- ${t.title} (${t.type || 'Sem categoria'}): ${formatBRL(t.price ?? 0)}`).join('\n') || '- Nenhuma'}

**Fixas:** ${formatBRL(totalDespesasFixas)}
${despesasFixas.map((t) => `- ${t.title} (${t.type || 'Sem categoria'}): ${formatBRL(t.price ?? 0)}`).join('\n') || '- Nenhuma'}

**Total de despesas: ${formatBRL(totalDespesas)}**
**Saldo do mês: ${formatBRL(saldoLiquido)}**

### Gastos por categoria
${categoriaOrdenada.map(([cat, val]) => `- ${cat}: ${formatBRL(val)}`).join('\n') || '- Sem dados'}
${maiorCategoria ? `**Maior categoria de gasto: ${maiorCategoria[0]} (${formatBRL(maiorCategoria[1])})**` : ''}

---

Forneça uma análise estruturada com exatamente 3 seções, usando os títulos abaixo:

## 1. Diagnóstico do Período
Faça um resumo claro de receitas x despesas, o saldo resultante, qual foi a maior categoria de gasto e como está a saúde financeira geral do mês.

## 2. Alertas e Sugestões de Corte
Identifique comportamentos problemáticos, gastos que podem ser reduzidos ou eliminados. Seja específico com base nos dados fornecidos.

## 3. Recomendação de Investimento
${
  saldoLiquido > 0
    ? `Com saldo positivo de ${formatBRL(saldoLiquido)}, sugira estratégias de investimento adequadas ao contexto brasileiro: Tesouro Direto, CDB, LCI/LCA, FIIs, ações. Considere diferentes perfis de risco.`
    : `Com saldo negativo ou zerado de ${formatBRL(saldoLiquido)}, foque em estratégias de equilíbrio financeiro: como zerar dívidas, criar reserva de emergência e recuperar o orçamento.`
}

Use linguagem acessível, seja direto e prático. Não repita os dados brutos — interprete-os.`;

    // Chamar Gemini API com streaming
    const geminiUrl =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse';

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
      }),
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error(
        '[financial-advisor] Gemini error:',
        geminiResponse.status,
        errText
      );

      if (geminiResponse.status === 429) {
        let retrySeconds: number | null = null;
        try {
          const errJson = JSON.parse(errText);
          const retryInfo = errJson?.error?.details?.find(
            (d: { '@type': string }) =>
              d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
          );
          if (retryInfo?.retryDelay) {
            retrySeconds = parseInt(retryInfo.retryDelay.replace('s', ''), 10);
          }
        } catch {
          /* ignora */
        }

        return new Response(
          JSON.stringify({ error: 'QUOTA_EXCEEDED', retrySeconds }),
          {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      let geminiMessage = 'Erro ao conectar com o serviço de IA.';
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) geminiMessage = errJson.error.message;
      } catch {
        /* ignora */
      }

      return new Response(
        JSON.stringify({
          error: 'GEMINI_ERROR',
          message: geminiMessage,
          status: geminiResponse.status,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Relay do stream SSE para o cliente
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const reader = geminiResponse.body!.getReader();
      const decoder = new TextDecoder();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Extrair texto dos eventos SSE do Gemini
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (!data || data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) await writer.write(encoder.encode(text));
              } catch {
                // linha não é JSON válido, ignorar
              }
            }
          }
        }
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('[financial-advisor] unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Erro interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
