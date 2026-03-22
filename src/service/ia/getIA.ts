import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';

export interface IASimplificada {
  despesasPagas: number;
  despesasPendentes: number;
  totalDespesas: number;
  rendimentoMes: number;
  percentualDisponivel: number;
  percentualGasto: number;
  dicasEconomia: string[];
  resultadoLiquido: number;
  cotacaoDolar: number;
  quantidadeDolar: number;
}

export interface IAResponse {
  success: boolean;
  data: IASimplificada;
}

export async function getIA(
  incomesData?: Record<number, number>
): Promise<IAResponse> {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;

  if (!token) throw new Error('Usuário não autenticado.');

  try {
    console.log('🔄 Fazendo requisição para análise de investimento...');
    console.log('📊 Dados de rendimentos:', incomesData);
    console.log(
      '🌐 URL da API:',
      `${API_BASE_URL}/api/ia/analise-investimento`
    );

    // Calcular dados do dashboard baseado nos rendimentos
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const rendimentoMes = incomesData?.[mesAtual] || 0;

    console.log('📅 Data atual:', { mesAtual, anoAtual, rendimentoMes });

    // Buscar dados de despesas reais
    let despesasPagas = 0;
    let despesasPendentes = 0;

    try {
      const tasksUrl = `${API_BASE_URL}/api/tasks?month=${mesAtual}&year=${anoAtual}`;
      console.log('📋 Buscando despesas:', tasksUrl);

      const tasksResponse = await fetch(tasksUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📋 Status da resposta das despesas:', tasksResponse.status);

      if (tasksResponse.ok) {
        const tasks = (await tasksResponse.json()) as Array<{
          done: string; // "Pago" | "Pendente"
          price?: number;
        }>;
        console.log('📋 Despesas recebidas:', tasks.length);

        const despesasPagasArray = tasks.filter((task) => {
          const isPago = task.done === 'Pago';
          const hasPrice =
            task.price !== null && task.price !== undefined && task.price > 0;
          return isPago && hasPrice;
        });

        const despesasPendentesArray = tasks.filter((task) => {
          const isPendente = task.done === 'Pendente';
          const hasPrice =
            task.price !== null && task.price !== undefined && task.price > 0;
          return isPendente && hasPrice;
        });

        despesasPagas = despesasPagasArray.reduce((sum: number, task) => {
          return sum + (Number(task.price) || 0);
        }, 0);

        despesasPendentes = despesasPendentesArray.reduce((sum: number, task) => {
          return sum + (Number(task.price) || 0);
        }, 0);

        console.log('📋 Despesas calculadas:', {
          pagas: despesasPagasArray.length,
          pendentes: despesasPendentesArray.length,
          valorPago: despesasPagas,
          valorPendente: despesasPendentes,
        });
      } else {
        const errorText = await tasksResponse.text();
        console.warn(
          '⚠️ Erro ao buscar despesas:',
          tasksResponse.status,
          errorText
        );
        throw new Error(
          `Falha ao buscar dados de despesas: ${tasksResponse.status} - ${errorText}`
        );
      }
    } catch (tasksError) {
      console.warn('⚠️ Erro ao buscar despesas, usando valores zerados:', tasksError);
      // continua com despesasPagas = 0 e despesasPendentes = 0
    }

    // Buscar cotação do dólar em tempo real
    let cotacaoDolar = 5.25; // Fallback
    try {
      console.log('💱 Buscando cotação do dólar...');
      const dolarResponse = await fetch(
        'https://economia.awesomeapi.com.br/last/USD-BRL'
      );
      const dolarData = await dolarResponse.json();
      cotacaoDolar = parseFloat(dolarData.USDBRL.bid);
      console.log('💱 Cotação do dólar recebida:', cotacaoDolar);
    } catch (dolarError) {
      console.warn('⚠️ Erro ao buscar cotação do dólar:', dolarError);
      console.log('💱 Usando cotação fallback:', cotacaoDolar);
    }

    // Calcular dados simplificados
    const totalDespesas = despesasPagas + despesasPendentes;
    const resultadoLiquido = Math.max(0, rendimentoMes - despesasPagas);
    const percentualGasto =
      rendimentoMes > 0 ? (despesasPagas / rendimentoMes) * 100 : 0;
    const percentualDisponivel = 100 - percentualGasto;
    const quantidadeDolar = resultadoLiquido / cotacaoDolar;

    // Gerar dicas baseadas no percentual gasto
    const dicasEconomia = gerarDicasEconomia(percentualGasto);

    const dadosSimplificados: IASimplificada = {
      despesasPagas,
      despesasPendentes,
      totalDespesas,
      rendimentoMes,
      percentualDisponivel: Math.round(percentualDisponivel),
      percentualGasto: Math.round(percentualGasto),
      dicasEconomia,
      resultadoLiquido,
      cotacaoDolar,
      quantidadeDolar,
    };

    console.log('✅ Dados simplificados calculados:', dadosSimplificados);

    return {
      success: true,
      data: dadosSimplificados,
    };
  } catch (error) {
    console.error('❌ Erro ao processar dados IA:', error);
    console.warn('⚠️ Usando dados calculados com fallback');
    return generateMockResponse(incomesData);
  }
}

// Função para gerar dicas baseadas no percentual gasto
function gerarDicasEconomia(percentualGasto: number): string[] {
  if (percentualGasto < 50) {
    return [
      'Excelente controle financeiro! Continue assim.',
      'Considere aumentar seus investimentos.',
      'Mantenha uma reserva de emergência.',
    ];
  } else if (percentualGasto < 70) {
    return [
      'Bom controle financeiro, mas há espaço para melhorar.',
      'Revise gastos desnecessários.',
      'Estabeleça metas de economia mensais.',
    ];
  } else if (percentualGasto < 90) {
    return [
      'Atenção: você está gastando muito da sua renda.',
      'Corte gastos supérfluos urgentemente.',
      'Crie um orçamento detalhado.',
    ];
  } else {
    return [
      'ALERTA: situação financeira crítica!',
      'Corte todos os gastos não essenciais.',
      'Busque fontes de renda extra.',
      'Considere renegociar dívidas.',
    ];
  }
}

// Função para gerar resposta mock temporária
function generateMockResponse(
  incomesData?: Record<number, number>
): IAResponse {
  const mesAtual = new Date().getMonth() + 1;
  const rendimentoMes = incomesData?.[mesAtual] || 5000;
  const despesasPagas = 3000;
  const despesasPendentes = 1000;
  const totalDespesas = despesasPagas + despesasPendentes;
  const resultadoLiquido = Math.max(0, rendimentoMes - despesasPagas);
  const percentualGasto = (despesasPagas / rendimentoMes) * 100;
  const percentualDisponivel = 100 - percentualGasto;
  const cotacaoDolar = 5.25;
  const quantidadeDolar = resultadoLiquido / cotacaoDolar;

  return {
    success: true,
    data: {
      despesasPagas,
      despesasPendentes,
      totalDespesas,
      rendimentoMes,
      percentualDisponivel: Math.round(percentualDisponivel),
      percentualGasto: Math.round(percentualGasto),
      dicasEconomia: gerarDicasEconomia(percentualGasto),
      resultadoLiquido,
      cotacaoDolar,
      quantidadeDolar,
    },
  };
}
