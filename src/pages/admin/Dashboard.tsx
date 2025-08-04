import TituloPage from '@/components/TituloPage';
import { useIA } from '@/hooks/use-ia';
import IARecommendations from '@/components/IARecommendations';
import { GoDotFill } from 'react-icons/go';
import { MdTipsAndUpdates } from 'react-icons/md';

import {
  DollarConversionSkeleton,
  StatusSkeleton,
  SummarySkeleton,
  TipsSkeleton,
} from '@/components/SkeletonDashboard';

const Dashboard = () => {
  // Hook para buscar dados da IA simplificados
  const { data: iaData, isLoading } = useIA();

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
