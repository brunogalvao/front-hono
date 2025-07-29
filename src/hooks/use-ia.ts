import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getIA } from '@/service/ia/getIA';
import { queryKeys } from '@/lib/query-keys';
import { useIncomesByMonth } from './use-incomes-by-month';
import { useTasks } from './use-tasks';

export function useIA() {
  // Buscar dados de rendimentos para incluir na query key
  const { data: incomesData } = useIncomesByMonth();

  // Buscar dados de tarefas do mês atual
  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();
  const { data: tasksData } = useTasks(mesAtual, anoAtual);

  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [...queryKeys.ia.all, incomesData, tasksData],
    queryFn: () => getIA(incomesData), // Passar dados de rendimentos
    staleTime: 1000 * 10, // 10 segundos (mais frequente para atualizações)
    gcTime: 1000 * 60 * 1, // 1 minuto
    enabled: !!incomesData, // Só executa se tiver dados de rendimentos
    refetchOnWindowFocus: true, // Rebusca quando a janela ganha foco
    refetchOnMount: true, // Rebusca quando o componente monta
    refetchOnReconnect: true, // Rebusca quando reconecta à internet
    // Atualiza automaticamente quando os dados mudam
    refetchInterval: (data) => {
      // Se não há dados, não refaz
      if (!data) return false;

      // Se há dados, refaz a cada 30 segundos
      return 1000 * 30;
    },
    // Força refetch quando os dados de rendimentos ou tarefas mudam
    refetchIntervalInBackground: true,
  });

  // Função para forçar atualização
  const refetchIA = () => {
    console.log('🔄 Forçando atualização da análise IA...');
    return queryClient.invalidateQueries({
      queryKey: [...queryKeys.ia.all, incomesData, tasksData],
    });
  };

  return {
    ...query,
    refetchIA,
  };
}
