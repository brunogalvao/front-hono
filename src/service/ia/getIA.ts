import { supabase } from '@/lib/supabase';
import { API_BASE_URL } from '@/config/api';
import type { IncomeItem } from '@/model/incomes.model';

export interface IADashboard {
  rendimentoMes: number;
  rendimentoMesBRL: string;
  rendimentoDisponivel: number;
  rendimentoDisponivelBRL: string;
  percentualGasto: number;
  percentualDisponivel: number;
  tarefasPagas: number;
  tarefasPagasBRL: string;
  tarefasPendentes: number;
  tarefasPendentesBRL: string;
  totalTarefas: number;
  totalTarefasBRL: string;
}

export interface IAInvestimento {
  recomendado: number;
  recomendadoBRL: string;
  recomendadoUSD: { usd: string; brl: string };
  disponivel: number;
  disponivelBRL: string;
  disponivelUSD: { usd: string; brl: string };
  percentualSalario: number;
}

export interface IACotacaoDolar {
  valor: number;
  valorBRL: string;
  timestamp: string;
}

export interface IAEstrategiaInvestimento {
  curtoPrazo: string;
  medioPrazo: string;
  longoPrazo: string;
}

export interface IADistribuicaoInvestimento {
  poupanca: number;
  dolar: number;
  outros: number;
}

export interface IAAnalise {
  statusEconomia: 'bom' | 'regular' | 'critico';
  precisaEconomizar: boolean;
  economiaRecomendada: number;
  estrategiaInvestimento: IAEstrategiaInvestimento;
  dicasEconomia: string[];
  distribuicaoInvestimento: IADistribuicaoInvestimento;
  resumo: string;
}

export interface IAMetadata {
  timestamp: string;
  fonte: string;
  versao: string;
  ia: string;
  respostaIA: string;
}

export interface IAResponse {
  dashboard: IADashboard;
  investimento: IAInvestimento;
  cotacaoDolar: IACotacaoDolar;
  analise: IAAnalise;
  metadata: IAMetadata;
}

export interface IAFullResponse {
  success: boolean;
  data: IAResponse;
}

export async function getIA(
  incomesData?: Record<number, number>
): Promise<IAFullResponse> {
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

    // Buscar dados de tarefas reais
    let tarefasPagas = 0;
    let tarefasPendentes = 0;

    try {
      const tasksUrl = `${API_BASE_URL}/api/tasks?month=${mesAtual}&year=${anoAtual}`;
      console.log('📋 Buscando tarefas:', tasksUrl);

      const tasksResponse = await fetch(tasksUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📋 Status da resposta das tarefas:', tasksResponse.status);

      if (tasksResponse.ok) {
        const tasks = await tasksResponse.json();
        console.log('📋 Tarefas recebidas:', tasks);

        tarefasPagas = tasks
          .filter((task: any) => task.done === 'Pago')
          .reduce((sum: number, task: any) => sum + (task.price || 0), 0);

        tarefasPendentes = tasks
          .filter((task: any) => task.done !== 'Pago' && task.price)
          .reduce((sum: number, task: any) => sum + (task.price || 0), 0);

        console.log('📋 Dados de tarefas calculados:', {
          tarefasPagas,
          tarefasPendentes,
        });
      } else {
        const errorText = await tasksResponse.text();
        console.warn(
          '⚠️ Erro ao buscar tarefas:',
          tasksResponse.status,
          errorText
        );
        throw new Error(
          `Falha ao buscar dados de tarefas: ${tasksResponse.status} - ${errorText}`
        );
      }
    } catch (tasksError) {
      console.error('❌ Erro ao buscar tarefas:', tasksError);
      throw new Error('Não foi possível buscar dados de tarefas');
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
      console.log('💱 Dados completos da API:', dolarData);
    } catch (dolarError) {
      console.warn('⚠️ Erro ao buscar cotação do dólar:', dolarError);
      console.log('💱 Usando cotação fallback:', cotacaoDolar);
    }

    // Dados para enviar para o backend
    const dadosParaAnalise = {
      rendimentoMes: rendimentoMes,
      tarefasPagas: tarefasPagas,
      tarefasPendentes: tarefasPendentes,
      cotacaoDolar: cotacaoDolar,
    };

    console.log('📤 Dados enviados para análise:', dadosParaAnalise);

    // Verificar se todos os campos obrigatórios estão presentes
    const camposObrigatorios = [
      'rendimentoMes',
      'tarefasPagas',
      'tarefasPendentes',
      'cotacaoDolar',
    ];
    const camposFaltantes = camposObrigatorios.filter(
      (campo) =>
        dadosParaAnalise[campo as keyof typeof dadosParaAnalise] === undefined
    );

    if (camposFaltantes.length > 0) {
      console.error('❌ Campos obrigatórios faltando:', camposFaltantes);
      throw new Error(
        `Campos obrigatórios faltando: ${camposFaltantes.join(', ')}`
      );
    }

    // Agora fazer POST para análise completa
    const res = await fetch(`${API_BASE_URL}/api/ia/analise-investimento`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dadosParaAnalise),
    });

    console.log(`📡 Status da resposta: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ API IA não disponível (${res.status}): ${errorText}`);
      throw new Error(`Erro na API: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    console.log('✅ Análise de investimento recebida:', data);
    return data;
  } catch (error) {
    console.error('❌ Erro ao conectar com API IA:', error);
    throw error; // Propaga o erro em vez de usar mock
  }
}
