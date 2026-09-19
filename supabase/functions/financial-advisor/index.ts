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

    const { period, locale: requestedLocale } = (await req.json()) as {
      period: { month: number; year: number };
      locale?: 'pt-BR' | 'en';
    };
    const locale = requestedLocale === 'en' ? 'en' : 'pt-BR';
    const isEnglish = locale === 'en';

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

    const nomeMes = new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'pt-BR', {
      month: 'long',
      timeZone: 'UTC',
    }).format(new Date(Date.UTC(period.year, period.month - 1, 1)));

    const formatBRL = (v: number) =>
      v.toLocaleString(isEnglish ? 'en-US' : 'pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

    const noCategory = isEnglish ? 'Uncategorized' : 'Sem categoria';
    const none = isEnglish ? '- None' : '- Nenhuma';
    const incomeLines =
      incomes && incomes.length > 0
        ? incomes
            .map(
              (income) =>
                `- ${income.descricao || (isEnglish ? 'Income' : 'Rendimento')}: ${formatBRL(income.valor)}`
            )
            .join('\n')
        : isEnglish
          ? '- No income recorded'
          : '- Nenhum rendimento registrado';
    const expenseLines = (items: typeof despesasPagas) =>
      items
        .map(
          (task) =>
            `- ${task.title} (${task.type || noCategory}): ${formatBRL(task.price ?? 0)}`
        )
        .join('\n') || none;
    const categoryLines =
      categoriaOrdenada
        .map(([category, value]) => `- ${category}: ${formatBRL(value)}`)
        .join('\n') || (isEnglish ? '- No data' : '- Sem dados');

    const prompt = isEnglish
      ? `You are a personal financial advisor specializing in the Brazilian market. Analyze the financial data below and provide the complete analysis in English.

## Financial Data — ${nomeMes}/${period.year}

### Income
${incomeLines}
**Total income: ${formatBRL(totalRendimentos)}**

### Expenses
**Paid:** ${formatBRL(totalDespesasPagas)}
${expenseLines(despesasPagas)}

**Pending:** ${formatBRL(totalDespesasPendentes)}
${expenseLines(despesasPendentes)}

**Recurring:** ${formatBRL(totalDespesasFixas)}
${expenseLines(despesasFixas)}

**Total expenses: ${formatBRL(totalDespesas)}**
**Monthly balance: ${formatBRL(saldoLiquido)}**

### Spending by category
${categoryLines}
${maiorCategoria ? `**Largest spending category: ${maiorCategoria[0]} (${formatBRL(maiorCategoria[1])})**` : ''}

Provide an analysis with exactly three sections using these headings:

## 1. Period Diagnosis
Clearly summarize income versus expenses, the resulting balance, the largest spending category, and the month's overall financial health.

## 2. Alerts and Cut Suggestions
Identify problematic patterns and expenses that could be reduced or eliminated. Be specific and use the supplied data.

## 3. Investment Recommendation
${saldoLiquido > 0 ? `With a positive balance of ${formatBRL(saldoLiquido)}, suggest investments suitable for the Brazilian market, considering different risk profiles.` : `With a non-positive balance of ${formatBRL(saldoLiquido)}, focus on restoring balance, reducing debt, and building an emergency fund.`}

Use accessible language and be direct and practical. Interpret the data instead of repeating it.`
      : `Você é um consultor financeiro pessoal especializado no mercado brasileiro. Analise os dados financeiros abaixo e forneça uma análise completa em português.

## Dados Financeiros — ${nomeMes}/${period.year}

### Rendimentos
${incomeLines}
**Total de rendimentos: ${formatBRL(totalRendimentos)}**

### Despesas
**Pagas:** ${formatBRL(totalDespesasPagas)}
${expenseLines(despesasPagas)}

**Pendentes:** ${formatBRL(totalDespesasPendentes)}
${expenseLines(despesasPendentes)}

**Fixas:** ${formatBRL(totalDespesasFixas)}
${expenseLines(despesasFixas)}

**Total de despesas: ${formatBRL(totalDespesas)}**
**Saldo do mês: ${formatBRL(saldoLiquido)}**

### Gastos por categoria
${categoryLines}
${maiorCategoria ? `**Maior categoria de gasto: ${maiorCategoria[0]} (${formatBRL(maiorCategoria[1])})**` : ''}

Forneça uma análise estruturada com exatamente 3 seções, usando os títulos abaixo:

## 1. Diagnóstico do Período
Faça um resumo claro de receitas x despesas, o saldo resultante, qual foi a maior categoria de gasto e como está a saúde financeira geral do mês.

## 2. Alertas e Sugestões de Corte
Identifique comportamentos problemáticos, gastos que podem ser reduzidos ou eliminados. Seja específico com base nos dados fornecidos.

## 3. Recomendação de Investimento
${saldoLiquido > 0 ? `Com saldo positivo de ${formatBRL(saldoLiquido)}, sugira estratégias de investimento adequadas ao contexto brasileiro: Tesouro Direto, CDB, LCI/LCA, FIIs, ações. Considere diferentes perfis de risco.` : `Com saldo negativo ou zerado de ${formatBRL(saldoLiquido)}, foque em estratégias de equilíbrio financeiro: como zerar dívidas, criar reserva de emergência e recuperar o orçamento.`}

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
        generationConfig: {
          maxOutputTokens: 1536,
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 0 },
        },
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
