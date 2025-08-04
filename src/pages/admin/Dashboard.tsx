import TituloPage from '@/components/TituloPage';
// import DashboardCard from '@/components/dashboard-card';
import { useIA } from '@/hooks/use-ia';
// import { useIncomesByMonth } from '@/hooks/use-incomes-by-month';

// import { formatToBRL } from '@/utils/format';
// import { getNomeMes } from '@/model/mes.enum';
// import { DollarSign } from 'lucide-react';
import IARecommendations from '@/components/IARecommendations';
import { GoDotFill } from 'react-icons/go';
import { MdTipsAndUpdates } from 'react-icons/md';
import { Skeleton } from '@/components/ui/skeleton';

// Componente Skeleton para as dicas de economia
const TipsSkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-6 w-6" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para o status financeiro
const StatusSkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-3">
      <Skeleton className="h-6 w-6" />
      <div className="flex-1">
        <Skeleton className="mb-2 h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
      {[1, 2, 3, 4].map((index) => (
        <div key={index}>
          <Skeleton className="mb-1 h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para o resumo financeiro
const SummarySkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <div key={index} className="bg-muted/50 rounded-lg p-4 text-center">
          <Skeleton className="mx-auto mb-2 h-8 w-24" />
          <Skeleton className="mx-auto h-4 w-20" />
        </div>
      ))}
    </div>
  </div>
);

// Componente Skeleton para conversão de dólar
const DollarConversionSkeleton = () => (
  <div className="rounded-lg border bg-white p-6">
    <div className="mb-4 flex items-center gap-2">
      <Skeleton className="h-5 w-5" />
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="flex items-center justify-between">
      <div>
        <Skeleton className="mb-1 h-4 w-32" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="text-right">
        <Skeleton className="mb-1 h-4 w-36" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
    <div className="bg-muted/50 mt-4 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 flex-1" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  // Hook para buscar dados da IA simplificados
  const { data: iaData, isLoading, error } = useIA();

  // Hook para buscar rendimentos por mês (ainda usado para exibição no header)
  // const { data: salariosPorMes = {} } = useIncomesByMonth();

  // const mesAtual = new Date().getMonth() + 1;

  // Usar dados da IA ou fallback para valores locais
  // const totalMesAtual =
  //   iaData?.data?.rendimentoMes || salariosPorMes[mesAtual] || 0;
  // const totalPaidTasks = iaData?.data?.tarefasPagas || 0;
  // const totalPendingTasks = iaData?.data?.tarefasPendentes || 0;
  // const totalTasksCurrentMonth = iaData?.data?.totalTarefas || 0;
  // const dollarRate = iaData?.data?.cotacaoDolar;

  // Mostrar skeleton quando está carregando OU quando não há dados
  const shouldShowSkeleton = isLoading || !iaData?.data;

  return (
    <div className="space-y-6">
      <TituloPage titulo="Home" />

      {/* Dicas de Economia */}
      {shouldShowSkeleton ? (
        <TipsSkeleton />
      ) : (
        iaData?.data?.dicasEconomia &&
        iaData.data.dicasEconomia.length > 0 && (
          <div className="bg-muted rounded-lg p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-amber-500">
              <MdTipsAndUpdates />
              Dicas de Economia
            </h3>
            <ul className="grid grid-cols-2 gap-3">
              {iaData.data.dicasEconomia.map((dica, index) => (
                <li key={index} className="flex items-center gap-2">
                  <span className="text-green-600">
                    <GoDotFill />
                  </span>
                  <span className="text-sm">{dica}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* Análise da IA */}
      {shouldShowSkeleton ? (
        <div className="space-y-4">
          <StatusSkeleton />
          <div className="grid grid-cols-1 gap-4">
            <SummarySkeleton />
            <DollarConversionSkeleton />
          </div>
        </div>
      ) : (
        <IARecommendations />
      )}
    </div>
  );
};

export default Dashboard;
